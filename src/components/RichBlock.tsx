// src/components/RichBlock.tsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useDocumentStore } from "../store/useDocumentStore";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect } from "react";

interface Props {
  block: any;
  docId: string;
  lang: "en" | "fa";
}

export const RichBlock = ({ block, docId, lang }: Props) => {
  const { updateBlock, addBlock, deleteBlock } = useDocumentStore();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder:
          lang === "fa" ? "بنویسید یا / بزنید..." : "Type / for commands...",
      }),
      Link,
    ],
    content: block.content || "<p></p>",
    onUpdate: ({ editor }) => {
      updateBlock(docId, block.id, { content: editor.getHTML() });
    },
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[1.5em] prose dark:prose-invert max-w-none",
      },
      handleKeyDown: (view, event) => {
        // لیست بولت
        if (event.key === "-" && event.shiftKey === false) {
          const { state } = view;
          const { from } = state.selection;
          const textBefore = state.doc.textBetween(Math.max(0, from - 5), from);

          if (textBefore.trim() === "" || textBefore.endsWith("\n")) {
            event.preventDefault();
            editor?.chain().focus().toggleBulletList().run();
            return true;
          }
        }

        // لیست شماره‌دار
        if (event.key === "1" && event.shiftKey === false) {
          const { state } = view;
          const { from } = state.selection;
          const textBefore = state.doc.textBetween(Math.max(0, from - 5), from);

          if (textBefore.trim() === "1." || textBefore.endsWith("\n1.")) {
            event.preventDefault();
            editor?.chain().focus().toggleOrderedList().run();
            return true;
          }
        }

        return false;
      },
    },
  });

  // Drag & Drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex gap-3 py-3 border-l-2 border-transparent hover:border-blue-500 pl-3"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 cursor-grab pt-2 text-slate-400 hover:text-slate-600"
      >
        <GripVertical size={18} />
      </div>

      {/* Editor */}
      <div className="flex-1">
        <EditorContent editor={editor} />
      </div>

      {/* Actions */}
      <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1 pt-2">
        <button
          onClick={() => addBlock(docId, block.id)}
          className="text-slate-400 hover:text-blue-500 p-1 rounded hover:bg-slate-800"
        >
          <Plus size={18} />
        </button>
        <button
          onClick={() => deleteBlock(docId, block.id)}
          className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-800"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
