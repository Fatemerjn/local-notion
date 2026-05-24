export type Language = "fa" | "en";

export const translations = {
  fa: {
    untitled: "بدون عنوان",
    newDocButton: "صفحه جدید",
    searchDocs: "جستجو در صفحات...",
    noDocs: "هنوز صفحه‌ای ساخته نشده",
    shortcutsTitle: "میانبرها",
    shortcutNewPage: "Alt + N: صفحه جدید",
    shortcutTheme: "Alt + T: تغییر تم",
  },
  en: {
    untitled: "Untitled",
    newDocButton: "New Page",
    searchDocs: "Search pages...",
    noDocs: "No pages yet",
    shortcutsTitle: "Shortcuts",
    shortcutNewPage: "Alt + N: New page",
    shortcutTheme: "Alt + T: Toggle theme",
  },
} as const;
