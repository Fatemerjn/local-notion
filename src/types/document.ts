import type { Block, BlockType, ProjectRow } from "./block";

export type DocumentLayout = "page" | "database";
export type DocumentTemplate = "blank" | "database";

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  workspaceId: string;
  parentId?: string | null;
  title: string;
  icon?: string;
  cover?: string;
  deadline?: string;
  layout?: DocumentLayout;
  favorite?: boolean;
  blocks: Block[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PersistedWorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  documents: Document[];
  activeDocId: string | null;
}

export interface ReplaceDocumentsPayload {
  documents: Document[];
  workspaces?: Workspace[];
  activeWorkspaceId?: string | null;
  activeDocId?: string | null;
}

export interface UpdateDocumentPayload {
  title?: string;
  icon?: string;
  cover?: string;
  deadline?: string;
  layout?: DocumentLayout;
  favorite?: boolean;
  parentId?: string | null;
  workspaceId?: string;
}

export interface DocumentStore extends PersistedWorkspaceState {
  createWorkspace: (name?: string) => string;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  setActiveWorkspaceId: (id: string) => void;

  createDocument: (
    title?: string,
    options?: {
      workspaceId?: string;
      parentId?: string | null;
      template?: DocumentTemplate;
    },
  ) => string;
  createChildDocument: (parentId: string, title?: string) => string | null;
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
  addProjectRow: (blockId: string, docId?: string) => string | null;
  updateProjectRow: (
    blockId: string,
    rowId: string,
    updates: Partial<ProjectRow>,
    docId?: string,
  ) => void;
  deleteProjectRow: (blockId: string, rowId: string, docId?: string) => void;
}
