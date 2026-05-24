import { create } from "zustand";
import type {
  Block,
  BlockType,
  Document,
  DocumentStore,
  ReplaceDocumentsPayload,
  UpdateDocumentPayload,
} from "@/types";
import { createNewBlock } from "@/utils/blockUtils";
import {
  cloneBlock,
  createBlankDocument,
  DEFAULT_TITLE,
  ensureDocuments,
  loadWorkspace,
  normalizeDocument,
  persistWorkspace,
} from "./documentStore.utils";

const initialWorkspace = loadWorkspace();

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  ...initialWorkspace,

  createDocument: (title = DEFAULT_TITLE) => {
    const newDocument = createBlankDocument(title);

    set((state) => {
      const nextState = {
        documents: [newDocument, ...state.documents],
        activeDocId: newDocument.id,
      };
      persistWorkspace(nextState);
      return nextState;
    });

    return newDocument.id;
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
      const nextState = {
        documents,
        activeDocId: duplicate.id,
      };
      persistWorkspace(nextState);
      return nextState;
    });

    return duplicate.id;
  },

  replaceDocuments: (payload: ReplaceDocumentsPayload) => {
    const documents = ensureDocuments(
      payload.documents.map((document) => normalizeDocument(document)),
    );
    const activeDocId = documents.some((document) => document.id === payload.activeDocId)
      ? payload.activeDocId ?? documents[0].id
      : documents[0].id;

    const nextState = {
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

      const nextState = {
        documents: state.documents,
        activeDocId: id,
      };
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
      const nextState = {
        documents,
        activeDocId: state.activeDocId,
      };
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
      const nextState = {
        documents,
        activeDocId: state.activeDocId,
      };
      persistWorkspace(nextState);
      return nextState;
    }),

  deleteDocument: (id: string) =>
    set((state) => {
      const remainingDocuments = ensureDocuments(
        state.documents.filter((document) => document.id !== id),
      );
      const activeDocId = remainingDocuments.some(
        (document) => document.id === state.activeDocId,
      )
        ? state.activeDocId
        : remainingDocuments[0].id;
      const nextState = {
        documents: remainingDocuments,
        activeDocId,
      };
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

      const nextState = {
        documents,
        activeDocId: state.activeDocId,
      };
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

      const nextState = {
        documents,
        activeDocId: state.activeDocId,
      };
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

      const nextState = {
        documents,
        activeDocId: state.activeDocId,
      };
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

      const nextState = {
        documents,
        activeDocId: state.activeDocId,
      };
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
                  updatedAt: new Date(),
                }
              : block,
          ),
          updatedAt: new Date(),
        };
      });

      const nextState = {
        documents,
        activeDocId: state.activeDocId,
      };
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

      const nextState = {
        documents,
        activeDocId: state.activeDocId,
      };
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

      const nextState = {
        documents,
        activeDocId: state.activeDocId,
      };
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

      const nextState = {
        documents,
        activeDocId: currentState.activeDocId,
      };
      persistWorkspace(nextState);
      return nextState;
    });

    return duplicate.id;
  },
}));
