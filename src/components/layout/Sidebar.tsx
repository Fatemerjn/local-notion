import { useState } from "react";
import { FileText, Languages, Plus, Search, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS, faIR } from "date-fns/locale";
import { translations } from "@/i18n/translations";
import {
  useActiveDocId,
  useDocuments,
  useWorkspaceActions,
} from "@/store/selectors";

interface Props {
  lang: "en" | "fa";
  onLangToggle: () => void;
  onNavigate?: () => void;
  className?: string;
}

export const Sidebar = ({ lang, onLangToggle, onNavigate, className = "" }: Props) => {
  const t = translations[lang];
  const documents = useDocuments();
  const activeDocId = useActiveDocId();
  const { createDocument, deleteDocument, setActiveDocId } = useWorkspaceActions();
  const [search, setSearch] = useState("");

  const filteredDocs = documents.filter((document) =>
    document.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside
      className={`flex h-full w-80 max-w-[86vw] flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 md:w-72 ${className}`}
    >
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent">
            Local Notion
          </h1>
          <button
            onClick={onLangToggle}
            className="rounded-md p-1.5 transition hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <Languages size={18} />
          </button>
        </div>

        <button
          onClick={() => {
            createDocument(t.untitled);
            onNavigate?.();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-white transition hover:bg-blue-700"
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
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-md border border-slate-200 bg-slate-100 py-1.5 pl-9 pr-3 text-sm focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {filteredDocs.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            {t.noDocs}
          </div>
        ) : (
          filteredDocs.map((document) => (
            <div
              key={document.id}
              onClick={() => {
                setActiveDocId(document.id);
                onNavigate?.();
              }}
              className={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition ${
                document.id === activeDocId
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <div className="min-w-0 flex flex-col">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="shrink-0" />
                  <span className="truncate text-sm font-medium">
                    {document.title || t.untitled}
                  </span>
                </div>
                <span className="ml-6 text-xs text-slate-400">
                  {formatDistanceToNow(document.updatedAt, {
                    addSuffix: true,
                    locale: lang === "fa" ? faIR : enUS,
                  })}
                </span>
              </div>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  deleteDocument(document.id);
                }}
                className="rounded p-1 text-red-500 opacity-0 transition hover:bg-red-100 dark:hover:bg-red-900/40 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="font-medium text-slate-700 dark:text-slate-300">
          {t.shortcutsTitle}
        </div>
        <div className="mt-1">{t.shortcutNewPage}</div>
        <div>{t.shortcutTheme}</div>
      </div>
    </aside>
  );
};
