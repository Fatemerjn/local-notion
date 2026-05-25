import type {
  Block,
  BlockType,
  DatabaseSelectOption,
  Document,
  ProjectRow,
  PersistedWorkspaceState,
  Workspace,
} from "@/types";
import {
  createNewBlock,
  createProjectRow,
  DEFAULT_DATABASE_COLUMNS,
  DEFAULT_DATABASE_OPTIONS,
} from "@/utils/blockUtils";

export const STORAGE_KEY = "local-notion-workspace-v2";
export const DEFAULT_TITLE = "صفحه بدون عنوان";
export const DEFAULT_WORKSPACE_NAME = "Personal";
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

export const toDate = (value: unknown): Date => {
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

const normalizeProjectRow = (value: unknown): ProjectRow => {
  const row = value as Partial<ProjectRow> | undefined;

  return {
    id:
      typeof row?.id === "string" && row.id.length > 0
        ? row.id
        : crypto.randomUUID(),
    title: typeof row?.title === "string" ? row.title : "",
    category: typeof row?.category === "string" ? row.category : "",
    priority:
      row?.priority === "low" ||
      row?.priority === "high" ||
      row?.priority === "urgent" ||
      row?.priority === "medium"
        ? row.priority
        : "medium",
    status:
      row?.status === "in-progress" ||
      row?.status === "done" ||
      row?.status === "blocked" ||
      row?.status === "not-started"
        ? row.status
        : "not-started",
    deadline: typeof row?.deadline === "string" ? row.deadline : "",
    owner: typeof row?.owner === "string" ? row.owner : "",
    notes: typeof row?.notes === "string" ? row.notes : "",
    createdAt: toDate(row?.createdAt),
    updatedAt: toDate(row?.updatedAt),
  };
};

const normalizeBlock = (value: unknown): Block => {
  const block = value as Partial<Block> | undefined;
  const type = normalizeBlockType(block?.type);
  const database = block?.properties?.database;
  const normalizedProjects = Array.isArray(database?.projects)
    ? database.projects.map((row) => normalizeProjectRow(row))
    : [createProjectRow("New project")];
  const optionSource = database as
    | {
        options?: {
          projects?: unknown[];
          categories?: unknown[];
        };
      }
    | undefined;
  const normalizeOption = (
    value: unknown,
    fallbackColor: "blue" | "green" | "amber" | "purple",
  ): DatabaseSelectOption | null => {
    const option = value as { id?: unknown; name?: unknown; color?: unknown };
    const validColors = ["slate", "blue", "green", "amber", "purple", "rose", "orange"];
    const name = typeof option?.name === "string" ? option.name.trim() : "";

    if (!name) {
      return null;
    }

    return {
      id:
        typeof option?.id === "string" && option.id.length > 0
          ? option.id
          : crypto.randomUUID(),
      name,
      color: validColors.includes(option?.color as string)
        ? (option.color as "slate" | "blue" | "green" | "amber" | "purple" | "rose" | "orange")
        : fallbackColor,
    };
  };
  const isOption = (
    option: DatabaseSelectOption | null,
  ): option is DatabaseSelectOption => Boolean(option);
  const projectOptions = [
    ...DEFAULT_DATABASE_OPTIONS.projects,
    ...(optionSource?.options?.projects ?? [])
      .map((option) => normalizeOption(option, "blue"))
      .filter(isOption),
    ...normalizedProjects
      .filter((row) => row.title.trim())
      .map((row) => ({
        id: `project-${row.id}`,
        name: row.title,
        color: "blue" as const,
      })),
  ].filter(
    (option, index, allOptions) =>
      allOptions.findIndex((item) => item.name === option.name) === index,
  );
  const categoryOptions = [
    ...DEFAULT_DATABASE_OPTIONS.categories,
    ...(optionSource?.options?.categories ?? [])
      .map((option) => normalizeOption(option, "amber"))
      .filter(isOption),
    ...normalizedProjects
      .filter((row) => row.category.trim())
      .map((row) => ({
        id: `category-${row.id}`,
        name: row.category,
        color: "amber" as const,
      })),
  ].filter(
    (option, index, allOptions) =>
      allOptions.findIndex((item) => item.name === option.name) === index,
  );

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
    properties:
      type === "database"
        ? {
            database: {
              view: database?.view === "board" ? "board" : "table",
              columns: {
                ...DEFAULT_DATABASE_COLUMNS,
                ...database?.columns,
              },
              options: {
                projects: projectOptions,
                categories: categoryOptions,
              },
              projects: normalizedProjects,
            },
          }
        : undefined,
  };
};

export const normalizeWorkspace = (value: unknown): Workspace => {
  const workspace = value as Partial<Workspace> | undefined;

  return {
    id:
      typeof workspace?.id === "string" && workspace.id.length > 0
        ? workspace.id
        : crypto.randomUUID(),
    name:
      typeof workspace?.name === "string" && workspace.name.length > 0
        ? workspace.name
        : DEFAULT_WORKSPACE_NAME,
    icon:
      typeof workspace?.icon === "string" && workspace.icon.length > 0
        ? workspace.icon
        : "🏠",
    createdAt: toDate(workspace?.createdAt),
    updatedAt: toDate(workspace?.updatedAt),
  };
};

export const createWorkspaceModel = (
  name = DEFAULT_WORKSPACE_NAME,
): Workspace => {
  const createdAt = new Date();

  return {
    id: crypto.randomUUID(),
    name,
    icon: "🏠",
    createdAt,
    updatedAt: createdAt,
  };
};

export const normalizeDocument = (
  value: unknown,
  fallbackWorkspaceId: string,
): Document => {
  const document = value as Partial<Document> | undefined;
  const blocks = Array.isArray(document?.blocks)
    ? document.blocks
        .filter(
          (block): block is Block =>
            typeof block === "object" && block !== null,
        )
        .map((block) => normalizeBlock(block))
    : [];
  const hasDatabaseBlock = blocks.some((block) => block.type === "database");
  const inferredDatabasePage =
    document?.layout === "database" ||
    (hasDatabaseBlock &&
      typeof document?.title === "string" &&
      document.title.toLowerCase() === "projects");
  const normalizedBlocks = inferredDatabasePage
    ? blocks.filter((block) => block.type === "database")
    : blocks;

  return {
    id:
      typeof document?.id === "string" && document.id.length > 0
        ? document.id
        : crypto.randomUUID(),
    workspaceId:
      typeof document?.workspaceId === "string" && document.workspaceId.length > 0
        ? document.workspaceId
        : fallbackWorkspaceId,
    parentId:
      typeof document?.parentId === "string" && document.parentId.length > 0
        ? document.parentId
        : null,
    title: typeof document?.title === "string" ? document.title : DEFAULT_TITLE,
    icon: typeof document?.icon === "string" ? document.icon : "📝",
    cover:
      typeof document?.cover === "string" ? document.cover : DEFAULT_COVER,
    deadline: typeof document?.deadline === "string" ? document.deadline : "",
    layout: inferredDatabasePage ? "database" : "page",
    favorite: Boolean(document?.favorite),
    blocks:
      normalizedBlocks.length > 0
        ? normalizedBlocks
        : [createNewBlock(inferredDatabasePage ? "database" : "text", "Projects")],
    createdAt: toDate(document?.createdAt),
    updatedAt: toDate(document?.updatedAt),
  };
};

const createWelcomeDocument = (workspaceId: string): Document => {
  const createdAt = new Date();

  return {
    id: crypto.randomUUID(),
    workspaceId,
    parentId: null,
    title: "Local Notion",
    icon: "🇮🇷",
    cover: "linear-gradient(135deg, #f7efe2 0%, #fdf8f2 42%, #e9dcc9 100%)",
    layout: "page",
    favorite: false,
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
      createNewBlock("database", "Projects"),
    ],
  };
};

const createQuickGuideDocument = (workspaceId: string): Document => {
  const createdAt = new Date();

  return {
    id: crypto.randomUUID(),
    workspaceId,
    parentId: null,
    title: "Quick Guide",
    icon: "⚡️",
    cover: "linear-gradient(135deg, #ece7db 0%, #f8f6f1 50%, #ded6c8 100%)",
    layout: "page",
    favorite: false,
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
    workspaceId: "",
    parentId: null,
    title,
    icon: "📄",
    cover: "linear-gradient(135deg, #f4ede2 0%, #fbf7f1 55%, #e8dece 100%)",
    layout: "page",
    favorite: false,
    blocks: [createNewBlock("text")],
    createdAt,
    updatedAt: createdAt,
  };
};

const createDefaultWorkspace = (): PersistedWorkspaceState => {
  const workspace = createWorkspaceModel();
  const quickGuide = createQuickGuideDocument(workspace.id);
  const welcome = createWelcomeDocument(workspace.id);

  return {
    workspaces: [workspace],
    activeWorkspaceId: workspace.id,
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
    const workspaces = Array.isArray(parsed.workspaces)
      ? parsed.workspaces.map((workspace) => normalizeWorkspace(workspace))
      : [createWorkspaceModel()];
    const activeWorkspaceId = workspaces.some(
      (workspace) => workspace.id === parsed.activeWorkspaceId,
    )
      ? parsed.activeWorkspaceId ?? workspaces[0].id
      : workspaces[0].id;
    const documents = Array.isArray(parsed.documents)
      ? parsed.documents.map((document) =>
          normalizeDocument(document, activeWorkspaceId),
        )
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
      workspaces,
      activeWorkspaceId,
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
  properties: block.properties?.database
    ? {
        database: {
          view: block.properties.database.view,
          columns: block.properties.database.columns,
          options: {
            projects: block.properties.database.options.projects.map((option) => ({
              ...option,
              id: crypto.randomUUID(),
            })),
            categories: block.properties.database.options.categories.map((option) => ({
              ...option,
              id: crypto.randomUUID(),
            })),
          },
          projects: block.properties.database.projects.map((row) => ({
            ...row,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
        },
      }
    : block.properties,
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
