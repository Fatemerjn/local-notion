import { useDocumentStore } from "../store/useDocumentStore";
import { RichBlock } from "./RichBlock"; // ← تغییر مهم
import { translations } from "../i18n/translations";
import { DndContext, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface Props {
  lang: "en" | "fa";
}

export const Editor = ({ lang }: Props) => {
  const t = translations[lang];
  const {
    documents,
    activeDocId,
    updateDocumentTitle,
    createDocument,
    moveBlock,
  } = useDocumentStore();

  const activeDoc = documents.find((d) => d.id === activeDocId);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && activeDocId) {
      const oldIndex =
        activeDoc?.blocks.findIndex((b) => b.id === active.id) ?? -1;
      const newIndex =
        activeDoc?.blocks.findIndex((b) => b.id === over?.id) ?? -1;
      if (oldIndex !== -1 && newIndex !== -1) {
        moveBlock(activeDocId, oldIndex, newIndex);
      }
    }
  };

  if (!activeDoc) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        <div className="text-center space-y-2">
          <p>{t.noDocs}</p>
          <button
            onClick={() => createDocument(t.untitled)}
            className="text-blue-600 underline"
          >
            {t.createFirst}
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <input
          type="text"
          value={activeDoc.title}
          onChange={(e) => updateDocumentTitle(activeDoc.id, e.target.value)}
          placeholder={t.placeholderTitle}
          className="w-full text-4xl md:text-5xl font-bold bg-transparent border-none outline-none mb-8 placeholder:text-slate-300 dark:placeholder:text-slate-700"
        />
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={activeDoc.blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {activeDoc.blocks.map(
                (
                  block, // idx حذف شد
                ) => (
                  <RichBlock
                    key={block.id}
                    block={block}
                    docId={activeDoc.id}
                    lang={lang}
                  />
                ),
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </main>
  );
};
