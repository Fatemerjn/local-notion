export const getCountdownLabel = (deadline?: string) => {
  if (!deadline) {
    return "No deadline";
  }

  const target = new Date(`${deadline}T23:59:59`);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  const days = Math.ceil(diff / 86_400_000);

  if (Number.isNaN(days)) {
    return "Invalid date";
  }

  if (days < 0) {
    return `${Math.abs(days)}d overdue`;
  }

  if (days === 0) {
    return "Due today";
  }

  return `${days}d left`;
};

export const getCountdownTone = (deadline?: string) => {
  if (!deadline) {
    return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300";
  }

  const target = new Date(`${deadline}T23:59:59`);
  const days = Math.ceil((target.getTime() - Date.now()) / 86_400_000);

  if (Number.isNaN(days)) {
    return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300";
  }

  if (days < 0) {
    return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200";
  }

  if (days <= 3) {
    return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200";
  }

  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200";
};
