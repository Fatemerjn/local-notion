// src/utils/blockUtils.ts
import type { Block, BlockType, ProjectRow } from "@/types/block";

export const createProjectRow = (title = ""): ProjectRow => {
  const now = new Date();

  return {
    id: crypto.randomUUID(),
    title,
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
              projects: [
                createProjectRow("Design first release"),
                createProjectRow("Deploy public domain"),
              ],
            },
          }
        : undefined,
  };
};
