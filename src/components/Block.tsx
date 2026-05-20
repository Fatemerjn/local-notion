import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import type { Block as BlockType, BlockType as BlockTypeEnum } from "../types";
import { useDocumentStore } from "../store/useDocumentStore";
import { getBlockPlaceholder } from "../utils/blockUtils";

interface Props {
  block: BlockType;
  docId: string;
  isFirst: boolean;
  isLast: boolean;
  lang: "en" | "fa";
}

export const Block = ({ block, docId, isFirst, isLast, lang }: Props) => {
  const {
    updateBlock,
    addBlock,
    deleteBlock,
    moveBlock,
    activeDocId,
    documents,
  } = useDocumentStore();
  const [showMenu, setShowMenu] = useState(false);
  const [slashOpen, setSlashOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const placeholder = getBlockPlaceholder(block.type, lang);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setSlashOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addBlock(docId, block.id, "text");
      setTimeout(() => {
        const nextBlock = document.getElementById(`block-${docId}-next`);
        (nextBlock?.querySelector("input,textarea") as HTMLElement)?.focus();
      }, 10);
    }
    if (e.key === "Backspace" && block.content === "" && !isFirst) {
      e.preventDefault();
      deleteBlock(docId, block.id);
    }
    if (e.key === "/" && block.content === "") {
      e.preventDefault();
      setSlashOpen(true);
    }
    if (e.key === "ArrowUp" && !isFirst) {
      const prevInput = document
        .getElementById(`block-${docId}-${block.id}`)
        ?.previousElementSibling?.querySelector("input,textarea");
      if (prevInput) (prevInput as HTMLElement).focus();
    }
    if (e.key === "ArrowDown" && !isLast) {
      const nextInput = document
        .getElementById(`block-${docId}-${block.id}`)
        ?.nextElementSibling?.querySelector("input,textarea");
      if (nextInput) (nextInput as HTMLElement).focus();
    }
  };

  const changeType = (type: BlockTypeEnum) => {
    updateBlock(docId, block.id, {
      type,
      checked: type === "todo" ? false : undefined,
    });
    setSlashOpen(false);
    setShowMenu(false);
    inputRef.current?.focus();
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", block.id);
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId && draggedId !== block.id && activeDocId) {
      const allBlocks =
        documents.find((d) => d.id === activeDocId)?.blocks || [];
      const fromIndex = allBlocks.findIndex((b) => b.id === draggedId);
      const toIndex = allBlocks.findIndex((b) => b.id === block.id);
      if (fromIndex !== -1 && toIndex !== -1) {
        moveBlock(activeDocId, fromIndex, toIndex);
      }
    }
    setIsDragging(false);
  };

  const renderInput = () => {
    const commonProps = {
      ref: inputRef as any,
      value: block.content,
      onChange: (e: any) =>
        updateBlock(docId, block.id, { content: e.target.value }),
      onKeyDown: handleKeyDown,
      placeholder,
      id: `block-${docId}-${block.id}`,
      className: "w-full bg-transparent outline-none",
    };

    if (block.type === "heading") {
      return <input {...commonProps} className="text-2xl font-bold" />;
    }
    if (block.type === "todo") {
      return (
        <div className="flex items-center gap-3 w-full">
          <input
            type="checkbox"
            checked={block.checked}
            onChange={(e) =>
              updateBlock(docId, block.id, { checked: e.target.checked })
            }
            className="w-4 h-4 rounded border-slate-300 accent-blue-600"
          />
          <input
            {...commonProps}
            className={`flex-1 ${block.checked ? "line-through text-slate-400" : ""}`}
          />
        </div>
      );
    }
    return (
      <textarea
        {...(commonProps as any)}
        rows={1}
        className="resize-none overflow-hidden"
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = "auto";
          target.style.height = target.scrollHeight + "px";
        }}
      />
    );
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`group relative flex items-start gap-2 py-1 ${isDragging ? "opacity-50" : ""}`}
      id={`block-${docId}-${block.id}`}
    >
      <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="block-menu-btn cursor-grab"
        >
          ⋮⋮
        </button>
      </div>

      <div className="flex-1">{renderInput()}</div>

      {(showMenu || slashOpen) && (
        <div
          ref={menuRef}
          className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-800 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700 py-1 z-20 min-w-[160px] animate-fade-in"
        >
          <button
            onClick={() => changeType("text")}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            📝 Text
          </button>
          <button
            onClick={() => changeType("heading")}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            # Heading
          </button>
          <button
            onClick={() => changeType("todo")}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            ☑ To-do
          </button>
          <hr className="my-1" />
          <button
            onClick={() => deleteBlock(docId, block.id)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            🗑 Delete
          </button>
        </div>
      )}
    </div>
  );
};
