export type Language = "fa" | "en";

export const translations = {
  fa: {
    untitled: "بدون عنوان",
    newDocButton: "صفحه جدید",
    searchDocs: "جستجو در صفحات...",
    noDocs: "هنوز صفحه‌ای ساخته نشده",
  },
  en: {
    untitled: "Untitled",
    newDocButton: "New Page",
    searchDocs: "Search pages...",
    noDocs: "No pages yet",
  },
} as const;
