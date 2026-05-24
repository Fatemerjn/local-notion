import { create } from "zustand";
import { createNewBlock } from "@/utils/blockUtils";
import type {
  Block,
  BlockType,
  Document,
  DocumentStore,
  PersistedWorkspaceState,
  ReplaceDocumentsPayload,
} from "@/types";

const STORAGE_KEY = "local-notion-workspace-v2";
const DEFAULT_TITLE = "صفحه بدون عنوان";
const VALID_BLOCK_TYPES: BlockType[] = [
  "text",
  "heading1",
  "heading2",
  "heading3",
  "bulleted-list",
  "numbered-list",
  "todo",
  "toggle",
  "quote",
  "code",
  "image",
  "divider",
  "page",
  "database",
];

const toDate = (value: unknown): Date => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
};

const normalizeBlockType = (value: unknown): BlockType =>
  VALID_BLOCK_TYPES.includes(value as BlockType)
    ? (value as BlockType)
    : "text";

const normalizeBlock = (value: unknown): Block => {
  const block = value as Partial<Block> | undefined;
  const type = normalizeBlockType(block?.type);

  return {
    id:
      typeof block?.id === "string" && block.id.length > 0
        ? block.id
        : crypto.randomUUID(),
    type,
    content: typeof block?.content === "string" ? block.content : "",
    checked: type === "todo" ? Boolean(block?.checked) : undefined,
    collapsed: type === "toggle" ? Boolean(block?.collapsed) : undefined,
    createdAt: toDate(block?.createdAt),
    updatedAt: toDate(block?.updatedAt),
  };
};

const normalizeDocument = (value: unknown): Document => {
  const document = value as Partial<Document> | undefined;
  const blocks = Array.isArray(document?.blocks)
    ? document.blocks
        .filter((block): block is Block => typeof block === "object" && block !== null)
        .map((block) => normalizeBlock(block))
    : [];

  return {
    id:
      typeof document?.id === "string" && document.id.length > 0
        ? document.id
        : crypto.randomUUID(),
    title: typeof document?.title === "string" ? document.title : DEFAULT_TITLE,
    icon: typeof document?.icon === "string" ? document.icon : "📝",
    cover:
      typeof document?.cover === "string"
        ? document.cover
        : "linear-gradient(135deg, #f6efe6 0%, #fef8f1 35%, #efe2d2 100%)",
    blocks: blocks.length > 0 ? blocks : [createNewBlock("text")],
    createdAt: toDate(document?.createdAt),
    updatedAt: toDate(document?.updatedAt),
  };
};

const createWelcomeDocument = (): Document => {
  const createdAt = new Date();

  return {
    id: crypto.randomUUID(),
    title: "Local Notion",
    icon: "🇮🇷",
    cover: "linear-gradient(135deg, #f7efe2 0%, #fdf8f2 42%, #e9dcc9 100%)",
    createdAt,
    updatedAt: createdAt,
    blocks: [
      createNewBlock("heading1", "به Local Notion خوش آمدی"),
      createNewBlock(
        "text",
        "This workspace works fully offline and keeps your notes on this device.",
      ),
      createNewBlock("todo", "صفحه‌های خودت را بساز و مدیریت کن"),
      createNewBlock("quote", "Use / inside a block to change its type quickly."),
      createNewBlock("code", "Ctrl/Cmd + N -> create a new page"),
    ],
  };
};

const createQuickGuideDocument = (): Document => {
  const createdAt = new Date();

  return {
    id: crypto.randomUUID(),
    title: "Quick Guide",
    icon: "⚡️",
    cover: "linear-gradient(135deg, #ece7db 0%, #f8f6f1 50%, #ded6c8 100%)",
    createdAt,
    updatedAt: createdAt,
    blocks: [
      createNewBlock("heading2", "Slash commands"),
      createNewBlock("text", "/text /todo /quote /code /divider"),
      createNewBlock("heading2", "Shortcuts"),
      createNewBlock("bulleted-list", "Enter creates a block below"),
      createNewBlock("bulleted-list", "Backspace on empty deletes the block"),
      createNewBlock("bulleted-list", "Arrow up/down moves focus between blocks"),
    ],
  };
};

const createBlankDocument = (title = DEFAULT_TITLE): Document => {
  const createdAt = new Date();

  return {
    id: crypto.randomUUID(),
    title,
    icon: "📄",
    cover: "linear-gradient(135deg, #f4ede2 0%, #fbf7f1 55%, #e8dece 100%)",
    blocks: [createNewBlock("text")],
    createdAt,
    updatedAt: createdAt,
  };
};

const createDefaultWorkspace = (): PersistedWorkspaceState => {
  const quickGuide = createQuickGuideDocument();
  const welcome = createWelcomeDocument();

  return {
    documents: [welcome, quickGuide],
    activeDocId: welcome.id,
  };
};

const persistWorkspace = (state: PersistedWorkspaceState) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const loadWorkspace = (): PersistedWorkspaceState => {
  if (typeof window === "undefined") {
    return createDefaultWorkspace();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultWorkspace();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedWorkspaceState>;
    const documents = Array.isArray(parsed.documents)
      ? parsed.documents.map((document) => normalizeDocument(document))
      : [];

    if (documents.length === 0) {
      return createDefaultWorkspace();
    }

    const activeDocId = documents.some((document) => document.id === parsed.activeDocId)
      ? parsed.activeDocId ?? documents[0].id
      : documents[0].id;

    return {
      documents,
      activeDocId,
    };
  } catch {
    return createDefaultWorkspace();
  }
};

const cloneBlock = (block: Block): Block => ({
  ...block,
  id: crypto.randomUUID(),
  createdAt: new Date(),
  updatedAt: new Date(),
});

const ensureDocuments = (documents: Document[]): Document[] =>
  documents.length > 0 ? documents : [createBlankDocument()];

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
