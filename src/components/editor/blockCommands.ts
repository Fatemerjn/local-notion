import type { BlockType } from "@/types";

export interface BlockCommand {
  type: BlockType;
  labelFa: string;
  labelEn: string;
  descriptionFa: string;
  descriptionEn: string;
}

export const BLOCK_COMMANDS: BlockCommand[] = [
  {
    type: "text",
    labelFa: "متن",
    labelEn: "Text",
    descriptionFa: "یک پاراگراف معمولی",
    descriptionEn: "Plain paragraph",
  },
  {
    type: "heading1",
    labelFa: "هدینگ ۱",
    labelEn: "Heading 1",
    descriptionFa: "عنوان اصلی صفحه",
    descriptionEn: "Large section title",
  },
  {
    type: "heading2",
    labelFa: "هدینگ ۲",
    labelEn: "Heading 2",
    descriptionFa: "عنوان میانی",
    descriptionEn: "Medium section title",
  },
  {
    type: "heading3",
    labelFa: "هدینگ ۳",
    labelEn: "Heading 3",
    descriptionFa: "عنوان کوچک",
    descriptionEn: "Compact section title",
  },
  {
    type: "todo",
    labelFa: "تسک",
    labelEn: "To-do",
    descriptionFa: "چک‌لیست با checkbox",
    descriptionEn: "Checkbox task",
  },
  {
    type: "bulleted-list",
    labelFa: "لیست بولت",
    labelEn: "Bulleted list",
    descriptionFa: "لیست با نقطه",
    descriptionEn: "Bullet list item",
  },
  {
    type: "numbered-list",
    labelFa: "لیست شماره‌دار",
    labelEn: "Numbered list",
    descriptionFa: "لیست با شماره",
    descriptionEn: "Numbered list item",
  },
  {
    type: "quote",
    labelFa: "نقل‌قول",
    labelEn: "Quote",
    descriptionFa: "بلوک نقل‌قول",
    descriptionEn: "Quote block",
  },
  {
    type: "code",
    labelFa: "کد",
    labelEn: "Code",
    descriptionFa: "بلوک کد تک‌خطی/چندخطی",
    descriptionEn: "Code block",
  },
  {
    type: "toggle",
    labelFa: "تاگل",
    labelEn: "Toggle",
    descriptionFa: "بخش باز و بسته‌شونده",
    descriptionEn: "Collapsible row",
  },
  {
    type: "divider",
    labelFa: "جداکننده",
    labelEn: "Divider",
    descriptionFa: "خط افقی",
    descriptionEn: "Horizontal divider",
  },
  {
    type: "database",
    labelFa: "جدول پروژه",
    labelEn: "Project table",
    descriptionFa: "پروژه، وضعیت، ددلاین و کانت‌داون",
    descriptionEn: "Projects, status, deadlines, countdown",
  },
];
