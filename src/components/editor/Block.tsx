import React, { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  Copy,
  GripVertical,
  Trash2,
} from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import type { Block as BlockModel, BlockType } from "@/types";
import { useWorkspaceActions } from "@/store/selectors";
import { getBlockPlaceholder } from "@/utils/blockUtils";
import { BLOCK_COMMANDS } from "./blockCommands";

interface BlockProps {
  block: BlockModel;
  docId: string;
  lang: "fa" | "en";
  index: number;
  totalBlocks: number;
  previousBlockId: string | null;
  nextBlockId: string | null;
  shouldFocus: boolean;
  onFocusHandled: () => void;
  onRequestFocus: (blockId: string | null) => void;
}

const BLOCK_INPUT_TYPES: BlockType[] = [
  "text",
  "heading1",
  "heading2",
  "heading3",
  "bulleted-list",
  "numbered-list",
  "todo",
  "toggle",
  "quote",
  "code",
];

const Block: React.FC<BlockProps> = ({
  block,
  docId,
  lang,
  index,
  totalBlocks,
  previousBlockId,
  nextBlockId,
  shouldFocus,
  onFocusHandled,
  onRequestFocus,
}) => {
  const {
    addBlock,
    deleteBlock,
    duplicateBlock,
    moveBlock,
    setBlockType,
    toggleBlockCollapsed,
    updateBlock,
  } = useWorkspaceActions();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);
  const placeholder = getBlockPlaceholder(block.type as BlockType);
  const isTodo = block.type === "todo";
  const isHeading = ["heading1", "heading2", "heading3"].includes(block.type);
  const isQuote = block.type === "quote";
  const isCode = block.type === "code";
  const isToggle = block.type === "toggle";
  const isDivider = block.type === "divider";
  const slashQuery = block.content.startsWith("/")
    ? block.content.slice(1).trim().toLowerCase()
    : "";
  const filteredCommands = BLOCK_COMMANDS.filter((command) => {
    if (!slashQuery) {
      return true;
    }

    return [command.labelFa, command.labelEn, command.type].some((value) =>
      value.toLowerCase().includes(slashQuery),
    );
  });
  const isCommandMenuOpen =
    !isDivider && block.content.startsWith("/") && filteredCommands.length > 0;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    updateBlock(block.id, { content: event.target.value }, docId);
  };

  useEffect(() => {
    if (!shouldFocus || isDivider) {
      return;
    }

    inputRef.current?.focus();
    const length = inputRef.current?.value.length ?? 0;
    inputRef.current?.setSelectionRange?.(length, length);
    onFocusHandled();
  }, [isDivider, onFocusHandled, shouldFocus]);

  useEffect(() => {
    setActiveCommandIndex(0);
  }, [slashQuery]);

  const createBlockBelow = (type: BlockType = "text") => {
    const newBlockId = addBlock(type, {
      docId,
      afterBlockId: block.id,
    });

    if (newBlockId) {
      onRequestFocus(newBlockId);
    }
  };

  const selectCommand = (type: BlockType) => {
    setBlockType(block.id, type, docId);
    updateBlock(
      block.id,
      {
        content: type === "divider" ? "" : "",
      },
      docId,
    );
  };

  const focusSibling = (blockId: string | null) => {
    onRequestFocus(blockId);
  };

  const handleDeleteBlock = () => {
    if (totalBlocks === 1) {
      updateBlock(block.id, { content: "" }, docId);
      return;
    }

    deleteBlock(block.id, docId);
    focusSibling(previousBlockId ?? nextBlockId);
  };

  const handleDuplicateBlock = () => {
    const duplicatedId = duplicateBlock(block.id, docId);
    if (duplicatedId) {
      focusSibling(duplicatedId);
    }
  };

  const moveBlockBy = (delta: -1 | 1) => {
    moveBlock(index, index + delta, docId);
    focusSibling(block.id);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (isCommandMenuOpen) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveCommandIndex((current) =>
          Math.min(current + 1, filteredCommands.length - 1),
        );
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveCommandIndex((current) => Math.max(current - 1, 0));
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const selectedCommand = filteredCommands[activeCommandIndex];
        if (selectedCommand) {
          selectCommand(selectedCommand.type);
        }
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        updateBlock(block.id, { content: "" }, docId);
        return;
      }
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      createBlockBelow();
      return;
    }

    if (
      event.key === "Backspace" &&
      block.content.length === 0 &&
      totalBlocks > 1
    ) {
      event.preventDefault();
      handleDeleteBlock();
      return;
    }

    if (
      event.key === "ArrowUp" &&
      event.currentTarget.selectionStart === 0 &&
      previousBlockId
    ) {
      event.preventDefault();
      focusSibling(previousBlockId);
      return;
    }

    if (
      event.key === "ArrowDown" &&
      event.currentTarget.selectionStart === block.content.length &&
      nextBlockId
    ) {
      event.preventDefault();
      focusSibling(nextBlockId);
    }
  };

  const renderHandle = () => (
    <div className="mt-1 hidden w-8 shrink-0 items-start justify-center gap-1 text-zinc-300 group-hover:flex">
      <button
        type="button"
        onClick={() => moveBlockBy(-1)}
        className="rounded p-1 transition hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700"
        disabled={index === 0}
      >
        <GripVertical size={14} />
      </button>
    </div>
  );

  const renderLeading = () => {
    if (isTodo) {
      return (
        <input
          type="checkbox"
          checked={block.checked || false}
          onChange={(event) =>
            updateBlock(block.id, { checked: event.target.checked }, docId)
          }
          className="mt-2"
        />
      );
    }

    if (isToggle) {
      return (
        <button
          type="button"
          onClick={() => toggleBlockCollapsed(block.id, docId)}
          className="mt-1 rounded p-0.5 text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700"
        >
          <ChevronRight
            size={16}
            className={`transition ${block.collapsed ? "" : "rotate-90"}`}
          />
        </button>
      );
    }

    if (block.type === "numbered-list") {
      return <div className="mt-1.5 text-sm text-zinc-400">{index + 1}.</div>;
    }

    if (isHeading) {
      return <div className="mt-1.5 text-xl text-zinc-400">H</div>;
    }

    return <div className="mt-1.5 text-zinc-400">•</div>;
  };

  const renderInputClassName = () => {
    if (block.type === "heading1") {
      return "text-3xl font-bold";
    }

    if (block.type === "heading2") {
      return "text-2xl font-semibold";
    }

    if (block.type === "heading3") {
      return "text-xl font-semibold";
    }

    if (isQuote) {
      return "border-l-4 border-slate-300 pl-4 italic text-slate-600 dark:border-slate-600 dark:text-slate-300";
    }

    if (isCode) {
      return "rounded-2xl bg-zinc-950/95 px-4 py-3 font-mono text-[15px] text-zinc-100";
    }

    return "text-[17px]";
  };

  return (
    <div className="group relative flex rounded-xl px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/70">
      {renderHandle()}
      <div className="w-8 flex-shrink-0">{renderLeading()}</div>

      <div className="min-w-0 flex-1">
        {isDivider ? (
          <div className="flex items-center gap-3 py-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>
        ) : (
          <>
            {BLOCK_INPUT_TYPES.includes(block.type) && !isHeading ? (
              <TextareaAutosize
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={block.content}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`w-full resize-none bg-transparent py-1 outline-none ${renderInputClassName()} ${
                  isToggle && block.collapsed ? "opacity-60" : ""
                }`}
              />
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={block.content}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`w-full bg-transparent py-1 outline-none ${renderInputClassName()} ${
                  isToggle && block.collapsed ? "opacity-60" : ""
                }`}
              />
            )}

            {isCommandMenuOpen && (
              <div className="absolute left-10 top-full z-20 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                {filteredCommands.map((command, commandIndex) => (
                  <button
                    key={command.type}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectCommand(command.type)}
                    className={`flex w-full items-start justify-between px-4 py-3 text-left transition ${
                      commandIndex === activeCommandIndex
                        ? "bg-slate-100 dark:bg-slate-800"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/80"
                    }`}
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-100">
                      {lang === "fa" ? command.labelFa : command.labelEn}
                    </span>
                    <span className="text-xs text-slate-400">
                      {lang === "fa"
                        ? command.descriptionFa
                        : command.descriptionEn}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="ml-2 hidden items-start gap-1 text-zinc-300 group-hover:flex">
        <button
          type="button"
          onClick={handleDuplicateBlock}
          className="rounded p-1 transition hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700"
        >
          <Copy size={14} />
        </button>
        <button
          type="button"
          onClick={handleDeleteBlock}
          className="rounded p-1 transition hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default Block;
