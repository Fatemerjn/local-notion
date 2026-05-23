import { create } from "zustand";
import { createNewBlock } from "@/utils/blockUtils";
import type { Block, BlockType, DocumentStore, Document } from "@/types";

export const useDocumentStore = create<DocumentStore>((set) => ({
  documents: [],
  activeDocId: null,
  blocks: [createNewBlock("text")],

  createDocument: (title = "صفحه بدون عنوان") => {
    const newDoc: Document = {
      id: crypto.randomUUID(),
      title,
      blocks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      documents: [...state.documents, newDoc],
      activeDocId: newDoc.id,
      blocks: [createNewBlock("text")],
    }));
  },

  setActiveDocId: (id: string) => {
    set({ activeDocId: id });
    // بعداً لود بلوک‌های سند
  },

  updateDocumentTitle: (id: string, title: string) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, title, updatedAt: new Date() } : doc,
      ),
    }));
  },

  deleteDocument: (id: string) => {
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
      activeDocId: state.activeDocId === id ? null : state.activeDocId,
    }));
  },

  addBlock: (type: BlockType = "text", index?: number) => {
    const newBlock = createNewBlock(type);
    set((state) => {
      const newBlocks = [...state.blocks];
      const insertIndex = index !== undefined ? index : newBlocks.length;
      newBlocks.splice(insertIndex, 0, newBlock);
      return { blocks: newBlocks };
    });
  },

  updateBlock: (id: string, updates: Partial<Block>) => {
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id
          ? { ...block, ...updates, updatedAt: new Date() }
          : block,
      ),
    }));
  },

  deleteBlock: (id: string) => {
    set((state) => ({
      blocks: state.blocks.filter((b) => b.id !== id),
    }));
  },

  moveBlock: (fromIndex: number, toIndex: number) => {
    set((state) => {
      const newBlocks = [...state.blocks];
      const [moved] = newBlocks.splice(fromIndex, 1);
      newBlocks.splice(toIndex, 0, moved);
      return { blocks: newBlocks };
    });
  },
}));
