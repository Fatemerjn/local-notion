import React from "react";
import { useDocumentStore } from "@/store/useDocumentStore";
import type { Block } from "@/types";

interface RichBlockProps {
  block: Block;
  docId: string;
}

const RichBlock: React.FC<RichBlockProps> = ({ block, docId }) => {
  const { updateBlock, addBlock, deleteBlock } = useDocumentStore();

  const handleContentChange = (newContent: string) => {
    updateBlock(block.id, { content: newContent }, docId);
  };

  return (
    <div className="group relative py-1 px-2 hover:bg-zinc-100 rounded-md">
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => handleContentChange(e.currentTarget.innerText)}
        className="min-h-[28px] outline-none py-1 px-2 text-[17px]"
        dangerouslySetInnerHTML={{
          __html: typeof block.content === "string" ? block.content : "",
        }}
      />

      {/* دکمه‌های عمل (برای تست) */}
      <div className="absolute right-4 top-2 opacity-0 group-hover:opacity-100 flex gap-1 text-xs">
        <button
          onClick={() => addBlock("text", { docId, afterBlockId: block.id })}
          className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50"
        >
          +
        </button>
        <button
          onClick={() => deleteBlock(block.id, docId)}
          className="px-3 py-1 bg-white border border-red-300 text-red-500 rounded hover:bg-red-50"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default RichBlock;
