import { useDocumentStore } from "./useDocumentStore";

export const useDocuments = () =>
  useDocumentStore((state) => state.documents);

export const useWorkspaces = () =>
  useDocumentStore((state) => state.workspaces);

export const useActiveWorkspaceId = () =>
  useDocumentStore((state) => state.activeWorkspaceId);

export const useActiveDocId = () =>
  useDocumentStore((state) => state.activeDocId);

export const useActiveDocument = () =>
  useDocumentStore((state) =>
    state.documents.find((document) => document.id === state.activeDocId) ?? null,
  );

export const useWorkspaceActions = () =>
  useDocumentStore((state) => ({
    createWorkspace: state.createWorkspace,
    updateWorkspace: state.updateWorkspace,
    deleteWorkspace: state.deleteWorkspace,
    setActiveWorkspaceId: state.setActiveWorkspaceId,
    createDocument: state.createDocument,
    createChildDocument: state.createChildDocument,
    duplicateDocument: state.duplicateDocument,
    replaceDocuments: state.replaceDocuments,
    setActiveDocId: state.setActiveDocId,
    updateDocument: state.updateDocument,
    updateDocumentTitle: state.updateDocumentTitle,
    deleteDocument: state.deleteDocument,
    addBlock: state.addBlock,
    updateBlock: state.updateBlock,
    deleteBlock: state.deleteBlock,
    moveBlock: state.moveBlock,
    setBlockType: state.setBlockType,
    toggleBlockChecked: state.toggleBlockChecked,
    toggleBlockCollapsed: state.toggleBlockCollapsed,
    duplicateBlock: state.duplicateBlock,
    addProjectRow: state.addProjectRow,
    updateProjectRow: state.updateProjectRow,
    deleteProjectRow: state.deleteProjectRow,
  }));
