import { useEffect, useState } from "react";

const FONT_FILES = [
  { file: "karkas-display-bold.woff2", face: "Unbounded 700", subset: "cyr + lat", size: "22 КБ", role: "заголовки, цифры УТП" },
  { file: "karkas-body-regular.woff2", face: "Golos Text 400", subset: "cyr + lat", size: "18 КБ", role: "основной текст" },
  { file: "karkas-body-semibold.woff2", face: "Golos Text 600", subset: "cyr + lat", size: "18 КБ", role: "акценты интерфейса" },
  { file: "karkas-mono-regular.woff2", face: "JetBrains Mono 400", subset: "cyr + lat", size: "16 КБ", role: "код, метки, штампы" },
];

const MODES = [
  {
    id: "swap",
    title: "swap — наш выбор",
    badge: "FOUT: текст виден сразу",
    desc: "Браузер мгновенно рисует фолбэк-шрифтом и подменяет его, когда woff2 доехал. Текст доступен всегда — LCP не ждёт сеть.",
  },
  {
    id: "block",
    title: "block — антипаттерн",
    badge: "FOIT: текст невидим до ~1 с",
    desc: "Браузер до 3 секунд прячет текст в ожидании шрифта. На мобильной сети это провал LCP и пустой экран для пользователя.",
  },
  {
    id: "optional",
    title: "optional",
    badge: "фолбэк навсегда",
    desc: "100 мс на попытку, иначе фолбэк без подмены. Приемлемо, но жертвует фирменным начертанием — swap честнее.",
  },
] as const;

type ModeId = (typeof MODES)[number]["id"];

export function FontSpec() {
  const [mode, setMode] = useState<ModeId>("swap");
  const [runId, setRunId] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const t = window.setTimeout(() => setLoaded(true), mode === "block" ? 1200 : 700);
    return () => window.clearTimeout(t);
  }, [mode, runId]);

  const meta = MODES.find((m) => m.id === mode)!;

  const previewFamily =
    mode === "swap"
      ? loaded
        ? '"Unbounded", "Golos Text", sans-serif'
        : '"Segoe UI", Tahoma, sans-serif'
      : mode === "block"
        ? loaded
          ? '"Unbounded", "Golos Text", sans-serif'
          : '"Unbounded", "Golos Text", sans-serif'
        : '"Segoe UI", Tahoma, sans-serif';

  return (
    <div className="border-2 border-ink bg-panel shadow-[6px_6px_0_0_rgba(18,22,28,0.15)]">
      <div className="flex flex-wrap items-center gap-3 border-b-2 border-ink px-4 py-3">
        <span className="h-3 w-3 bg-signal" aria-hidden="true" />
        <h3 className="font-mono text-[12px] font-bold uppercase tracking-widest text-ink">
          Шрифты · самозагрузка, 0 CDN
        </h3>
        <span className="ml-auto font-mono text-[11px] text-muted">итого ≈ 74 КБ · кэш надолго</span>
      </div>

      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* спецификация */}
        <div className="min-w-0">
          <ul className="divide-y divide-line border border-ink">
            {FONT_FILES.map((f) => (
              <li key={f.file} className="group px-3.5 py-2.5 transition-colors duration-150 hover:bg-paper-2">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <span className="font-mono text-[12px] font-bold text-accent-deep group-hover:text-accent">{f.file}</span>
                  <span className="ml-auto font-mono text-[10.5px] text-muted">{f.subset}</span>
                  <span className="font-mono text-[10.5px] font-bold text-signal">{f.size}</span>
                </div>
                <p className="mt-0.5 font-mono text-[11px] text-muted">
                  {f.face} — {f.role}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-l-[3px] border-accent bg-paper-2/70 px-3 py-2 font-mono text-[11px] leading-relaxed text-ink-2">
            @font-face объявлен в critical.css → шрифт грузится вместе с первым экраном, без цепочки CSS→CSS.
            Никаких fonts.googleapis.com: минус сторонний домен, минус preconnect, минус чужой куки-трекинг.
          </p>
        </div>

        {/* демо font-display */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex border border-ink" role="tablist" aria-label="Режим font-display">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={mode === m.id}
                  onClick={() => {
                    setMode(m.id);
                    setRunId((r) => r + 1);
                  }}
                  className={`cursor-pointer px-2.5 py-1 font-mono text-[11px] font-bold transition-colors duration-150 ${
                    mode === m.id ? "bg-ink text-paper" : "bg-panel text-ink-2 hover:bg-paper-2"
                  }`}
                >
                  {m.id}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setRunId((r) => r + 1)}
              className="cursor-pointer border border-ink px-2.5 py-1 font-mono text-[11px] font-bold text-ink transition-all duration-150 hover:-translate-y-0.5 hover:bg-ink hover:text-paper active:translate-y-0"
            >
              ⟳ Заново
            </button>
          </div>

          <div key={`${mode}-${runId}`} className="mt-3 border-2 border-ink bg-paper p-4">
            <p
              className={`text-[clamp(1.05rem,2.6vw,1.45rem)] font-bold leading-tight text-ink ${
                mode === "swap" && loaded ? "font-flash" : ""
              } ${mode === "block" && !loaded ? "opacity-0" : ""}`}
              style={{ fontFamily: previewFamily, transition: "opacity 0.2s linear" }}
            >
              Сайт окупается за 6 недель
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted" style={{ fontFamily: '"Golos Text", sans-serif' }}>
              Корпоративный сайт на чистом WordPress: быстрый на мобильных, честный в цифрах, управляемый без разработчика.
            </p>
          </div>

          <div className="mt-3 flex items-start gap-2.5">
            <span
              className={`mt-0.5 shrink-0 border px-1.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-widest ${
                mode === "swap" ? "border-accent bg-accent/10 text-accent" : mode === "block" ? "border-signal bg-signal/10 text-signal" : "border-ink-2 text-ink-2"
              }`}
            >
              {meta.badge}
            </span>
            <p className="font-mono text-[11px] leading-relaxed text-muted">{meta.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
