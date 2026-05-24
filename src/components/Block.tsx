import React, { useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { getBlockPlaceholder } from "@/utils/blockUtils";
import type { Block, BlockType } from "@/types";
import { useDocumentStore } from "@/store/useDocumentStore";

interface BlockProps {
  block: Block;
  docId: string;
}

const BlockComponent: React.FC<BlockProps> = ({ block, docId }) => {
  const { updateBlock } = useDocumentStore();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    updateBlock(block.id, { content: e.target.value }, docId);
  };

  const isTodo = block.type === "todo";
  const isHeading = ["heading1", "heading2", "heading3"].includes(block.type);
  const placeholder = getBlockPlaceholder(block.type as BlockType);

  return (
    <div className="flex group py-1 px-2 hover:bg-zinc-100 rounded-md">
      {/* Bullet / Checkbox */}
      <div className="w-8 flex-shrink-0">
        {isTodo ? (
          <input
            type="checkbox"
            checked={block.checked || false}
            onChange={(e) =>
              updateBlock(block.id, { checked: e.target.checked }, docId)
            }
            className="mt-2"
          />
        ) : isHeading ? (
          <div className="text-zinc-400 mt-1.5 text-xl">H</div>
        ) : (
          <div className="text-zinc-400 mt-1.5">•</div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isHeading || block.type === "text" ? (
          <input
            ref={inputRef as any}
            type="text"
            value={typeof block.content === "string" ? block.content : ""}
            onChange={handleChange}
            placeholder={placeholder}
            className={`w-full bg-transparent outline-none text-[17px] py-1 ${isHeading ? "font-bold" : ""}`}
          />
        ) : (
          <TextareaAutosize
            ref={inputRef as any}
            value={typeof block.content === "string" ? block.content : ""}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full bg-transparent outline-none resize-none text-[17px] py-1"
          />
        )}
      </div>
    </div>
  );
};

export default BlockComponent;
