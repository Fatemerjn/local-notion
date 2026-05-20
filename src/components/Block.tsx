import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import type { Block as BlockType, BlockType as BlockTypeEnum } from "../types";
import { useDocumentStore } from "../store/useDocumentStore";
import { getBlockPlaceholder } from "../utils/blockUtils";
import TextareaAutosize from "react-textarea-autosize";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Type, Heading1, CheckSquare } from "lucide-react";

interface Props {
  block: BlockType;
  docId: string;
  isFirst: boolean;
  isLast: boolean;
  lang: "en" | "fa";
  id: string; // برای dnd-kit
}

export const Block = ({ block, docId, isFirst, isLast, lang, id }: Props) => {
  const { updateBlock, addBlock, deleteBlock } = useDocumentStore();
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashSearch, setSlashSearch] = useState("");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const placeholder = getBlockPlaceholder(block.type, lang);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowSlashMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    // اسلش منو
    if (e.key === "/" && block.content === "" && !showSlashMenu) {
      e.preventDefault();
      setShowSlashMenu(true);
      setSlashSearch("");
    }

    // Enter برای بلاک جدید
    if (e.key === "Enter" && !e.shiftKey && !showSlashMenu) {
      e.preventDefault();
      addBlock(docId, block.id, "text");
    }

    // Backspace برای حذف بلاک خالی
    if (e.key === "Backspace" && block.content === "" && !isFirst) {
      e.preventDefault();
      deleteBlock(docId, block.id);
    }

    // حرکت با کلیدهای بالا/پایین
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
    setShowSlashMenu(false);
    inputRef.current?.focus();
  };

  const slashOptions = [
    {
      type: "text" as BlockTypeEnum,
      icon: Type,
      label: "Text",
      shortcut: "text",
    },
    {
      type: "heading" as BlockTypeEnum,
      icon: Heading1,
      label: "Heading 1",
      shortcut: "heading",
    },
    {
      type: "todo" as BlockTypeEnum,
      icon: CheckSquare,
      label: "To-do list",
      shortcut: "todo",
    },
  ].filter((opt) =>
    opt.label.toLowerCase().includes(slashSearch.toLowerCase()),
  );

  const renderInput = () => {
    // commonProps بدون ref برای جلوگیری از خطای تایپ
    const commonProps = {
      value: block.content,
      onChange: (e: any) =>
        updateBlock(docId, block.id, { content: e.target.value }),
      onKeyDown: handleKeyDown,
      placeholder,
      id: `block-${docId}-${block.id}`,
      className: "w-full bg-transparent outline-none resize-none",
      onFocus: () => setShowSlashMenu(false),
    };

    if (block.type === "heading") {
      return (
        <input
          {...commonProps}
          ref={inputRef as any}
          className="text-3xl font-bold w-full bg-transparent outline-none"
        />
      );
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
            ref={inputRef as any}
            className={`flex-1 bg-transparent outline-none ${block.checked ? "line-through text-slate-400" : ""}`}
          />
        </div>
      );
    }
    return (
      <TextareaAutosize
        {...commonProps}
        ref={inputRef as any}
        className="w-full bg-transparent outline-none resize-none"
      />
    );
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition px-1"
        >
          <GripVertical size={16} className="text-slate-400" />
        </div>
        <div className="flex-1">{renderInput()}</div>
      </div>

      {showSlashMenu && (
        <div
          ref={menuRef}
          className="absolute left-8 top-0 mt-1 bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-slate-200 dark:border-slate-700 py-1 z-50 min-w-[200px]"
        >
          <div className="px-2 py-1 border-b border-slate-100 dark:border-slate-700">
            <input
              type="text"
              placeholder="Search commands..."
              value={slashSearch}
              onChange={(e) => setSlashSearch(e.target.value)}
              className="w-full text-sm bg-transparent outline-none"
              autoFocus
            />
          </div>
          {slashOptions.map((opt) => (
            <button
              key={opt.type}
              onClick={() => changeType(opt.type)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <opt.icon size={14} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
