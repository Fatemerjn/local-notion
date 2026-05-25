import { useState, useEffect } from "react";
import { LandingAuth } from "@/components/auth/LandingAuth";
import { Editor } from "@/components/editor";
import { Sidebar } from "@/components/layout";
import { matchesShortcut } from "@/lib/shortcuts";
import { useWorkspaceActions } from "@/store/selectors";
import { LogOut, Menu } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

function App() {
  const [session, setSession] = useState<{
    identifier: string;
    loginMethod: "password" | "otp" | "google";
  } | null>(() => {
    const raw = localStorage.getItem("local-notion-session");
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as {
        identifier: string;
        loginMethod: "password" | "otp" | "google";
      };
    } catch {
      return null;
    }
  });
  const [lang, setLang] = useState<"en" | "fa">(() => {
    return (localStorage.getItem("lang") as "en" | "fa") || "fa"; // پیش‌فرض فارسی
  });
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { createDocument } = useWorkspaceActions();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!session) {
        return;
      }

      if (
        matchesShortcut(e, "KeyN", { altKey: true }) ||
        matchesShortcut(e, "KeyN", { altKey: true, ctrlOrMeta: true })
      ) {
        e.preventDefault();
        createDocument();
        toast.success("صفحه جدید ساخته شد");
      }
      if (
        matchesShortcut(e, "KeyT", { altKey: true }) ||
        matchesShortcut(e, "KeyT", { altKey: true, ctrlOrMeta: true })
      ) {
        e.preventDefault();
        setDark((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [createDocument, session]);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [lang, dark]);

  const handleLogin = (user: {
    identifier: string;
    loginMethod: "password" | "otp" | "google";
  }) => {
    localStorage.setItem("local-notion-session", JSON.stringify(user));
    setSession(user);
    toast.success(lang === "fa" ? "وارد شدی" : "Signed in");
  };

  const handleLogout = () => {
    localStorage.removeItem("local-notion-session");
    setSession(null);
  };

  if (!session) {
    return (
      <>
        <Toaster position="bottom-right" />
        <LandingAuth
          lang={lang}
          onLangToggle={() => setLang((l) => (l === "en" ? "fa" : "en"))}
          onLogin={handleLogin}
        />
      </>
    );
  }

  return (
    <div
      className={`relative flex h-dvh w-full overflow-hidden bg-white dark:bg-slate-950 ${lang === "fa" ? "font-vazir" : "font-sans"}`}
    >
      <Toaster position="bottom-right" />
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed right-3 top-3 z-40 rounded-xl border border-slate-200 bg-white/90 p-2 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 md:hidden"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/25 md:hidden"
          aria-label="Close sidebar overlay"
        />
      )}
      <Sidebar
        lang={lang}
        onLangToggle={() => setLang((l) => (l === "en" ? "fa" : "en"))}
        onNavigate={() => setSidebarOpen(false)}
        className={`fixed inset-y-0 right-0 z-50 transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      />
      <Editor lang={lang} />
      <button
        type="button"
        onClick={handleLogout}
        className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-3 text-sm font-medium text-slate-600 shadow-lg backdrop-blur transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <LogOut size={16} />
        {session.identifier}
      </button>
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
