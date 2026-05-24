import React, { useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import type { Block as BlockModel, BlockType } from "@/types";
import { useWorkspaceActions } from "@/store/selectors";
import { getBlockPlaceholder } from "@/utils/blockUtils";

interface BlockProps {
  block: BlockModel;
  docId: string;
}

const Block: React.FC<BlockProps> = ({ block, docId }) => {
  const { updateBlock } = useWorkspaceActions();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const placeholder = getBlockPlaceholder(block.type as BlockType);
  const isTodo = block.type === "todo";
  const isHeading = ["heading1", "heading2", "heading3"].includes(block.type);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    updateBlock(block.id, { content: event.target.value }, docId);
  };

  return (
    <div className="group flex rounded-md px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800/70">
      <div className="w-8 flex-shrink-0">
        {isTodo ? (
          <input
            type="checkbox"
            checked={block.checked || false}
            onChange={(event) =>
              updateBlock(block.id, { checked: event.target.checked }, docId)
            }
            className="mt-2"
          />
        ) : isHeading ? (
          <div className="mt-1.5 text-xl text-zinc-400">H</div>
        ) : (
          <div className="mt-1.5 text-zinc-400">•</div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {isHeading || block.type === "text" ? (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={block.content}
            onChange={handleChange}
            placeholder={placeholder}
            className={`w-full bg-transparent py-1 text-[17px] outline-none ${
              isHeading ? "font-bold" : ""
            }`}
          />
        ) : (
          <TextareaAutosize
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={block.content}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent py-1 text-[17px] outline-none"
          />
        )}
      </div>
    </div>
  );
};

export default Block;
