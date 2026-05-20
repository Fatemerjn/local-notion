export type BlockType =
  | "text"
  | "heading"
  | "todo"
  | "quote"
  | "code"
  | "divider"
  | "image";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
}

export interface Document {
  id: string;
  title: string;
  blocks: Block[];
  createdAt: number;
  updatedAt: number;
}

export interface Translation {
  dir: "ltr" | "rtl";
  font: string;
  sidebarTitle: string;
  newDocButton: string;
  placeholderTitle: string;
  placeholderContent: string;
  blockTypeText: string;
  blockTypeHeading: string;
  blockTypeTodo: string;
  switchLang: string;
  deleteDoc: string;
  untitled: string;
  searchDocs: string;
  noDocs: string;
  createFirst: string;
}

export type Language = "en" | "fa";

export interface Block {
  id: string;
  type: BlockType;
  content: string; // برای text-based
  checked?: boolean; // فقط todo
  level?: number; // برای heading (1,2,3)
  src?: string; // برای image
  language?: string; // برای code
}
