import type { Block, BlockType } from "../types";

export const createBlock = (type: BlockType = "text", content = ""): Block => ({
  id: crypto.randomUUID(),
  type,
  content,
  checked: type === "todo" ? false : undefined,
});

export const getBlockPlaceholder = (
  type: BlockType,
  lang: "en" | "fa",
): string => {
  const placeholders = {
    en: { text: "Type '/' for commands...", heading: "Heading", todo: "Task" },
    fa: { text: "برای کامندها '/' را بزنید...", heading: "تیتر", todo: "کار" },
  };
  return placeholders[lang][type];
};
