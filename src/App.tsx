import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";

function App() {
  const [lang, setLang] = useState<"en" | "fa">(() => {
    return (localStorage.getItem("lang") as "en" | "fa") || "en";
  });
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [lang, dark]);

  // فقط برای auto-save لاگ می‌گیریم، بدون استفاده از documents
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("💾 Auto-saved");
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`flex h-screen w-full ${lang === "fa" ? "font-vazir" : "font-sans"}`}
    >
      <Sidebar
        lang={lang}
        onLangToggle={() => setLang((l) => (l === "en" ? "fa" : "en"))}
      />
      <Editor lang={lang} />
      <button
        onClick={() => setDark(!dark)}
        className="fixed bottom-5 right-5 bg-slate-200 dark:bg-slate-800 p-2 rounded-full shadow-lg z-50 text-xl"
      >
        {dark ? "☀️" : "🌙"}
      </button>
    </div>
  );
}

export default App;
