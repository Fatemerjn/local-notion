import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { useDocumentStore } from "./store/useDocumentStore";
import { Toaster, toast } from "react-hot-toast";

function App() {
  const [lang, setLang] = useState<"en" | "fa">(() => {
    return (localStorage.getItem("lang") as "en" | "fa") || "fa"; // پیش‌فرض فارسی
  });
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );

  const { createDocument } = useDocumentStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        createDocument();
        toast.success("صفحه جدید ساخته شد");
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "d"
      ) {
        e.preventDefault();
        setDark((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [createDocument]);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [lang, dark]);

  return (
    <div
      className={`flex h-screen w-full overflow-hidden ${lang === "fa" ? "font-vazir" : "font-sans"}`}
    >
      <Toaster position="bottom-right" />
      <Sidebar
        lang={lang}
        onLangToggle={() => setLang((l) => (l === "en" ? "fa" : "en"))}
      />
      <Editor lang={lang} />
      <button
        onClick={() => setDark(!dark)}
        className="fixed bottom-5 right-5 bg-slate-200 dark:bg-slate-800 p-3 rounded-full shadow-lg z-50 text-xl"
      >
        {dark ? "☀️" : "🌙"}
      </button>
    </div>
  );
}

export default App;
