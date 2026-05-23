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
  checked?: boolean;
}

export interface Document {
  id: string;
  title: string;
  icon?: string;
  cover?: string;
  blocks: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentStore {
  documents: Document[];
  activeDocId: string | null;
  blocks: Block[];

  createDocument: (title?: string) => void;
  setActiveDocId: (id: string) => void;
  updateDocumentTitle: (id: string, title: string) => void;
  deleteDocument: (id: string) => void;

  addBlock: (type: BlockType, index?: number) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
}
