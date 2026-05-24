import type { Block, BlockType } from "./block";

export interface Document {
  id: string;
  title: string;
  icon?: string;
  cover?: string;
  blocks: Block[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PersistedWorkspaceState {
  documents: Document[];
  activeDocId: string | null;
}

export interface ReplaceDocumentsPayload {
  documents: Document[];
  activeDocId?: string | null;
}

export interface UpdateDocumentPayload {
  title?: string;
  icon?: string;
  cover?: string;
}

export interface DocumentStore extends PersistedWorkspaceState {
  createDocument: (title?: string) => string;
  duplicateDocument: (id: string) => string | null;
  replaceDocuments: (payload: ReplaceDocumentsPayload) => void;
  setActiveDocId: (id: string) => void;
  updateDocument: (id: string, updates: UpdateDocumentPayload) => void;
  updateDocumentTitle: (id: string, title: string) => void;
  deleteDocument: (id: string) => void;

  addBlock: (
    type?: BlockType,
    options?: { docId?: string; afterBlockId?: string },
  ) => string | null;
  updateBlock: (id: string, updates: Partial<Block>, docId?: string) => void;
  deleteBlock: (id: string, docId?: string) => void;
  moveBlock: (fromIndex: number, toIndex: number, docId?: string) => void;
  setBlockType: (id: string, type: BlockType, docId?: string) => void;
  toggleBlockChecked: (id: string, docId?: string) => void;
  toggleBlockCollapsed: (id: string, docId?: string) => void;
  duplicateBlock: (id: string, docId?: string) => string | null;
}
