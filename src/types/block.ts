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
  createdAt: Date;
  updatedAt: Date;
  checked?: boolean;
  collapsed?: boolean;
}
