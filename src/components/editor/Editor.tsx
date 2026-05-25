import React, { useRef, useState } from "react";
import { Copy, Download, Lock, MoreHorizontal, Plus, Star, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
import type { BlockType } from "@/types";
import Block from "./Block";
import { ProjectDatabase } from "./ProjectDatabase";

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
    updateDocumentTitle,
    moveBlock,
    updateDocument,
  } = useWorkspaceActions();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  if (!activeDocument) {
    return (
      <div className="flex flex-1 items-center justify-center text-slate-400">
        {t.noDocs}
      </div>
    );
  }

  const handleCreateBlock = (afterBlockId?: string, type: BlockType = "text") => {
    const newBlockId = addBlock(type, {
      docId: activeDocument.id,
      afterBlockId,
    });

    if (newBlockId) {
      setPendingFocusId(newBlockId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const fromIndex = activeDocument.blocks.findIndex(
      (block) => block.id === active.id,
    );
    const toIndex = activeDocument.blocks.findIndex(
      (block) => block.id === over.id,
    );

    if (fromIndex >= 0 && toIndex >= 0) {
      moveBlock(fromIndex, toIndex, activeDocument.id);
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
  const databaseBlock = activeDocument.blocks.find(
    (block) => block.type === "database",
  );
  const isDatabasePage =
    Boolean(databaseBlock) &&
    (activeDocument.layout === "database" ||
      activeDocument.title.toLowerCase() === "projects" ||
      activeDocument.title === "پروژه‌ها");

  if (isDatabasePage && databaseBlock) {
    return (
      <div className="flex-1 overflow-auto bg-white px-3 pb-24 pt-16 text-slate-950 dark:bg-slate-950 dark:text-slate-50 sm:px-6 md:px-10 md:py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex min-w-0 items-center gap-2">
              <input
                type="text"
                value={activeDocument.icon ?? ""}
                onChange={(event) =>
                  updateDocument(activeDocument.id, {
                    icon: event.target.value.slice(0, 2),
                  })
                }
                aria-label={t.pageIconLabel}
                className="h-8 w-8 rounded-md bg-transparent text-center text-xl outline-none transition hover:bg-slate-100 dark:hover:bg-slate-900"
              />
              <span className="truncate font-medium text-slate-800 dark:text-slate-100">
                {activeDocument.title || t.untitled}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Lock size={14} />
                Private
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="hidden text-slate-400 sm:inline">Edited now</span>
              <button
                type="button"
                onClick={handleDuplicatePage}
                className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                title={t.duplicatePage}
              >
                <Copy size={17} />
              </button>
              <button
                type="button"
                onClick={handleExportPage}
                className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                title={t.exportPage}
              >
                <Download size={17} />
              </button>
              <button
                type="button"
                onClick={handleExportWorkspace}
                className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                title={t.exportWorkspace}
              >
                <Download size={17} />
              </button>
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                title={t.importWorkspace}
              >
                <Upload size={17} />
              </button>
              <Star size={17} className="text-slate-500 dark:text-slate-300" />
              <MoreHorizontal size={18} className="text-slate-500 dark:text-slate-300" />
              <input
                ref={importInputRef}
                type="file"
                accept="application/json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <input
              type="text"
              value={activeDocument.icon ?? ""}
              onChange={(event) =>
                updateDocument(activeDocument.id, {
                  icon: event.target.value.slice(0, 2),
                })
              }
              aria-label={t.pageIconLabel}
              className="h-14 w-14 rounded-lg bg-transparent text-center text-5xl outline-none transition hover:bg-slate-100 dark:hover:bg-slate-900"
            />
            <input
              type="text"
              value={activeDocument.title}
              onChange={(event) =>
                updateDocumentTitle(activeDocument.id, event.target.value)
              }
              placeholder={t.untitled}
              className="min-w-0 flex-1 bg-transparent text-4xl font-bold tracking-tight text-slate-900 outline-none placeholder:text-slate-300 dark:text-slate-50 dark:placeholder:text-slate-700 sm:text-5xl"
            />
          </div>

          <ProjectDatabase
            block={databaseBlock}
            docId={activeDocument.id}
            lang={lang}
            variant="page"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto px-3 pb-24 pt-16 sm:px-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 px-2 sm:mb-8 sm:px-4">
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
            className="w-full bg-transparent text-3xl font-bold text-slate-950 outline-none placeholder:text-slate-300 dark:text-slate-50 dark:placeholder:text-slate-600 sm:text-4xl"
          />
        </div>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext
            items={activeDocument.blocks.map((block) => block.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1 text-slate-950 dark:text-slate-50">
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
                    numberedListIndex={
                      block.type === "numbered-list"
                        ? activeDocument.blocks
                            .slice(0, index + 1)
                            .filter((item) => item.type === "numbered-list")
                            .length
                        : null
                    }
                    totalBlocks={activeDocument.blocks.length}
                    previousBlockId={
                      activeDocument.blocks[index - 1]?.id ?? null
                    }
                    nextBlockId={activeDocument.blocks[index + 1]?.id ?? null}
                    shouldFocus={pendingFocusId === block.id}
                    onFocusHandled={() => setPendingFocusId(null)}
                    onRequestFocus={(blockId) => setPendingFocusId(blockId)}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>

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
