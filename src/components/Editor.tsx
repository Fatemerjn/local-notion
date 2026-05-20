import { useDocumentStore } from "../store/useDocumentStore";
import { Block } from "./Block";
import { translations } from "../i18n/translations";

interface Props {
  lang: "en" | "fa";
}

export const Editor = ({ lang }: Props) => {
  const t = translations[lang];
  const { documents, activeDocId, updateDocumentTitle, createDocument } =
    useDocumentStore();
  const activeDoc = documents.find((d) => d.id === activeDocId);

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
        <div className="space-y-4">
          {activeDoc.blocks.map((block, idx) => (
            <Block
              key={block.id}
              block={block}
              docId={activeDoc.id}
              isFirst={idx === 0}
              isLast={idx === activeDoc.blocks.length - 1}
              lang={lang}
            />
          ))}
        </div>
      </div>
    </main>
  );
};
