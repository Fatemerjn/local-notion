// src/utils/blockUtils.ts
import type {
  Block,
  BlockType,
  DatabaseSelectOption,
  ProjectRow,
} from "@/types/block";

export const DEFAULT_DATABASE_COLUMNS = {
  title: "Project",
  category: "Category",
  status: "Status",
  deadline: "Deadline",
  countdown: "Countdown",
  priority: "Priority",
  owner: "Owner",
  notes: "Notes",
};

export const DEFAULT_DATABASE_OPTIONS: {
  projects: DatabaseSelectOption[];
  categories: DatabaseSelectOption[];
} = {
  projects: [
    { id: "project-design", name: "Design first release", color: "blue" },
    { id: "project-deploy", name: "Deploy public domain", color: "green" },
  ],
  categories: [
    { id: "category-product", name: "Product", color: "amber" },
    { id: "category-launch", name: "Launch", color: "purple" },
    { id: "category-research", name: "Research", color: "green" },
  ],
};

export const createProjectRow = (title = ""): ProjectRow => {
  const now = new Date();

  return {
    id: crypto.randomUUID(),
    title,
    category: "",
    priority: "medium",
    status: "not-started",
    deadline: "",
    owner: "",
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
};

export const getBlockPlaceholder = (
  type: BlockType,
  lang: "fa" | "en" = "fa",
): string => {
  const placeholders: Record<string, Record<BlockType, string>> = {
    fa: {
      text: "متن بنویسید...",
      heading1: "عنوان اصلی",
      heading2: "عنوان فرعی",
      heading3: "عنوان کوچک",
      "bulleted-list": "• لیست",
      "numbered-list": "۱. لیست شماره‌دار",
      todo: "☐ کار جدید",
      toggle: "▶ بخش پنهان",
      quote: "نقل قول بنویسید...",
      code: "کد بنویسید...",
      image: "تصویر",
      divider: "",
      page: "صفحه جدید",
      database: "جدول پروژه‌ها",
    },
    en: {
      text: "Type something...",
      heading1: "Heading 1",
      heading2: "Heading 2",
      heading3: "Heading 3",
      "bulleted-list": "List",
      "numbered-list": "Numbered list",
      todo: "To do",
      toggle: "Toggle",
      quote: "Quote",
      code: "Code",
      image: "Image",
      divider: "",
      page: "New page",
      database: "Project table",
    },
  };

  return placeholders[lang]?.[type] || "متن بنویسید...";
};

export const createNewBlock = (
  type: BlockType = "text",
  content = "",
): Block => {
  return {
    id: crypto.randomUUID(),
    type,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
    checked: type === "todo" ? false : undefined,
    collapsed: type === "toggle" ? false : undefined,
    properties:
      type === "database"
        ? {
            database: {
              view: "table",
              columns: DEFAULT_DATABASE_COLUMNS,
              options: DEFAULT_DATABASE_OPTIONS,
              projects: [
                createProjectRow("Design first release"),
                createProjectRow("Deploy public domain"),
              ],
            },
          }
        : undefined,
  };
};
