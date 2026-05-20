import { useDocumentStore } from "../store/useDocumentStore";
import { translations } from "../i18n/translations";
import { useState } from "react";
import { Plus, Search, FileText, Trash2, Languages } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { faIR, enUS } from "date-fns/locale";

interface Props {
  lang: "en" | "fa";
  onLangToggle: () => void;
}

export const Sidebar = ({ lang, onLangToggle }: Props) => {
  const t = translations[lang];
  const {
    documents,
    activeDocId,
    setActiveDocId,
    createDocument,
    deleteDocument,
  } = useDocumentStore();
  const [search, setSearch] = useState("");

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside className="w-72 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Local Notion
          </h1>
          <button
            onClick={onLangToggle}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <Languages size={18} />
          </button>
        </div>
        <button
          onClick={() => createDocument(t.untitled)}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
        >
          <Plus size={16} />
          {t.newDocButton}
        </button>
        <div className="relative mt-3">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder={t.searchDocs}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredDocs.length === 0 ? (
          <div className="text-center text-slate-400 text-sm py-8">
            {t.noDocs}
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setActiveDocId(doc.id)}
              className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition ${
                doc.id === activeDocId
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="shrink-0" />
                  <span className="truncate text-sm font-medium">
                    {doc.title || t.untitled}
                  </span>
                </div>
                <span className="text-xs text-slate-400 ml-6">
                  {formatDistanceToNow(doc.updatedAt, {
                    addSuffix: true,
                    locale: lang === "fa" ? faIR : enUS,
                  })}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteDocument(doc.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
