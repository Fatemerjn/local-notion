import React, { useRef, useState } from "react";
import { Copy, Download, Plus, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import { translations } from "@/i18n/translations";
import {
  createPageExportName,
  createWorkspaceExportName,
  downloadJson,
} from "@/lib/export";
import {
  useActiveDocument,
  useDocuments,
  useWorkspaces,
  useWorkspaceActions,
} from "@/store/selectors";
import {
  cloneDocumentForImport,
  normalizeWorkspace,
  normalizeDocument,
} from "@/store/documentStore.utils";
import Block from "./Block";
import { getCountdownLabel, getCountdownTone } from "@/lib/deadlines";

interface Props {
  lang: "fa" | "en";
}

export const Editor: React.FC<Props> = ({ lang }) => {
  const t = translations[lang];
  const activeDocument = useActiveDocument();
  const documents = useDocuments();
  const workspaces = useWorkspaces();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);
  const {
    addBlock,
    duplicateDocument,
    replaceDocuments,
    updateDocument,
    updateDocumentTitle,
  } = useWorkspaceActions();

  if (!activeDocument) {
    return (
      <div className="flex flex-1 items-center justify-center text-slate-400">
        {t.noDocs}
      </div>
    );
  }

  const handleCreateBlock = (afterBlockId?: string) => {
    const newBlockId = addBlock("text", {
      docId: activeDocument.id,
      afterBlockId,
    });

    if (newBlockId) {
      setPendingFocusId(newBlockId);
    }
  };

  const handleDuplicatePage = () => {
    duplicateDocument(activeDocument.id);
  };

  const handleExportPage = () => {
    downloadJson(createPageExportName(activeDocument.title), {
      version: 1,
      exportedAt: new Date().toISOString(),
      document: activeDocument,
    });
    toast.success(t.pageExported);
  };

  const handleExportWorkspace = () => {
    downloadJson(createWorkspaceExportName(), {
      version: 1,
      exportedAt: new Date().toISOString(),
      workspace: {
        workspaces,
        activeWorkspaceId: activeDocument.workspaceId,
        documents,
        activeDocId: activeDocument.id,
      },
    });
    toast.success(t.workspaceExported);
  };

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as
        | {
            document?: unknown;
            documents?: unknown[];
            workspace?: {
              workspaces?: unknown[];
              documents?: unknown[];
              activeWorkspaceId?: string | null;
              activeDocId?: string | null;
            };
          }
        | undefined;

      const incomingDocuments = Array.isArray(parsed?.workspace?.documents)
        ? parsed.workspace?.documents
        : Array.isArray(parsed?.documents)
          ? parsed.documents
          : parsed?.document
            ? [parsed.document]
            : [];

      if (incomingDocuments.length === 0) {
        throw new Error("No documents");
      }

      const normalizedDocuments = incomingDocuments.map((document) =>
        cloneDocumentForImport(
          normalizeDocument(document, activeDocument.workspaceId),
        ),
      );
      const normalizedWorkspaces = Array.isArray(parsed?.workspace?.workspaces)
        ? parsed.workspace.workspaces.map((workspace) =>
            normalizeWorkspace(workspace),
          )
        : workspaces;

      replaceDocuments({
        workspaces: normalizedWorkspaces,
        documents: [...normalizedDocuments, ...documents],
        activeWorkspaceId:
          normalizedDocuments[0]?.workspaceId ?? activeDocument.workspaceId,
        activeDocId: normalizedDocuments[0]?.id,
      });
      toast.success(t.workspaceImported);
    } catch {
      toast.error(t.importFailed);
    } finally {
      event.target.value = "";
    }
  };

  const breadcrumbs = [];
  let parentId = activeDocument.parentId;
  while (parentId) {
    const parent = documents.find((document) => document.id === parentId);
    if (!parent) {
      break;
    }
    breadcrumbs.unshift(parent);
    parentId = parent.parentId ?? null;
  }

  return (
    <div className="flex-1 overflow-auto px-3 pb-24 pt-16 sm:px-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div
          className="h-28 rounded-2xl border border-slate-200/70 bg-cover bg-center shadow-sm dark:border-slate-700/80 sm:h-36 md:h-44 md:rounded-[28px]"
          style={{ background: activeDocument.cover }}
        />

        <div className="-mt-7 mb-6 px-2 sm:-mt-10 sm:mb-8 sm:px-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <input
              type="text"
              value={activeDocument.icon ?? ""}
              onChange={(event) =>
                updateDocument(activeDocument.id, {
                  icon: event.target.value.slice(0, 2),
                })
              }
              aria-label={t.pageIconLabel}
              placeholder={t.pageIconPlaceholder}
              className="h-12 w-14 rounded-2xl border border-slate-200 bg-white/90 text-center text-2xl shadow-sm outline-none backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 sm:h-14 sm:w-16 sm:text-3xl"
            />
            <button
              onClick={handleDuplicatePage}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              title={t.duplicatePage}
            >
              <Copy size={16} />
              <span className="hidden sm:inline">{t.duplicatePage}</span>
            </button>
            <button
              onClick={handleExportPage}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              title={t.exportPage}
            >
              <Download size={16} />
              <span className="hidden sm:inline">{t.exportPage}</span>
            </button>
            <button
              onClick={handleExportWorkspace}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              title={t.exportWorkspace}
            >
              <Download size={16} />
              <span className="hidden sm:inline">{t.exportWorkspace}</span>
            </button>
            <button
              onClick={() => importInputRef.current?.click()}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              title={t.importWorkspace}
            >
              <Upload size={16} />
              <span className="hidden sm:inline">{t.importWorkspace}</span>
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
          <div className="mt-2 hidden text-xs text-slate-400 sm:block">
            {t.importHint}
          </div>
        </div>

        <div className="mb-6 px-2 sm:mb-8 sm:px-4">
          {breadcrumbs.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-400">
              {breadcrumbs.map((document) => (
                <span key={document.id} className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
                  {document.title || t.untitled}
                </span>
              ))}
            </div>
          )}
          <input
            type="text"
            value={activeDocument.title}
            onChange={(event) =>
              updateDocumentTitle(activeDocument.id, event.target.value)
            }
            placeholder={t.untitled}
            className="w-full bg-transparent text-3xl font-bold outline-none placeholder:text-slate-300 sm:text-4xl"
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
              type="date"
              value={activeDocument.deadline ?? ""}
              onChange={(event) =>
                updateDocument(activeDocument.id, {
                  deadline: event.target.value,
                })
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900"
            />
            <span
              className={`rounded-full px-3 py-1.5 text-xs ${getCountdownTone(
                activeDocument.deadline,
              )}`}
            >
              {getCountdownLabel(activeDocument.deadline)}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          {activeDocument.blocks.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <p className="text-lg">هیچ بلاکی وجود ندارد</p>
              <button
                onClick={() => handleCreateBlock()}
                className="mx-auto mt-6 flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-white transition hover:bg-zinc-800"
              >
                <Plus size={18} />
                اولین بلاک را بساز
              </button>
            </div>
          ) : (
            activeDocument.blocks.map((block, index) => (
              <Block
                key={block.id}
                block={block}
                docId={activeDocument.id}
                lang={lang}
                index={index}
                totalBlocks={activeDocument.blocks.length}
                previousBlockId={activeDocument.blocks[index - 1]?.id ?? null}
                nextBlockId={activeDocument.blocks[index + 1]?.id ?? null}
                shouldFocus={pendingFocusId === block.id}
                onFocusHandled={() => setPendingFocusId(null)}
                onRequestFocus={(blockId) => setPendingFocusId(blockId)}
              />
            ))
          )}
        </div>

        {activeDocument.blocks.length > 0 && (
          <button
            onClick={() =>
              handleCreateBlock(
                activeDocument.blocks[activeDocument.blocks.length - 1]?.id,
              )
            }
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
