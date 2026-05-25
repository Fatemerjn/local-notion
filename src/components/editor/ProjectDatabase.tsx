import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  Columns3,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
  Table2,
  Trash2,
} from "lucide-react";
import type {
  Block,
  DatabaseBlockProperties,
  DatabaseSelectOption,
  DatabaseView,
  ProjectRow,
  ProjectStatus,
} from "@/types";
import {
  getCountdownLabel,
  getCountdownTone,
  getPersianDateInputValue,
  getPersianDateLabel,
  jalaliToGregorianDate,
} from "@/lib/deadlines";
import { useWorkspaceActions } from "@/store/selectors";

interface ProjectDatabaseProps {
  block: Block;
  docId: string;
  lang?: "fa" | "en";
  variant?: "block" | "page";
}

const statusOptions: Array<{
  value: ProjectStatus;
  label: { fa: string; en: string };
}> = [
  { value: "not-started", label: { fa: "شروع نشده", en: "Not started" } },
  { value: "in-progress", label: { fa: "در حال انجام", en: "In progress" } },
  { value: "blocked", label: { fa: "مسدود", en: "Blocked" } },
  { value: "done", label: { fa: "انجام شده", en: "Done" } },
];

const colorClasses: Record<DatabaseSelectOption["color"], string> = {
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-100",
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-100",
  purple: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-100",
  rose: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-100",
  orange: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-100",
};

const optionColors: DatabaseSelectOption["color"][] = [
  "blue",
  "green",
  "amber",
  "purple",
  "rose",
  "orange",
  "slate",
];

const labels = {
  fa: {
    allTasks: "همه تسک‌ها",
    board: "برد",
    byCategory: "بر اساس کتگوری",
    category: "کتگوری",
    countdown: "شمارش معکوس",
    deadline: "ددلاین",
    filter: "مخفی کردن انجام‌شده‌ها",
    gregorianDate: "میلادی",
    new: "جدید",
    notes: "یادداشت",
    owner: "مسئول",
    persianDate: "شمسی ۱۴۰۳/۰۳/۰۵",
    project: "پروژه",
    search: "جستجو...",
    settings: "گزینه‌های پروژه و کتگوری",
    sort: "مرتب‌سازی ددلاین",
    status: "وضعیت",
    typeToCreate: "انتخاب کن یا گزینه جدید بساز",
  },
  en: {
    allTasks: "All Tasks",
    board: "Board",
    byCategory: "By Category",
    category: "Category",
    countdown: "Countdown",
    deadline: "Deadline",
    filter: "Hide done",
    gregorianDate: "Gregorian",
    new: "New",
    notes: "Notes",
    owner: "Owner",
    persianDate: "Jalali 1403/03/05",
    project: "Project",
    search: "Search...",
    settings: "Project and category options",
    sort: "Sort by deadline",
    status: "Status",
    typeToCreate: "Select an option or create one",
  },
};

const createOption = (name: string, index: number): DatabaseSelectOption => ({
  id: crypto.randomUUID(),
  name,
  color: optionColors[index % optionColors.length],
});

const getStatusTone = (status: ProjectStatus) => {
  if (status === "done") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-100";
  }

  if (status === "in-progress") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-100";
  }

  if (status === "blocked") {
    return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-100";
  }

  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200";
};

export const ProjectDatabase = ({
  block,
  docId,
  lang = "fa",
  variant = "block",
}: ProjectDatabaseProps) => {
  const text = labels[lang];
  const isPage = variant === "page";
  const { addProjectRow, deleteProjectRow, updateBlock, updateProjectRow } =
    useWorkspaceActions();
  const database = block.properties?.database;
  const rows = database?.projects ?? [];
  const columns = database?.columns ?? {
    title: text.project,
    category: text.category,
    status: text.status,
    deadline: text.deadline,
    countdown: text.countdown,
    priority: "Priority",
    owner: text.owner,
    notes: text.notes,
  };
  const options = database?.options ?? { projects: [], categories: [] };
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const [draftOption, setDraftOption] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hideDone, setHideDone] = useState(false);
  const [sortByDeadline, setSortByDeadline] = useState(false);
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [search, setSearch] = useState("");
  const [jalaliDrafts, setJalaliDrafts] = useState<Record<string, string>>({});

  const updateDatabase = (updates: Partial<DatabaseBlockProperties>) => {
    updateBlock(
      block.id,
      {
        properties: {
          database: {
            view: database?.view ?? "table",
            columns,
            options,
            projects: rows,
            ...updates,
          },
        },
      },
      docId,
    );
  };

  const updateView = (view: DatabaseView) => {
    updateDatabase({ view });
  };

  const displayedRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (hideDone && row.status === "done") {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [row.title, row.category, row.owner, row.notes]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });

    if (groupByCategory) {
      return [...filtered].sort((first, second) =>
        `${first.category}${first.title}`.localeCompare(
          `${second.category}${second.title}`,
        ),
      );
    }

    if (!sortByDeadline) {
      return filtered;
    }

    return [...filtered].sort((first, second) => {
      if (!first.deadline) {
        return 1;
      }

      if (!second.deadline) {
        return -1;
      }

      return first.deadline.localeCompare(second.deadline);
    });
  }, [groupByCategory, hideDone, rows, search, sortByDeadline]);

  const updateOptions = (
    key: keyof DatabaseBlockProperties["options"],
    nextOptions: DatabaseSelectOption[],
  ) => {
    updateDatabase({
      options: {
        ...options,
        [key]: nextOptions,
      },
    });
  };

  const handleCreateOption = (
    key: keyof DatabaseBlockProperties["options"],
    row: ProjectRow | null,
    field: "title" | "category",
  ) => {
    const name = draftOption.trim();
    if (!name) {
      return;
    }

    const nextOption = createOption(name, options[key].length);
    updateDatabase({
      options: {
        ...options,
        [key]: [...options[key], nextOption],
      },
      projects: row
        ? rows.map((currentRow) =>
            currentRow.id === row.id
              ? { ...currentRow, [field]: name, updatedAt: new Date() }
              : currentRow,
          )
        : rows,
    });
    setDraftOption("");
    setOpenSelect(null);
  };

  const renderSelectCell = (
    row: ProjectRow,
    field: "title" | "category",
    key: keyof DatabaseBlockProperties["options"],
  ) => {
    const cellKey = `${field}-${row.id}`;
    const selected = options[key].find((option) => option.name === row[field]);
    const placeholder = field === "title" ? text.project : text.category;

    return (
      <div className="relative min-w-44">
        <button
          type="button"
          onClick={() => {
            setOpenSelect(openSelect === cellKey ? null : cellKey);
            setDraftOption("");
          }}
          className="min-h-8 w-full rounded-md px-2 text-start transition hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {selected ? (
            <span
              className={`inline-flex rounded-md px-2 py-1 ${colorClasses[selected.color]}`}
            >
              {selected.name}
            </span>
          ) : row[field] ? (
            <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {row[field]}
            </span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </button>

        {openSelect === cellKey && (
          <div className="absolute z-50 mt-1 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <input
              autoFocus
              value={draftOption}
              onChange={(event) => setDraftOption(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleCreateOption(key, row, field);
                }
              }}
              placeholder={text.typeToCreate}
              className="mb-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950"
            />
            <div className="max-h-64 space-y-1 overflow-auto">
              {options[key].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    updateProjectRow(block.id, row.id, { [field]: option.name }, docId);
                    setOpenSelect(null);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start transition hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="text-slate-400">⋮⋮</span>
                  <span
                    className={`rounded-md px-2 py-1 ${colorClasses[option.color]}`}
                  >
                    {option.name}
                  </span>
                </button>
              ))}
            </div>
            {draftOption.trim() && (
              <button
                type="button"
                onClick={() => handleCreateOption(key, row, field)}
                className="mt-3 flex w-full items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Plus size={15} />
                {draftOption.trim()}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderDateCell = (row: ProjectRow) => (
    <div className="space-y-1">
      <input
        type="date"
        value={row.deadline}
        onChange={(event) =>
          updateProjectRow(block.id, row.id, { deadline: event.target.value }, docId)
        }
        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        title={text.gregorianDate}
      />
      <input
        value={jalaliDrafts[row.id] ?? getPersianDateInputValue(row.deadline)}
        onChange={(event) => {
          const value = event.target.value;
          setJalaliDrafts((current) => ({ ...current, [row.id]: value }));
          const gregorian = jalaliToGregorianDate(value);
          if (gregorian) {
            updateProjectRow(block.id, row.id, { deadline: gregorian }, docId);
            setJalaliDrafts((current) => {
              const next = { ...current };
              delete next[row.id];
              return next;
            });
          }
        }}
        placeholder={text.persianDate}
        className="w-36 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        dir="ltr"
      />
      <div className="text-xs text-slate-400">{getPersianDateLabel(row.deadline)}</div>
    </div>
  );

  const renderToolbar = () => (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
        <button
          type="button"
          onClick={() => updateView("table")}
          className={`inline-flex items-center gap-2 rounded-full px-3 py-2 font-medium transition ${
            (database?.view ?? "table") === "table"
              ? "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100"
              : "hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          <Table2 size={16} />
          {text.allTasks}
        </button>
        <button
          type="button"
          onClick={() => updateView("board")}
          className={`inline-flex items-center gap-2 rounded-full px-3 py-2 font-medium transition ${
            database?.view === "board"
              ? "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100"
              : "hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          <Columns3 size={16} />
          {text.board}
        </button>
        <button
          type="button"
          onClick={() => {
            updateView("table");
            setGroupByCategory((current) => !current);
          }}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-2 transition ${
            groupByCategory
              ? "bg-slate-100 font-medium text-slate-900 dark:bg-slate-900 dark:text-slate-100"
              : "hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          <Table2 size={16} />
          {text.byCategory}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {showSearch && (
          <input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={text.search}
            className="h-9 w-44 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-900"
          />
        )}
        <button
          type="button"
          onClick={() => setHideDone((current) => !current)}
          className={`rounded-md p-1.5 transition ${
            hideDone
              ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
          title={text.filter}
        >
          <Filter size={16} />
        </button>
        <button
          type="button"
          onClick={() => setSortByDeadline((current) => !current)}
          className={`rounded-md p-1.5 transition ${
            sortByDeadline
              ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
          title={text.sort}
        >
          <ArrowUpDown size={16} />
        </button>
        <button
          type="button"
          onClick={() => setShowSearch((current) => !current)}
          className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-900"
          title={text.search}
        >
          <Search size={16} />
        </button>
        <button
          type="button"
          onClick={() => setShowSettings((current) => !current)}
          className={`rounded-md p-1.5 transition ${
            showSettings
              ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
          title={text.settings}
        >
          <SlidersHorizontal size={16} />
        </button>
        <button
          type="button"
          onClick={() => addProjectRow(block.id, docId)}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {text.new}
          <Plus size={15} />
        </button>
      </div>
    </div>
  );

  const renderSettings = () => {
    if (!showSettings) {
      return null;
    }

    const renderOptionGroup = (
      key: keyof DatabaseBlockProperties["options"],
      title: string,
    ) => (
      <div>
        <div className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          {title}
        </div>
        <div className="flex flex-wrap gap-2">
          {options[key].map((option) => (
            <span
              key={option.id}
              className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm ${colorClasses[option.color]}`}
            >
              {option.name}
              <button
                type="button"
                onClick={() =>
                  updateOptions(
                    key,
                    options[key].filter((item) => item.id !== option.id),
                  )
                }
                className="text-current opacity-60 hover:opacity-100"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    );

    return (
      <div className="mb-4 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70 md:grid-cols-2">
        {renderOptionGroup("projects", text.project)}
        {renderOptionGroup("categories", text.category)}
      </div>
    );
  };

  const renderTable = () => (
    <div
      className={`hidden min-w-full overflow-x-auto text-slate-900 dark:text-slate-100 md:block ${
        isPage ? "border-t border-slate-200 dark:border-slate-800" : ""
      }`}
    >
      <table className="w-full text-sm">
        <thead
          className={
            isPage
              ? "text-sm text-slate-500 dark:text-slate-400"
              : "bg-slate-50 text-xs uppercase text-slate-400 dark:bg-slate-800/80"
          }
        >
          <tr>
            <th className="px-3 py-2 text-start">{text.project}</th>
            <th className="px-3 py-2 text-start">{text.category}</th>
            <th className="px-3 py-2 text-start">{text.status}</th>
            <th className="px-3 py-2 text-start">{text.deadline}</th>
            <th className="px-3 py-2 text-start">{text.countdown}</th>
            <th className="px-3 py-2 text-start">{text.owner}</th>
            <th className="px-3 py-2 text-start">{text.notes}</th>
            <th className="w-10 px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {displayedRows.map((row) => (
            <tr
              key={row.id}
              className="border-t border-slate-100 dark:border-slate-800"
            >
              <td className="px-3 py-2">{renderSelectCell(row, "title", "projects")}</td>
              <td className="px-3 py-2">
                {renderSelectCell(row, "category", "categories")}
              </td>
              <td className="px-3 py-2">
                <select
                  value={row.status}
                  onChange={(event) =>
                    updateProjectRow(
                      block.id,
                      row.id,
                      { status: event.target.value as ProjectStatus },
                      docId,
                    )
                  }
                  className={`rounded-full border-0 px-3 py-1 text-sm outline-none ${getStatusTone(row.status)}`}
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label[lang]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2">{renderDateCell(row)}</td>
              <td className="px-3 py-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${getCountdownTone(
                    row.deadline,
                  )}`}
                >
                  {getCountdownLabel(row.deadline)}
                </span>
              </td>
              <td className="px-3 py-2">
                <input
                  value={row.owner}
                  onChange={(event) =>
                    updateProjectRow(block.id, row.id, { owner: event.target.value }, docId)
                  }
                  className="w-28 bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                  placeholder={text.owner}
                />
              </td>
              <td className="px-3 py-2">
                <input
                  value={row.notes}
                  onChange={(event) =>
                    updateProjectRow(block.id, row.id, { notes: event.target.value }, docId)
                  }
                  className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                  placeholder={text.notes}
                />
              </td>
              <td className="px-3 py-2">
                <button
                  type="button"
                  onClick={() => deleteProjectRow(block.id, row.id, docId)}
                  className="rounded p-1 text-slate-300 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderBoard = () => (
    <div className="grid gap-4 md:grid-cols-4">
      {statusOptions.map((status) => {
        const statusRows = displayedRows.filter((row) => row.status === status.value);

        return (
          <div
            key={status.value}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              const rowId = event.dataTransfer.getData("text/project-row-id");
              if (rowId) {
                updateProjectRow(block.id, rowId, { status: status.value }, docId);
              }
            }}
            className="min-h-52 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/70"
          >
            <div className="mb-3 flex items-center justify-between">
              <span
                className={`rounded-md px-2 py-1 text-sm font-medium ${getStatusTone(
                  status.value,
                )}`}
              >
                {status.label[lang]}
              </span>
              <span className="text-sm text-slate-400">{statusRows.length}</span>
            </div>
            <div className="space-y-2">
              {statusRows.map((row) => (
                <div
                  key={row.id}
                  draggable
                  onDragStart={(event) =>
                    event.dataTransfer.setData("text/project-row-id", row.id)
                  }
                  className="cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {row.title || text.project}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {row.category && (
                      <span className="rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-100">
                        {row.category}
                      </span>
                    )}
                    {row.deadline && (
                      <span
                        className={`rounded-md px-2 py-1 text-xs ${getCountdownTone(
                          row.deadline,
                        )}`}
                      >
                        {getCountdownLabel(row.deadline)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newRowId = addProjectRow(block.id, docId);
                  if (newRowId) {
                    updateProjectRow(block.id, newRowId, { status: status.value }, docId);
                  }
                }}
                className="flex w-full items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 transition hover:bg-white dark:border-slate-700 dark:hover:bg-slate-950"
              >
                <Plus size={15} />
                {text.new}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderMobileCards = () => (
    <div className={isPage ? "space-y-3 pt-3 md:hidden" : "space-y-3 p-3 md:hidden"}>
      {displayedRows.map((row) => (
        <div
          key={row.id}
          className="rounded-lg border border-slate-200 p-3 text-slate-900 dark:border-slate-700 dark:text-slate-100"
        >
          {renderSelectCell(row, "title", "projects")}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {renderSelectCell(row, "category", "categories")}
            <select
              value={row.status}
              onChange={(event) =>
                updateProjectRow(
                  block.id,
                  row.id,
                  { status: event.target.value as ProjectStatus },
                  docId,
                )
              }
              className="rounded-md border border-slate-200 bg-white px-2 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label[lang]}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2">{renderDateCell(row)}</div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span
              className={`rounded-full px-2 py-1 text-xs ${getCountdownTone(
                row.deadline,
              )}`}
            >
              {getCountdownLabel(row.deadline)}
            </span>
            <button
              type="button"
              onClick={() => deleteProjectRow(block.id, row.id, docId)}
              className="rounded p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={
        isPage
          ? "w-full bg-transparent"
          : "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
      }
    >
      {isPage ? (
        <>
          {renderToolbar()}
          {renderSettings()}
        </>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-100">
              {block.content || text.project}
            </div>
            <div className="text-xs text-slate-400">{rows.length} projects</div>
          </div>
          <button
            type="button"
            onClick={() => addProjectRow(block.id, docId)}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
          >
            <Plus size={15} />
            {text.new}
          </button>
        </div>
      )}

      {(database?.view ?? "table") === "board" && isPage ? renderBoard() : renderTable()}
      {(database?.view ?? "table") !== "board" && renderMobileCards()}
    </div>
  );
};
