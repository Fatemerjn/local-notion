import { useState } from "react";
import {
  ChevronRight,
  FileText,
  Languages,
  Plus,
  Search,
  Table2,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS, faIR } from "date-fns/locale";
import { translations } from "@/i18n/translations";
import {
  useActiveDocId,
  useActiveWorkspaceId,
  useDocuments,
  useWorkspaces,
  useWorkspaceActions,
} from "@/store/selectors";
import type { Document } from "@/types";

interface Props {
  lang: "en" | "fa";
  onLangToggle: () => void;
  onNavigate?: () => void;
  className?: string;
}

export const Sidebar = ({ lang, onLangToggle, onNavigate, className = "" }: Props) => {
  const t = translations[lang];
  const documents = useDocuments();
  const workspaces = useWorkspaces();
  const activeDocId = useActiveDocId();
  const activeWorkspaceId = useActiveWorkspaceId();
  const activeWorkspace = workspaces.find(
    (workspace) => workspace.id === activeWorkspaceId,
  );
  const {
    createChildDocument,
    createDocument,
    createWorkspace,
    deleteDocument,
    setActiveDocId,
    setActiveWorkspaceId,
    updateWorkspace,
  } = useWorkspaceActions();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const activeWorkspaceDocuments = documents.filter(
    (document) => document.workspaceId === activeWorkspaceId,
  );
  const filteredDocs = activeWorkspaceDocuments.filter((document) =>
    document.title.toLowerCase().includes(search.toLowerCase()),
  );
  const visibleDocs = search ? filteredDocs : activeWorkspaceDocuments;
  const childMap = visibleDocs.reduce<Record<string, Document[]>>(
    (accumulator, document) => {
      const key = document.parentId ?? "root";
      accumulator[key] = [...(accumulator[key] ?? []), document];
      return accumulator;
    },
    {},
  );

  const renderDocument = (document: Document, depth = 0) => {
    const children = childMap[document.id] ?? [];
    const isExpanded = search ? true : expanded[document.id] ?? true;

    return (
      <div key={document.id}>
        <div
          onClick={() => {
            setActiveDocId(document.id);
            onNavigate?.();
          }}
          className={`group flex cursor-pointer items-center justify-between rounded-lg py-2 pl-2 pr-3 transition ${
            document.id === activeDocId
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
              : "hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          style={{ marginInlineStart: depth * 12 }}
        >
          <div className="flex min-w-0 flex-1 items-start gap-1">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setExpanded((current) => ({
                  ...current,
                  [document.id]: !isExpanded,
                }));
              }}
              className={`mt-0.5 rounded p-0.5 text-slate-400 transition ${
                children.length === 0 ? "opacity-0" : "hover:bg-slate-200"
              }`}
            >
              <ChevronRight
                size={14}
                className={`transition ${isExpanded ? "rotate-90" : ""}`}
              />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {document.layout === "database" ? (
                  <Table2 size={14} className="shrink-0" />
                ) : (
                  <FileText size={14} className="shrink-0" />
                )}
                <span className="truncate text-sm font-medium">
                  {document.title || t.untitled}
                </span>
              </div>
              <span className="ms-6 text-xs text-slate-400">
                {formatDistanceToNow(document.updatedAt, {
                  addSuffix: true,
                  locale: lang === "fa" ? faIR : enUS,
                })}
              </span>
            </div>
          </div>
          <div className="flex opacity-0 transition group-hover:opacity-100">
            <button
              onClick={(event) => {
                event.stopPropagation();
                createChildDocument(document.id, t.untitled);
                setExpanded((current) => ({ ...current, [document.id]: true }));
                onNavigate?.();
              }}
              className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                deleteDocument(document.id);
              }}
              className="rounded p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        {isExpanded && children.map((child) => renderDocument(child, depth + 1))}
      </div>
    );
  };

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

        <div className="mb-3 grid grid-cols-[1fr_auto] gap-2">
          <select
            value={activeWorkspaceId ?? ""}
            onChange={(event) => setActiveWorkspaceId(event.target.value)}
            className="min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.icon} {workspace.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => createWorkspace("New workspace")}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
          >
            <Plus size={16} />
          </button>
        </div>

        {activeWorkspace && (
          <div className="mb-3 grid grid-cols-[auto_1fr] gap-2">
            <input
              value={activeWorkspace.icon}
              onChange={(event) =>
                updateWorkspace(activeWorkspace.id, {
                  icon: event.target.value.slice(0, 2) || "🏠",
                })
              }
              className="w-12 rounded-lg border border-slate-200 bg-white px-2 py-2 text-center text-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              aria-label="Workspace icon"
            />
            <input
              value={activeWorkspace.name}
              onChange={(event) =>
                updateWorkspace(activeWorkspace.id, {
                  name: event.target.value,
                })
              }
              className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              aria-label="Workspace name"
            />
          </div>
        )}

        <button
          onClick={() => {
            createDocument(t.untitled, {
              workspaceId: activeWorkspaceId ?? undefined,
            });
            onNavigate?.();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-white transition hover:bg-blue-700"
        >
          <Plus size={16} />
          {t.newDocButton}
        </button>

        <button
          onClick={() => {
            createDocument(lang === "fa" ? "پروژه‌ها" : "Projects", {
              workspaceId: activeWorkspaceId ?? undefined,
              template: "database",
            });
            onNavigate?.();
          }}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <Plus size={16} />
          {t.databasePageButton}
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
        {visibleDocs.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            {t.noDocs}
          </div>
        ) : (
          (childMap.root ?? []).map((document) => renderDocument(document))
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
