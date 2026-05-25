import { Plus, Trash2 } from "lucide-react";
import type { Block, ProjectStatus } from "@/types";
import { getCountdownLabel, getCountdownTone } from "@/lib/deadlines";
import { useWorkspaceActions } from "@/store/selectors";

interface ProjectDatabaseProps {
  block: Block;
  docId: string;
}

const statuses: Array<{ value: ProjectStatus; label: string }> = [
  { value: "not-started", label: "Not started" },
  { value: "in-progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
];

export const ProjectDatabase = ({ block, docId }: ProjectDatabaseProps) => {
  const { addProjectRow, deleteProjectRow, updateProjectRow } =
    useWorkspaceActions();
  const rows = block.properties?.database?.projects ?? [];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-100">
            {block.content || "Projects"}
          </div>
          <div className="text-xs text-slate-400">{rows.length} projects</div>
        </div>
        <button
          type="button"
          onClick={() => addProjectRow(block.id, docId)}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
        >
          <Plus size={15} />
          New
        </button>
      </div>

      <div className="hidden min-w-full overflow-x-auto text-slate-900 dark:text-slate-100 md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-400 dark:bg-slate-800/80">
            <tr>
              <th className="px-3 py-2 text-start">Project</th>
              <th className="px-3 py-2 text-start">Status</th>
              <th className="px-3 py-2 text-start">Deadline</th>
              <th className="px-3 py-2 text-start">Countdown</th>
              <th className="px-3 py-2 text-start">Owner</th>
              <th className="px-3 py-2 text-start">Notes</th>
              <th className="w-10 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-slate-100 dark:border-slate-800"
              >
                <td className="px-3 py-2">
                  <input
                    value={row.title}
                    onChange={(event) =>
                      updateProjectRow(
                        block.id,
                        row.id,
                        { title: event.target.value },
                        docId,
                      )
                    }
                    className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder="Project name"
                  />
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
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="date"
                    value={row.deadline}
                    onChange={(event) =>
                      updateProjectRow(
                        block.id,
                        row.id,
                        { deadline: event.target.value },
                        docId,
                      )
                    }
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </td>
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
                      updateProjectRow(
                        block.id,
                        row.id,
                        { owner: event.target.value },
                        docId,
                      )
                    }
                    className="w-28 bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder="Owner"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={row.notes}
                    onChange={(event) =>
                      updateProjectRow(
                        block.id,
                        row.id,
                        { notes: event.target.value },
                        docId,
                      )
                    }
                    className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder="Notes"
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

      <div className="space-y-3 p-3 md:hidden">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-lg border border-slate-200 p-3 text-slate-900 dark:border-slate-700 dark:text-slate-100"
          >
            <input
              value={row.title}
              onChange={(event) =>
                updateProjectRow(
                  block.id,
                  row.id,
                  { title: event.target.value },
                  docId,
                )
              }
              className="w-full bg-transparent font-medium outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Project name"
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
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
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={row.deadline}
                onChange={(event) =>
                  updateProjectRow(
                    block.id,
                    row.id,
                    { deadline: event.target.value },
                    docId,
                  )
                }
                className="rounded-md border border-slate-200 bg-white px-2 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
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
    </div>
  );
};
