// src/store/useDocumentStore.ts
import { create } from "zustand";
import type { Document, Block } from "../types";
import { createBlock } from "../utils/blockUtils";

interface DocumentStore {
  documents: Document[];
  activeDocId: string | null;
  createDocument: (title?: string) => void;
  updateDocumentTitle: (id: string, title: string) => void;
  updateBlock: (
    docId: string,
    blockId: string,
    updates: Partial<Block>,
  ) => void;
  addBlock: (docId: string, afterBlockId: string, type?: Block["type"]) => void;
  deleteBlock: (docId: string, blockId: string) => void;
  deleteDocument: (id: string) => void;
  moveBlock: (docId: string, fromIndex: number, toIndex: number) => void;
  setActiveDocId: (id: string | null) => void;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  documents: (() => {
    const saved = localStorage.getItem("local_notion_docs");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: crypto.randomUUID(),
        title: "Welcome to Local Notion",
        blocks: [createBlock("text", "Start typing...")],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];
  })(),

  activeDocId: (() => {
    const savedId = localStorage.getItem("activeDocId");
    const docs = JSON.parse(localStorage.getItem("local_notion_docs") || "[]");
    if (savedId && docs.some((d: Document) => d.id === savedId)) return savedId;
    return docs[0]?.id || null;
  })(),

  setActiveDocId: (id) => {
    set({ activeDocId: id });
    if (id) localStorage.setItem("activeDocId", id);
  },

  createDocument: (title = "Untitled") => {
    const newDoc: Document = {
      id: crypto.randomUUID(),
      title,
      blocks: [createBlock("text", "")],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => ({
      documents: [newDoc, ...state.documents],
      activeDocId: newDoc.id,
    }));
  },

  updateDocumentTitle: (id, title) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, title, updatedAt: Date.now() } : doc,
      ),
    }));
  },

  updateBlock: (docId, blockId, updates) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === docId
          ? {
              ...doc,
              blocks: doc.blocks.map((block) =>
                block.id === blockId ? { ...block, ...updates } : block,
              ),
              updatedAt: Date.now(),
            }
          : doc,
      ),
    }));
  },

  addBlock: (docId, afterBlockId, type = "text") => {
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== docId) return doc;
        const index = doc.blocks.findIndex((b) => b.id === afterBlockId);
        const newBlock = createBlock(type);
        const newBlocks = [...doc.blocks];
        newBlocks.splice(index + 1, 0, newBlock);
        return { ...doc, blocks: newBlocks, updatedAt: Date.now() };
      }),
    }));
  },

  deleteBlock: (docId, blockId) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === docId
          ? {
              ...doc,
              blocks: doc.blocks.filter((b) => b.id !== blockId),
              updatedAt: Date.now(),
            }
          : doc,
      ),
    }));
  },

  deleteDocument: (id) => {
    set((state) => {
      const newDocs = state.documents.filter((d) => d.id !== id);
      let newActive = state.activeDocId;
      if (state.activeDocId === id) {
        newActive = newDocs.length > 0 ? newDocs[0].id : null;
      }
      return { documents: newDocs, activeDocId: newActive };
    });
  },

  moveBlock: (docId, fromIndex, toIndex) => {
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== docId) return doc;
        const newBlocks = [...doc.blocks];
        const [moved] = newBlocks.splice(fromIndex, 1);
        newBlocks.splice(toIndex, 0, moved);
        return { ...doc, blocks: newBlocks, updatedAt: Date.now() };
      }),
    }));
  },
}));

// Auto-save به localStorage
useDocumentStore.subscribe((state) => {
  localStorage.setItem("local_notion_docs", JSON.stringify(state.documents));
});
