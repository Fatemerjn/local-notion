import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { useDocumentStore } from "./store/useDocumentStore";
import { Toaster, toast } from "react-hot-toast";

function App() {
  const [lang, setLang] = useState<"en" | "fa">(() => {
    return (localStorage.getItem("lang") as "en" | "fa") || "en";
  });
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );

  const { createDocument } = useDocumentStore();

  // میانبرهای صفحه کلید
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        createDocument();
        toast.success("New page created");
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setDark((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [createDocument]);

  // ذخیره خودکار با نوتیفیکیشن
  useEffect(() => {
    const interval = setInterval(() => {
      toast.success("Auto-saved", { icon: "💾", duration: 1500 });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [lang, dark]);

  return (
    <div
      className={`flex h-screen w-full ${lang === "fa" ? "font-vazir" : "font-sans"}`}
    >
      <Toaster position="bottom-right" />
      <Sidebar
        lang={lang}
        onLangToggle={() => setLang((l) => (l === "en" ? "fa" : "en"))}
      />
      <Editor lang={lang} />
      <button
        onClick={() => setDark(!dark)}
        className="fixed bottom-5 right-5 bg-slate-200 dark:bg-slate-800 p-2 rounded-full shadow-lg z-50"
      >
        {dark ? "☀️" : "🌙"}
      </button>
    </div>
  );
}

export default App;
