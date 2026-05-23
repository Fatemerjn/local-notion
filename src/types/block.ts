export type BlockType =
  | "text"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulleted-list"
  | "numbered-list"
  | "todo"
  | "toggle"
  | "quote"
  | "code"
  | "image"
  | "divider"
  | "page"
  | "database";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  children: string[];
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  checked?: boolean; // برای todo
  properties?: Record<string, any>;
}
