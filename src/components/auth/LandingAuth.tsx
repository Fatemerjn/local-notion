import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Database,
  Fingerprint,
  Globe2,
  KeyRound,
  Languages,
  LayoutDashboard,
  LockKeyhole,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface LandingAuthProps {
  lang: "fa" | "en";
  onLangToggle: () => void;
  onLogin: (user: { identifier: string; loginMethod: "password" | "otp" | "google" }) => void;
}

const copy = {
  fa: {
    brand: "Local Notion",
    eyebrow: "نوشن آفلاین، سریع و در دسترس ایران",
    title: "همه کارها، پروژه‌ها و یادداشت‌هایت را بدون فیلتر و قطعی مدیریت کن.",
    subtitle:
      "یک workspace سبک و local-first برای ساخت صفحه، دیتابیس، برد تسک، ددلاین شمسی و خروجی گرفتن از اطلاعاتت.",
    start: "شروع کن",
    watch: "دموی سریع",
    loginTitle: "ورود به workspace",
    identifier: "شماره موبایل یا نام کاربری",
    identifierPlaceholder: "مثلاً 0912... یا fateme",
    password: "رمز ثابت",
    passwordPlaceholder: "رمز عبور",
    otp: "رمز یکبار مصرف",
    otpPlaceholder: "کد ۶ رقمی",
    sendOtp: "ارسال کد",
    login: "ورود",
    google: "ورود با گوگل",
    googleSoon: "اتصال Google OAuth بعداً به همین دکمه وصل می‌شود.",
    ready: "آماده در حالت لوکال",
    passwordMode: "رمز ثابت",
    otpMode: "یکبار مصرف",
    otpSent: "کد یکبارمصرف آزمایشی",
    needIdentifier: "شماره یا نام کاربری را وارد کن",
    needPassword: "رمز ثابت حداقل ۴ کاراکتر باشد",
    needOtp: "کد یکبارمصرف معتبر نیست",
    trusted: "اطلاعات روی دستگاه خودت می‌ماند",
    cards: [
      "دیتابیس پروژه با تقویم شمسی",
      "برد شبیه Trello برای تسک‌ها",
      "خروجی JSON و کار کاملاً آفلاین",
    ],
    stats: [
      ["100%", "آفلاین"],
      ["0", "وابستگی به فیلترشکن"],
      ["2", "حالت ورود"],
    ],
  },
  en: {
    brand: "Local Notion",
    eyebrow: "Offline Notion-style workspace",
    title: "Plan notes, projects, and tasks without connection blockers.",
    subtitle:
      "A lightweight local-first workspace with pages, databases, task boards, Jalali deadlines, and JSON export.",
    start: "Get started",
    watch: "Quick demo",
    loginTitle: "Sign in to workspace",
    identifier: "Phone or username",
    identifierPlaceholder: "e.g. 0912... or fateme",
    password: "Password",
    passwordPlaceholder: "Password",
    otp: "One-time code",
    otpPlaceholder: "6-digit code",
    sendOtp: "Send code",
    login: "Sign in",
    google: "Continue with Google",
    googleSoon: "Google OAuth can be connected to this button later.",
    ready: "Ready locally",
    passwordMode: "Password",
    otpMode: "OTP",
    otpSent: "Demo OTP code",
    needIdentifier: "Enter a phone or username",
    needPassword: "Password must be at least 4 characters",
    needOtp: "OTP code is not valid",
    trusted: "Your data stays on your device",
    cards: [
      "Project database with Jalali dates",
      "Trello-style task board",
      "JSON export and fully offline work",
    ],
    stats: [
      ["100%", "Offline"],
      ["0", "VPN dependency"],
      ["2", "Login modes"],
    ],
  },
};

export const LandingAuth = ({ lang, onLangToggle, onLogin }: LandingAuthProps) => {
  const t = copy[lang];
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [issuedOtp, setIssuedOtp] = useState("");
  const [demoPulse, setDemoPulse] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);

  const heroRows = useMemo(
    () => [
      ["Research", "در حال انجام", "۱۴۰۳/۰۳/۰۵"],
      ["Launch", "شروع نشده", "۱۴۰۳/۰۳/۱۱"],
      ["Content", "انجام شده", "۱۴۰۳/۰۲/۲۸"],
    ],
    [],
  );

  const handleSendOtp = () => {
    if (!identifier.trim()) {
      toast.error(t.needIdentifier);
      return;
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    setIssuedOtp(code);
    toast.success(`${t.otpSent}: ${code}`);
  };

  const handleQuickDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setDemoPulse(true);
    window.setTimeout(() => setDemoPulse(false), 1300);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!identifier.trim()) {
      toast.error(t.needIdentifier);
      return;
    }

    if (mode === "password" && password.trim().length < 4) {
      toast.error(t.needPassword);
      return;
    }

    if (mode === "otp" && (!issuedOtp || otp.trim() !== issuedOtp)) {
      toast.error(t.needOtp);
      return;
    }

    onLogin({ identifier: identifier.trim(), loginMethod: mode });
  };

  return (
    <div className="landing-shell min-h-dvh w-full overflow-x-hidden bg-[#07130f] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="landing-orb absolute left-[-10%] top-[-20%] h-[34rem] w-[34rem] rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="landing-orb landing-orb-delay absolute bottom-[-15%] right-[-8%] h-[30rem] w-[30rem] rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <div className="relative mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4 py-5 sm:px-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-950 shadow-[0_0_50px_rgba(16,185,129,0.35)]">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight">{t.brand}</div>
              <div className="text-xs text-emerald-100/65">{t.trusted}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onLangToggle}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur transition hover:bg-white/10"
          >
            <Languages size={16} />
            {lang === "fa" ? "English" : "فارسی"}
          </button>
        </header>

        <main className="grid min-w-0 flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(500px,0.82fr)] lg:py-14 xl:grid-cols-[minmax(0,1fr)_minmax(560px,0.78fr)]">
          <section className="landing-rise min-w-0">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100">
              <Globe2 size={16} />
              {t.eyebrow}
            </div>
            <h1 className="landing-display max-w-4xl text-4xl font-black leading-[1.08] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl">
              {t.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-300 sm:text-xl">
              {t.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#login"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-slate-950 shadow-[0_20px_80px_rgba(255,255,255,0.2)] transition hover:-translate-y-0.5"
              >
                {t.start}
                <ArrowRight size={18} className="transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </a>
              <button
                type="button"
                onClick={handleQuickDemo}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-bold text-white/85 backdrop-blur transition hover:bg-white/10"
              >
                <Play size={17} />
                {t.watch}
              </button>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {t.stats.map(([value, label]) => (
                <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                  <div className="text-2xl font-black">{value}</div>
                  <div className="mt-1 text-xs text-slate-300">{label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="landing-rise landing-rise-delay min-w-0 space-y-5">
            <div className="order-2 grid gap-3 sm:grid-cols-3">
              {t.cards.map((item, index) => (
                <div
                  key={item}
                  className="landing-float rounded-3xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl backdrop-blur"
                  style={{ animationDelay: `${index * 140}ms` }}
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-300 text-slate-950">
                    {[Database, LayoutDashboard, ShieldCheck][index] &&
                      (() => {
                        const Icon = [Database, LayoutDashboard, ShieldCheck][index];
                        return <Icon size={20} />;
                      })()}
                  </div>
                  <div className="font-bold">{item}</div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-emerald-100/70">
                    <Check size={15} />
                    {t.ready}
                  </div>
                </div>
              ))}
            </div>

            <div
              id="login"
              className="order-1 w-full rounded-[2rem] border border-white/12 bg-[#f8f4e8] p-3 text-slate-950 shadow-[0_30px_120px_rgba(0,0,0,0.45)] sm:p-4"
            >
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                <div
                  ref={demoRef}
                  className={`mb-4 overflow-hidden rounded-2xl border border-slate-200 transition ${
                    demoPulse
                      ? "scale-[1.015] ring-4 ring-emerald-300/70"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between bg-slate-950 px-4 py-3 text-white">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <LockKeyhole size={16} />
                      Workspace preview
                    </div>
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>
                  </div>
                  <div className="space-y-2 p-3">
                    {heroRows.map(([project, status, date]) => (
                      <div key={project} className="grid grid-cols-[1fr_auto_auto] gap-2 rounded-xl bg-slate-50 p-3 text-sm">
                        <span className="font-semibold">{project}</span>
                        <span className="rounded-full bg-amber-100 px-2 text-center text-amber-800">{status}</span>
                        <span className="text-slate-500">{date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2 font-black">
                      <Fingerprint size={19} />
                      {t.loginTitle}
                    </div>
                    <label className="text-xs font-semibold text-slate-500">
                      {t.identifier}
                    </label>
                    <input
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      placeholder={t.identifierPlaceholder}
                      className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-emerald-400 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1 text-sm font-bold">
                    <button
                      type="button"
                      onClick={() => setMode("password")}
                      className={`rounded-xl px-3 py-2 transition ${
                        mode === "password" ? "bg-white shadow-sm" : "text-slate-500"
                      }`}
                    >
                      {t.passwordMode}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("otp")}
                      className={`rounded-xl px-3 py-2 transition ${
                        mode === "otp" ? "bg-white shadow-sm" : "text-slate-500"
                      }`}
                    >
                      {t.otpMode}
                    </button>
                  </div>

                  {mode === "password" ? (
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-500">
                        {t.password}
                      </span>
                      <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder={t.passwordPlaceholder}
                        className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-emerald-400 focus:bg-white"
                      />
                    </label>
                  ) : (
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <label className="block">
                        <span className="text-xs font-semibold text-slate-500">
                          {t.otp}
                        </span>
                        <input
                          value={otp}
                          onChange={(event) => setOtp(event.target.value)}
                          placeholder={t.otpPlaceholder}
                          inputMode="numeric"
                          className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-emerald-400 focus:bg-white"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="mt-5 h-12 rounded-2xl border border-slate-200 px-4 text-sm font-bold transition hover:bg-slate-50"
                      >
                        {t.sendOtp}
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    <KeyRound size={17} />
                    {t.login}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      toast(t.googleSoon);
                    }}
                    className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white font-bold transition hover:bg-slate-50"
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-blue-600 text-sm text-white">
                      G
                    </span>
                    {t.google}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
