const MS_PER_DAY = 86_400_000;

const toLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfLocalDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getCountdownLabel = (deadline?: string) => {
  if (!deadline) {
    return "No deadline";
  }

  const target = toLocalDate(deadline);
  const today = startOfLocalDay(new Date());

  if (!target) {
    return "Invalid date";
  }

  const days = Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);

  if (days < 0) {
    return `${Math.abs(days)}d overdue`;
  }

  if (days === 0) {
    return "Due today";
  }

  return `${days}d left`;
};

export const getPersianDateLabel = (deadline?: string) => {
  if (!deadline) {
    return "";
  }

  const date = toLocalDate(deadline);
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const getCountdownTone = (deadline?: string) => {
  if (!deadline) {
    return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300";
  }

  const target = toLocalDate(deadline);

  if (!target) {
    return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300";
  }

  const days = Math.round(
    (target.getTime() - startOfLocalDay(new Date()).getTime()) / MS_PER_DAY,
  );

  if (days < 0) {
    return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200";
  }

  if (days <= 3) {
    return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200";
  }

  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200";
};

const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

export const normalizeDateDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)));

const div = (a: number, b: number) => ~~(a / b);

const jalCal = (jy: number) => {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097,
    2192, 2262, 2324, 2394, 2456, 3178,
  ];
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jump = 0;

  for (let i = 1; i < breaks.length; i += 1) {
    const jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) {
      break;
    }
    leapJ += div(jump, 33) * 8 + div(jump % 33, 4);
    jp = jm;
  }

  let n = jy - jp;
  leapJ += div(n, 33) * 8 + div((n % 33) + 3, 4);
  if (jump % 33 === 4 && jump - n === 4) {
    leapJ += 1;
  }

  const leapG =
    div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;

  if (jump - n < 6) {
    n = n - jump + div(jump + 4, 33) * 33;
  }

  return { gy, march };
};

const g2d = (gy: number, gm: number, gd: number) =>
  div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
  div(153 * ((gm + 9) % 12) + 2, 5) +
  gd -
  34840408 -
  div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) +
  752;

const d2g = (jdn: number) => {
  let j = 4 * jdn + 139361631;
  j =
    j +
    div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 -
    3908;
  const i = div((j % 1461), 4) * 5 + 308;
  const gd = div((i % 153), 5) + 1;
  const gm = ((div(i, 153) % 12) + 1);
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
};

const j2d = (jy: number, jm: number, jd: number) => {
  const r = jalCal(jy);
  return (
    g2d(r.gy, 3, r.march) +
    (jm - 1) * 31 -
    div(jm, 7) * (jm - 7) +
    jd -
    1
  );
};

export const jalaliToGregorianDate = (value: string) => {
  const normalized = normalizeDateDigits(value).replace(/[.\s]/g, "/");
  const match = normalized.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (!match) {
    return "";
  }

  const [, jyRaw, jmRaw, jdRaw] = match;
  const jy = Number(jyRaw);
  const jm = Number(jmRaw);
  const jd = Number(jdRaw);

  if (jm < 1 || jm > 12 || jd < 1 || jd > 31 || (jm > 6 && jd > 30)) {
    return "";
  }

  const { gy, gm, gd } = d2g(j2d(jy, jm, jd));
  return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
};

export const getPersianDateInputValue = (deadline?: string) => {
  if (!deadline) {
    return "";
  }

  const date = toLocalDate(deadline);
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\u200f/g, "");
};
