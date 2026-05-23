import React from "react";
import BlockComponent from "./Block";
import { useDocumentStore } from "@/store/useDocumentStore";
import { translations } from "@/i18n/translations";
import { Plus } from "lucide-react";

interface Props {
  lang: "fa" | "en";
}

export const Editor: React.FC<Props> = ({ lang }) => {
  const t = translations[lang];
  const { activeDocId, blocks, addBlock } = useDocumentStore();

  return (
    <div className="flex-1 p-8 max-w-3xl mx-auto overflow-auto">
      {/* عنوان صفحه */}
      <div className="mb-8">
        <input
          type="text"
          placeholder={t.untitled}
          className="text-4xl font-bold bg-transparent outline-none w-full placeholder:text-slate-300"
        />
      </div>

      {/* لیست بلاک‌ها */}
      <div className="space-y-1">
        {blocks.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg">هیچ بلاکی وجود ندارد</p>
            <button
              onClick={() => addBlock("text")}
              className="mt-6 px-6 py-3 bg-black text-white rounded-xl hover:bg-zinc-800 transition flex items-center gap-2 mx-auto"
            >
              <Plus size={18} />
              اولین بلاک را بساز
            </button>
          </div>
        ) : (
          blocks.map((block) => (
            <BlockComponent
              key={block.id}
              block={block}
              docId={activeDocId || ""}
            />
          ))
        )}
      </div>

      {/* دکمه اضافه کردن بلاک */}
      {blocks.length > 0 && (
        <button
          onClick={() => addBlock("text")}
          className="mt-8 flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm transition"
        >
          <Plus size={18} />
          <span>بلاک جدید (متن)</span>
        </button>
      )}
    </div>
  );
};
