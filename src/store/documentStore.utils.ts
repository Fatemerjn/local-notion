import type {
  Block,
  BlockType,
  Document,
  PersistedWorkspaceState,
} from "@/types";
import { createNewBlock } from "@/utils/blockUtils";

export const STORAGE_KEY = "local-notion-workspace-v2";
export const DEFAULT_TITLE = "صفحه بدون عنوان";
const DEFAULT_COVER =
  "linear-gradient(135deg, #f6efe6 0%, #fef8f1 35%, #efe2d2 100%)";

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

export const normalizeDocument = (value: unknown): Document => {
  const document = value as Partial<Document> | undefined;
  const blocks = Array.isArray(document?.blocks)
    ? document.blocks
        .filter(
          (block): block is Block =>
            typeof block === "object" && block !== null,
        )
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
      typeof document?.cover === "string" ? document.cover : DEFAULT_COVER,
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
      createNewBlock("code", "Alt + N -> create a new page"),
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
      createNewBlock("bulleted-list", "Alt + N creates a new page"),
      createNewBlock("bulleted-list", "Alt + T toggles the theme"),
      createNewBlock("bulleted-list", "Arrow up/down moves focus between blocks"),
    ],
  };
};

export const createBlankDocument = (title = DEFAULT_TITLE): Document => {
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

export const persistWorkspace = (state: PersistedWorkspaceState) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadWorkspace = (): PersistedWorkspaceState => {
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

    const activeDocId = documents.some(
      (document) => document.id === parsed.activeDocId,
    )
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

export const cloneBlock = (block: Block): Block => ({
  ...block,
  id: crypto.randomUUID(),
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const cloneDocumentForImport = (document: Document): Document => {
  const now = new Date();

  return {
    ...document,
    id: crypto.randomUUID(),
    blocks: document.blocks.map((block) => cloneBlock(block)),
    createdAt: now,
    updatedAt: now,
  };
};

export const ensureDocuments = (documents: Document[]): Document[] =>
  documents.length > 0 ? documents : [createBlankDocument()];
