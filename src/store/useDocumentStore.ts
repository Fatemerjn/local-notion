import { create } from "zustand";
import type {
  Block,
  BlockType,
  Document,
  DocumentStore,
  PersistedWorkspaceState,
  ProjectRow,
  ReplaceDocumentsPayload,
  UpdateDocumentPayload,
  Workspace,
} from "@/types";
import {
  createNewBlock,
  createProjectRow,
  DEFAULT_DATABASE_COLUMNS,
  DEFAULT_DATABASE_OPTIONS,
} from "@/utils/blockUtils";
import {
  cloneBlock,
  createWorkspaceModel,
  createBlankDocument,
  DEFAULT_TITLE,
  ensureDocuments,
  loadWorkspace,
  normalizeDocument,
  normalizeWorkspace,
  persistWorkspace,
} from "./documentStore.utils";

const initialWorkspace = loadWorkspace();

const createNextState = (
  state: PersistedWorkspaceState,
  updates: Partial<PersistedWorkspaceState>,
): PersistedWorkspaceState => ({
  workspaces: updates.workspaces ?? state.workspaces,
  activeWorkspaceId: updates.activeWorkspaceId ?? state.activeWorkspaceId,
  documents: updates.documents ?? state.documents,
  activeDocId:
    updates.activeDocId === undefined ? state.activeDocId : updates.activeDocId,
});

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  ...initialWorkspace,

  createWorkspace: (name = "Workspace") => {
    const workspace = createWorkspaceModel(name);
    const home = {
      ...createBlankDocument("Home"),
      workspaceId: workspace.id,
      icon: "🏠",
    };

    set((state) => {
      const nextState = createNextState(state, {
        workspaces: [...state.workspaces, workspace],
        activeWorkspaceId: workspace.id,
        documents: [home, ...state.documents],
        activeDocId: home.id,
      });
      persistWorkspace(nextState);
      return nextState;
    });

    return workspace.id;
  },

  updateWorkspace: (id: string, updates: Partial<Workspace>) =>
    set((state) => {
      const nextState = createNextState(state, {
        workspaces: state.workspaces.map((workspace) =>
          workspace.id === id
            ? { ...workspace, ...updates, updatedAt: new Date() }
            : workspace,
        ),
      });
      persistWorkspace(nextState);
      return nextState;
    }),

  deleteWorkspace: (id: string) =>
    set((state) => {
      if (state.workspaces.length <= 1) {
        return {};
      }

      const workspaces = state.workspaces.filter((workspace) => workspace.id !== id);
      const documents = state.documents.filter((document) => document.workspaceId !== id);
      const activeWorkspaceId =
        state.activeWorkspaceId === id ? workspaces[0].id : state.activeWorkspaceId;
      const activeDocId = documents.some((document) => document.id === state.activeDocId)
        ? state.activeDocId
        : documents.find((document) => document.workspaceId === activeWorkspaceId)?.id ??
          documents[0]?.id ??
          null;
      const nextState = createNextState(state, {
        workspaces,
        activeWorkspaceId,
        documents,
        activeDocId,
      });
      persistWorkspace(nextState);
      return nextState;
    }),

  setActiveWorkspaceId: (id: string) =>
    set((state) => {
      if (!state.workspaces.some((workspace) => workspace.id === id)) {
        return {};
      }

      const activeDocId =
        state.documents.find((document) => document.workspaceId === id)?.id ?? null;
      const nextState = createNextState(state, {
        activeWorkspaceId: id,
        activeDocId,
      });
      persistWorkspace(nextState);
      return nextState;
    }),

  createDocument: (title = DEFAULT_TITLE, options) => {
    const workspaceId =
      options?.workspaceId ?? get().activeWorkspaceId ?? get().workspaces[0]?.id;
    if (!workspaceId) {
      return "";
    }

    const isDatabaseTemplate = options?.template === "database";
    const baseDocument = createBlankDocument(title);
    const newDocument = {
      ...baseDocument,
      workspaceId,
      parentId: options?.parentId ?? null,
      icon: isDatabaseTemplate ? "📊" : "📄",
      layout: isDatabaseTemplate ? ("database" as const) : ("page" as const),
      blocks: isDatabaseTemplate
        ? [createNewBlock("database", title)]
        : baseDocument.blocks,
    };

    set((state) => {
      const nextState = createNextState(state, {
        documents: [newDocument, ...state.documents],
        activeDocId: newDocument.id,
        activeWorkspaceId: workspaceId,
      });
      persistWorkspace(nextState);
      return nextState;
    });

    return newDocument.id;
  },

  createChildDocument: (parentId: string, title = DEFAULT_TITLE) => {
    const parent = get().documents.find((document) => document.id === parentId);
    if (!parent) {
      return null;
    }

    return get().createDocument(title, {
      workspaceId: parent.workspaceId,
      parentId,
    });
  },

  duplicateDocument: (id: string) => {
    const source = get().documents.find((document) => document.id === id);
    if (!source) {
      return null;
    }

    const now = new Date();
    const duplicate: Document = {
      ...source,
      id: crypto.randomUUID(),
      title: `${source.title} copy`,
      blocks: source.blocks.map((block) => cloneBlock(block)),
      createdAt: now,
      updatedAt: now,
    };

    set((state) => {
      const sourceIndex = state.documents.findIndex((document) => document.id === id);
      const documents = [...state.documents];
      documents.splice(sourceIndex + 1, 0, duplicate);
      const nextState = createNextState(state, {
        documents,
        activeDocId: duplicate.id,
        activeWorkspaceId: duplicate.workspaceId,
      });
      persistWorkspace(nextState);
      return nextState;
    });

    return duplicate.id;
  },

  replaceDocuments: (payload: ReplaceDocumentsPayload) => {
    const fallbackWorkspace = get().workspaces[0] ?? createWorkspaceModel();
    const workspaces = payload.workspaces
      ? payload.workspaces.map((workspace) => normalizeWorkspace(workspace))
      : get().workspaces.length > 0
        ? get().workspaces
        : [fallbackWorkspace];
    const activeWorkspaceId = workspaces.some(
      (workspace) => workspace.id === payload.activeWorkspaceId,
    )
      ? payload.activeWorkspaceId ?? workspaces[0].id
      : workspaces[0].id;
    const documents = ensureDocuments(
      payload.documents.map((document) =>
        normalizeDocument(document, activeWorkspaceId),
      ),
    );
    const activeDocId = documents.some((document) => document.id === payload.activeDocId)
      ? payload.activeDocId ?? documents[0].id
      : documents[0].id;

    const nextState = {
      workspaces,
      activeWorkspaceId,
      documents,
      activeDocId,
    };

    persistWorkspace(nextState);
    set(nextState);
  },

  setActiveDocId: (id: string) =>
    set((state) => {
      if (!state.documents.some((document) => document.id === id)) {
        return {};
      }

      const nextState = createNextState(state, {
        documents: state.documents,
        activeDocId: id,
        activeWorkspaceId:
          state.documents.find((document) => document.id === id)?.workspaceId ??
          state.activeWorkspaceId,
      });
      persistWorkspace(nextState);
      return nextState;
    }),

  updateDocument: (id: string, updates: UpdateDocumentPayload) =>
    set((state) => {
      const documents = state.documents.map((document) =>
        document.id === id
          ? {
              ...document,
              ...updates,
              updatedAt: new Date(),
            }
          : document,
      );
      const nextState = createNextState(state, {
        documents,
        activeDocId: state.activeDocId,
      });
      persistWorkspace(nextState);
      return nextState;
    }),

  updateDocumentTitle: (id: string, title: string) =>
    set((state) => {
      const documents = state.documents.map((document) =>
        document.id === id
          ? { ...document, title, updatedAt: new Date() }
          : document,
      );
      const nextState = createNextState(state, {
        documents,
        activeDocId: state.activeDocId,
      });
      persistWorkspace(nextState);
      return nextState;
    }),

  deleteDocument: (id: string) =>
    set((state) => {
      const idsToDelete = new Set([id]);
      let changed = true;
      while (changed) {
        changed = false;
        state.documents.forEach((document) => {
          if (document.parentId && idsToDelete.has(document.parentId)) {
            changed = !idsToDelete.has(document.id) || changed;
            idsToDelete.add(document.id);
          }
        });
      }
      const filteredDocuments = state.documents.filter(
        (document) => !idsToDelete.has(document.id),
      );
      const remainingDocuments =
        filteredDocuments.length > 0
          ? filteredDocuments
          : [
              {
                ...createBlankDocument(),
                workspaceId: state.activeWorkspaceId ?? state.workspaces[0].id,
              },
            ];
      const activeDocId = remainingDocuments.some(
        (document) => document.id === state.activeDocId,
      )
        ? state.activeDocId
        : remainingDocuments[0].id;
      const nextState = createNextState(state, {
        documents: remainingDocuments,
        activeDocId,
      });
      persistWorkspace(nextState);
      return nextState;
    }),

  addBlock: (type = "text", options) => {
    const targetDocId = options?.docId ?? get().activeDocId;
    if (!targetDocId) {
      return null;
    }

    const newBlock = createNewBlock(type);

    set((state) => {
      const documents = state.documents.map((document) => {
        if (document.id !== targetDocId) {
          return document;
        }

        const blocks = [...document.blocks];
        const afterIndex = options?.afterBlockId
          ? blocks.findIndex((block) => block.id === options.afterBlockId)
          : blocks.length - 1;
        const insertIndex = afterIndex >= 0 ? afterIndex + 1 : blocks.length;
        blocks.splice(insertIndex, 0, newBlock);

        return {
          ...document,
          blocks,
          updatedAt: new Date(),
        };
      });

      const nextState = createNextState(state, {
        documents,
        activeDocId: state.activeDocId,
      });
      persistWorkspace(nextState);
      return nextState;
    });

    return newBlock.id;
  },

  updateBlock: (id: string, updates: Partial<Block>, docId?: string) =>
    set((state) => {
      const targetDocId = docId ?? state.activeDocId;
      if (!targetDocId) {
        return {};
      }

      const documents = state.documents.map((document) => {
        if (document.id !== targetDocId) {
          return document;
        }

        return {
          ...document,
          blocks: document.blocks.map((block) =>
            block.id === id
              ? {
                  ...block,
                  ...updates,
                  updatedAt: new Date(),
                }
              : block,
          ),
          updatedAt: new Date(),
        };
      });

      const nextState = createNextState(state, {
        documents,
        activeDocId: state.activeDocId,
      });
      persistWorkspace(nextState);
      return nextState;
    }),

  deleteBlock: (id: string, docId?: string) =>
    set((state) => {
      const targetDocId = docId ?? state.activeDocId;
      if (!targetDocId) {
        return {};
      }

      const documents = state.documents.map((document) => {
        if (document.id !== targetDocId) {
          return document;
        }

        const nextBlocks = document.blocks.filter((block) => block.id !== id);

        return {
          ...document,
          blocks: nextBlocks.length > 0 ? nextBlocks : [createNewBlock("text")],
          updatedAt: new Date(),
        };
      });

      const nextState = createNextState(state, {
        documents,
        activeDocId: state.activeDocId,
      });
      persistWorkspace(nextState);
      return nextState;
    }),

  moveBlock: (fromIndex: number, toIndex: number, docId?: string) =>
    set((state) => {
      const targetDocId = docId ?? state.activeDocId;
      if (!targetDocId) {
        return {};
      }

      const documents = state.documents.map((document) => {
        if (document.id !== targetDocId) {
          return document;
        }

        const blocks = [...document.blocks];
        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= blocks.length ||
          toIndex >= blocks.length
        ) {
          return document;
        }

        const [moved] = blocks.splice(fromIndex, 1);
        blocks.splice(toIndex, 0, moved);

        return {
          ...document,
          blocks,
          updatedAt: new Date(),
        };
      });

      const nextState = createNextState(state, {
        documents,
        activeDocId: state.activeDocId,
      });
      persistWorkspace(nextState);
      return nextState;
    }),

  setBlockType: (id: string, type: BlockType, docId?: string) =>
    set((state) => {
      const targetDocId = docId ?? state.activeDocId;
      if (!targetDocId) {
        return {};
      }

      const documents = state.documents.map((document) => {
        if (document.id !== targetDocId) {
          return document;
        }

        return {
          ...document,
          blocks: document.blocks.map((block) =>
            block.id === id
              ? {
                  ...block,
                  type,
                checked: type === "todo" ? block.checked ?? false : undefined,
                collapsed:
                  type === "toggle" ? block.collapsed ?? false : undefined,
                content: type === "divider" ? "" : block.content,
                properties:
                  type === "database"
                    ? block.properties?.database
                      ? block.properties
                      : createNewBlock("database").properties
                    : undefined,
                updatedAt: new Date(),
              }
            : block,
          ),
          updatedAt: new Date(),
        };
      });

      const nextState = createNextState(state, {
        documents,
        activeDocId: state.activeDocId,
      });
      persistWorkspace(nextState);
      return nextState;
    }),

  toggleBlockChecked: (id: string, docId?: string) =>
    set((state) => {
      const targetDocId = docId ?? state.activeDocId;
      if (!targetDocId) {
        return {};
      }

      const documents = state.documents.map((document) => {
        if (document.id !== targetDocId) {
          return document;
        }

        return {
          ...document,
          blocks: document.blocks.map((block) =>
            block.id === id
              ? {
                  ...block,
                  checked: !block.checked,
                  updatedAt: new Date(),
                }
              : block,
          ),
          updatedAt: new Date(),
        };
      });

      const nextState = createNextState(state, {
        documents,
        activeDocId: state.activeDocId,
      });
      persistWorkspace(nextState);
      return nextState;
    }),

  toggleBlockCollapsed: (id: string, docId?: string) =>
    set((state) => {
      const targetDocId = docId ?? state.activeDocId;
      if (!targetDocId) {
        return {};
      }

      const documents = state.documents.map((document) => {
        if (document.id !== targetDocId) {
          return document;
        }

        return {
          ...document,
          blocks: document.blocks.map((block) =>
            block.id === id
              ? {
                  ...block,
                  collapsed: !block.collapsed,
                  updatedAt: new Date(),
                }
              : block,
          ),
          updatedAt: new Date(),
        };
      });

      const nextState = createNextState(state, {
        documents,
        activeDocId: state.activeDocId,
      });
      persistWorkspace(nextState);
      return nextState;
    }),

  duplicateBlock: (id: string, docId?: string) => {
    const state = get();
    const targetDocId = docId ?? state.activeDocId;
    const document = state.documents.find((entry) => entry.id === targetDocId);
    const block = document?.blocks.find((entry) => entry.id === id);

    if (!document || !block) {
      return null;
    }

    const duplicate = cloneBlock(block);

    set((currentState) => {
      const documents = currentState.documents.map((entry) => {
        if (entry.id !== targetDocId) {
          return entry;
        }

        const blocks = [...entry.blocks];
        const index = blocks.findIndex((existingBlock) => existingBlock.id === id);
        blocks.splice(index + 1, 0, duplicate);

        return {
          ...entry,
          blocks,
          updatedAt: new Date(),
        };
      });

      const nextState = createNextState(currentState, {
        documents,
        activeDocId: currentState.activeDocId,
      });
      persistWorkspace(nextState);
      return nextState;
    });

    return duplicate.id;
  },

  addProjectRow: (blockId: string, docId?: string) => {
    const targetDocId = docId ?? get().activeDocId;
    if (!targetDocId) {
      return null;
    }

    const row = createProjectRow("New project");

    set((state) => {
      const documents = state.documents.map((document) => {
        if (document.id !== targetDocId) {
          return document;
        }

        return {
          ...document,
          blocks: document.blocks.map((block) =>
            block.id === blockId && block.type === "database"
              ? {
                  ...block,
                  properties: {
                    database: {
                      view: block.properties?.database?.view ?? "table",
                      columns:
                        block.properties?.database?.columns ??
                        DEFAULT_DATABASE_COLUMNS,
                      options:
                        block.properties?.database?.options ??
                        DEFAULT_DATABASE_OPTIONS,
                      projects: [
                        ...(block.properties?.database?.projects ?? []),
                        row,
                      ],
                    },
                  },
                  updatedAt: new Date(),
                }
              : block,
          ),
          updatedAt: new Date(),
        };
      });
      const nextState = createNextState(state, {
        documents,
        activeDocId: state.activeDocId,
      });
      persistWorkspace(nextState);
      return nextState;
    });

    return row.id;
  },

  updateProjectRow: (
    blockId: string,
    rowId: string,
    updates: Partial<ProjectRow>,
    docId?: string,
  ) =>
    set((state) => {
      const targetDocId = docId ?? state.activeDocId;
      if (!targetDocId) {
        return {};
      }

      const documents = state.documents.map((document) => {
        if (document.id !== targetDocId) {
          return document;
        }

        return {
          ...document,
          blocks: document.blocks.map((block) =>
            block.id === blockId && block.type === "database"
              ? {
                  ...block,
                  properties: {
                    database: {
                      view: block.properties?.database?.view ?? "table",
                      columns:
                        block.properties?.database?.columns ??
                        DEFAULT_DATABASE_COLUMNS,
                      options:
                        block.properties?.database?.options ??
                        DEFAULT_DATABASE_OPTIONS,
                      projects: (
                        block.properties?.database?.projects ?? []
                      ).map((row) =>
                        row.id === rowId
                          ? { ...row, ...updates, updatedAt: new Date() }
                          : row,
                      ),
                    },
                  },
                  updatedAt: new Date(),
                }
              : block,
          ),
          updatedAt: new Date(),
        };
      });
      const nextState = createNextState(state, {
        documents,
        activeDocId: state.activeDocId,
      });
      persistWorkspace(nextState);
      return nextState;
    }),

  deleteProjectRow: (blockId: string, rowId: string, docId?: string) =>
    set((state) => {
      const targetDocId = docId ?? state.activeDocId;
      if (!targetDocId) {
        return {};
      }

      const documents = state.documents.map((document) => {
        if (document.id !== targetDocId) {
          return document;
        }

        return {
          ...document,
          blocks: document.blocks.map((block) =>
            block.id === blockId && block.type === "database"
              ? {
                  ...block,
                  properties: {
                    database: {
                      view: block.properties?.database?.view ?? "table",
                      columns:
                        block.properties?.database?.columns ??
                        DEFAULT_DATABASE_COLUMNS,
                      options:
                        block.properties?.database?.options ??
                        DEFAULT_DATABASE_OPTIONS,
                      projects: (
                        block.properties?.database?.projects ?? []
                      ).filter((row) => row.id !== rowId),
                    },
                  },
                  updatedAt: new Date(),
                }
              : block,
          ),
          updatedAt: new Date(),
        };
      });
      const nextState = createNextState(state, {
        documents,
        activeDocId: state.activeDocId,
      });
      persistWorkspace(nextState);
      return nextState;
    }),
}));
