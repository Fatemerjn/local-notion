import React from "react";
import { Plus } from "lucide-react";
import { translations } from "@/i18n/translations";
import { useActiveDocument, useWorkspaceActions } from "@/store/selectors";
import Block from "./Block";

interface Props {
  lang: "fa" | "en";
}

export const Editor: React.FC<Props> = ({ lang }) => {
  const t = translations[lang];
  const activeDocument = useActiveDocument();
  const { addBlock, updateDocumentTitle } = useWorkspaceActions();

  if (!activeDocument) {
    return (
      <div className="flex flex-1 items-center justify-center text-slate-400">
        {t.noDocs}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <input
            type="text"
            value={activeDocument.title}
            onChange={(event) =>
              updateDocumentTitle(activeDocument.id, event.target.value)
            }
            placeholder={t.untitled}
            className="w-full bg-transparent text-4xl font-bold outline-none placeholder:text-slate-300"
          />
        </div>

        <div className="space-y-1">
          {activeDocument.blocks.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <p className="text-lg">هیچ بلاکی وجود ندارد</p>
              <button
                onClick={() => addBlock("text", { docId: activeDocument.id })}
                className="mx-auto mt-6 flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-white transition hover:bg-zinc-800"
              >
                <Plus size={18} />
                اولین بلاک را بساز
              </button>
            </div>
          ) : (
            activeDocument.blocks.map((block) => (
              <Block key={block.id} block={block} docId={activeDocument.id} />
            ))
          )}
        </div>

        {activeDocument.blocks.length > 0 && (
          <button
            onClick={() => addBlock("text", { docId: activeDocument.id })}
            className="mt-8 flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
          >
            <Plus size={18} />
            <span>بلاک جدید (متن)</span>
          </button>
        )}
      </div>
    </div>
  );
};
