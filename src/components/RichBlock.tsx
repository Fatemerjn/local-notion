// src/components/RichBlock.tsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Suggestion from "@tiptap/suggestion";
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

const suggestionItems = [
  { title: "متن", command: "text", icon: "✍️" },
  { title: "عنوان ۱", command: "h1", icon: "H1" },
  { title: "عنوان ۲", command: "h2", icon: "H2" },
  { title: "عنوان ۳", command: "h3", icon: "H3" },
  { title: "تودی", command: "todo", icon: "☑️" },
  { title: "لیست بولت", command: "bullet", icon: "•" },
  { title: "لیست شماره‌دار", command: "numbered", icon: "1." },
  { title: "نقل قول", command: "quote", icon: "“" },
  { title: "کد", command: "code", icon: "</>" },
  { title: "خط جدا", command: "divider", icon: "—" },
];

export const RichBlock = ({ block, docId, lang }: Props) => {
  const { updateBlock, addBlock, deleteBlock } = useDocumentStore();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({
        placeholder:
          lang === "fa" ? "بنویسید یا / بزنید..." : "Type / for commands...",
      }),
      Link,
      Suggestion.configure({
        char: "/",
        items: ({ query }: { query: string }) => {
          return suggestionItems.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase()),
          );
        },
        command: ({ editor: e, props }) => {
          const { from } = e.state.selection;
          e.chain()
            .focus()
            .deleteRange({ from: from - 1, to: from })
            .run();

          switch (props.command) {
            case "h1":
              e.chain().toggleHeading({ level: 1 }).run();
              break;
            case "h2":
              e.chain().toggleHeading({ level: 2 }).run();
              break;
            case "h3":
              e.chain().toggleHeading({ level: 3 }).run();
              break;
            case "todo":
              e.chain().toggleTaskList().run();
              break;
            case "bullet":
              e.chain().toggleBulletList().run();
              break;
            case "numbered":
              e.chain().toggleOrderedList().run();
              break;
            case "quote":
              e.chain().toggleBlockquote().run();
              break;
            case "code":
              e.chain().toggleCodeBlock().run();
              break;
            case "divider":
              e.chain().setHorizontalRule().run();
              break;
          }
        },
      }),
    ],
    content: block.content || "<p></p>",
    onUpdate: ({ editor }) =>
      updateBlock(docId, block.id, { content: editor.getHTML() }),
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
      className="group relative flex gap-3 py-2"
    >
      <div
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 cursor-grab pt-2 text-slate-400"
      >
        <GripVertical size={18} />
      </div>

      <div className="flex-1 prose dark:prose-invert max-w-none">
        <EditorContent editor={editor} />
      </div>

      <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1">
        <button
          onClick={() => addBlock(docId, block.id)}
          className="text-slate-400 hover:text-blue-500"
        >
          <Plus size={18} />
        </button>
        <button
          onClick={() => deleteBlock(docId, block.id)}
          className="text-slate-400 hover:text-red-500"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
