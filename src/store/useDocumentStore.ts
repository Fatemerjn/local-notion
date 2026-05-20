import { useState, useEffect } from "react";
import type { Document, Block } from "../types";
import { createBlock } from "../utils/blockUtils";

export const useDocumentStore = () => {
  const [documents, setDocuments] = useState<Document[]>(() => {
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
  });

  const [activeDocId, setActiveDocId] = useState<string | null>(() => {
    const savedId = localStorage.getItem("activeDocId");
    if (savedId && documents.some((d) => d.id === savedId)) return savedId;
    return documents[0]?.id || null;
  });

  // Auto-save
  useEffect(() => {
    localStorage.setItem("local_notion_docs", JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    if (activeDocId) localStorage.setItem("activeDocId", activeDocId);
  }, [activeDocId]);

  const createDocument = (title = "Untitled") => {
    const newDoc: Document = {
      id: crypto.randomUUID(),
      title,
      blocks: [createBlock("text", "")],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
  };

  const updateDocumentTitle = (id: string, title: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, title, updatedAt: Date.now() } : doc,
      ),
    );
  };

  const updateBlock = (
    docId: string,
    blockId: string,
    updates: Partial<Block>,
  ) => {
    setDocuments((prev) =>
      prev.map((doc) =>
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
    );
  };

  const addBlock = (
    docId: string,
    afterBlockId: string,
    type: Block["type"] = "text",
  ) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        const index = doc.blocks.findIndex((b) => b.id === afterBlockId);
        const newBlock = createBlock(type);
        const newBlocks = [...doc.blocks];
        newBlocks.splice(index + 1, 0, newBlock);
        return { ...doc, blocks: newBlocks, updatedAt: Date.now() };
      }),
    );
  };

  const deleteBlock = (docId: string, blockId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId
          ? {
              ...doc,
              blocks: doc.blocks.filter((b) => b.id !== blockId),
              updatedAt: Date.now(),
            }
          : doc,
      ),
    );
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => {
      const newDocs = prev.filter((d) => d.id !== id);
      if (activeDocId === id && newDocs.length > 0)
        setActiveDocId(newDocs[0].id);
      else if (newDocs.length === 0) setActiveDocId(null);
      return newDocs;
    });
  };

  const moveBlock = (docId: string, fromIndex: number, toIndex: number) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        const newBlocks = [...doc.blocks];
        const [moved] = newBlocks.splice(fromIndex, 1);
        newBlocks.splice(toIndex, 0, moved);
        return { ...doc, blocks: newBlocks, updatedAt: Date.now() };
      }),
    );
  };

  return {
    documents,
    activeDocId,
    setActiveDocId,
    createDocument,
    updateDocumentTitle,
    updateBlock,
    addBlock,
    deleteBlock,
    deleteDocument,
    moveBlock,
  };
};
