// src/components/RichBlock.tsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useDocumentStore } from "../store/useDocumentStore";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  block: any;
  docId: string;
  lang: "en" | "fa";
}

export const RichBlock = ({ block, docId, lang }: Props) => {
  const { updateBlock, addBlock, deleteBlock } = useDocumentStore();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({
        placeholder:
          lang === "fa"
            ? "بنویسید یا / بزنید برای دستورات..."
            : "Type / for commands...",
      }),
      Link,
    ],
    content: block.content || "<p></p>",
    onUpdate: ({ editor }) => {
      updateBlock(docId, block.id, { content: editor.getHTML() });
    },
    editorProps: {
      attributes: {
        class: "min-h-[1.5em] outline-none py-1 text-[16px] leading-relaxed",
      },
    },
  });

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
      className="group relative flex gap-4 py-3 pl-4 border-l-4 border-transparent hover:border-blue-500 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 cursor-grab pt-3 text-slate-400 hover:text-slate-600 flex-shrink-0"
      >
        <GripVertical size={20} />
      </div>

      {/* Rich Text Area */}
      <div className="flex-1 prose dark:prose-invert max-w-none prose-headings:font-bold prose-p:my-1 focus-within:outline-none">
        <EditorContent editor={editor} />
      </div>

      {/* Hover Actions */}
      <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1 pt-3">
        <button
          onClick={() => addBlock(docId, block.id)}
          className="text-slate-400 hover:text-blue-600 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
        >
          <Plus size={20} />
        </button>
        <button
          onClick={() => deleteBlock(docId, block.id)}
          className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};
