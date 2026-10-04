import { useEffect, useRef, useState } from "react";

type JunkItem = { name: string; kind: "JS" | "CSS" | "HTML"; size: number; note: string };

const JUNK: JunkItem[] = [
  { name: "jquery.js + jquery-migrate.js", kind: "JS", size: 101, note: "тема работает на fetch и IO — jQuery не нужен" },
  { name: "wp-block-library.css", kind: "CSS", size: 64, note: "стили Gutenberg на фронте без единого блока" },
  { name: "dashicons.css", kind: "CSS", size: 50, note: "админ-иконки, которые видят гости" },
  { name: "emoji-detection.js", kind: "JS", size: 11, note: "скрипт-детект «а вдруг в тексте эмодзи»" },
  { name: "emoji-styles.css", kind: "CSS", size: 10, note: "стили для тех же эмодзи" },
  { name: "global-styles (theme.json)", kind: "CSS", size: 8, note: "тема сверстана руками, theme.json не используется" },
  { name: "oEmbed discovery + host.js", kind: "JS", size: 3, note: "дискавери-ссылки для встраивания" },
  { name: "wlwmanifest · rsd · generator", kind: "HTML", size: 1, note: "мёртвые мета-ссылки из 2009 года" },
];

const TOTAL_SIZE = JUNK.reduce((s, j) => s + j.size, 0); // 248 КБ

const CLEAN = [
  { name: "critical.css", how: "инлайн в <head>", size: 3, primary: true },
  { name: "main.css", how: "preload → onload", size: 28, primary: false },
  { name: "app.js", how: "defer", size: 4, primary: false },
  { name: "lead-form.js", how: "defer", size: 3, primary: false },
];

const KIND_COLOR: Record<JunkItem["kind"], string> = {
  JS: "text-signal border-signal",
  CSS: "text-accent border-accent",
  HTML: "text-muted border-muted",
};

export function HeadCleanup() {
  const [cleaned, setCleaned] = useState(false);
  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);

  useEffect(() => {
    shownRef.current = shown;
  }, [shown]);

  useEffect(() => {
    const target = cleaned ? TOTAL_SIZE : 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(target);
      return;
    }
    let raf = 0;
    const from = shownRef.current;
    const t0 = performance.now();
    const dur = 750;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cleaned]);

  return (
    <div className="border-2 border-ink bg-panel shadow-[6px_6px_0_0_rgba(18,22,28,0.15)]">
      <div className="flex flex-wrap items-center gap-3 border-b-2 border-ink px-4 py-3 sm:px-5">
        <span className="h-3 w-3 bg-accent" aria-hidden="true" />
        <h3 className="font-mono text-[12px] font-bold uppercase tracking-widest text-ink">
          Разбор <code className="text-accent-deep">&lt;head&gt;</code> · до и после cleanup.php
        </h3>
        <span
          className={`ml-auto border-2 px-2.5 py-1 font-mono text-[12px] font-bold tracking-wide transition-colors duration-300 ${
            cleaned ? "border-signal bg-signal text-paper" : "border-line bg-paper text-muted"
          }`}
          role="status"
          aria-live="polite"
        >
          выгода: −{shown} КБ
        </span>
      </div>

      <div className="grid md:grid-cols-2">
        {/* слева: мусор по умолчанию */}
        <div className={`border-b-2 border-ink p-4 transition-colors duration-300 sm:p-5 md:border-b-0 md:border-r-2 ${cleaned ? "bg-paper-2/50" : "bg-paper"}`}>
          <p className="mb-3 font-mono text-[10.5px] uppercase tracking-widest text-muted">
            Свежий WP 6.x · {JUNK.length + 1} лишних запросов
          </p>
          <ul className="space-y-1.5">
            {JUNK.map((j, i) => (
              <li
                key={j.name}
                className="group flex items-center gap-2.5 px-2 py-1.5 transition-all duration-300"
                style={{ transitionDelay: cleaned ? `${i * 55}ms` : "0ms", opacity: cleaned ? 0.32 : 1 }}
              >
                <span className={`w-10 shrink-0 border px-1 py-px text-center font-mono text-[9px] font-bold ${KIND_COLOR[j.kind]}`}>
                  {j.kind}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate font-mono text-[12px] text-ink-2 ${cleaned ? "line-through" : ""}`}>
                    {j.name}
                  </span>
                  <span className="block truncate text-[10.5px] text-muted">{j.note}</span>
                </span>
                <span className="shrink-0 font-mono text-[11px] font-bold text-ink">{j.size} КБ</span>
                <span
                  className={`shrink-0 font-mono text-[13px] font-bold text-signal transition-all duration-300 ${cleaned ? "opacity-100" : "opacity-0"}`}
                  style={{ transitionDelay: cleaned ? `${i * 55 + 120}ms` : "0ms" }}
                  aria-hidden="true"
                >
                  ×
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-dashed border-line pt-2.5 font-mono text-[11px] text-muted">
            Σ без сжатия · типичная установка без чистки
          </p>
        </div>

        {/* справа: после чистки */}
        <div className={`p-4 transition-colors duration-300 sm:p-5 ${cleaned ? "bg-accent/[0.06]" : "bg-paper-2/40"}`}>
          <p className="mb-3 font-mono text-[10.5px] uppercase tracking-widest text-muted">
            После inc/cleanup.php · только ассеты темы
          </p>
          <ul className="space-y-2">
            {CLEAN.map((c) => (
              <li
                key={c.name}
                className={`flex items-center gap-2.5 border px-3 py-2 transition-all duration-300 ${
                  c.primary ? "border-accent bg-panel" : "border-line bg-panel/70"
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0 text-accent" aria-hidden="true">
                  <path d="M1.5 6.5l3 3L10.5 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                </svg>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[12px] font-semibold text-ink">{c.name}</span>
                  <span className="block text-[10.5px] text-muted">{c.how}</span>
                </span>
                <span className="font-mono text-[11px] font-bold text-accent-deep">{c.size} КБ</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-dashed border-line pt-2.5 font-mono text-[11px] leading-relaxed text-muted">
            Σ ≈ 38 КБ · <span className="font-bold text-accent-deep">0 render-blocking</span> · шрифты самозагружаемые
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t-2 border-ink px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={() => setCleaned((v) => !v)}
          className={`cursor-pointer border-2 px-4 py-2 font-mono text-[11.5px] font-bold uppercase tracking-widest transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 ${
            cleaned
              ? "border-ink bg-panel text-ink hover:shadow-[4px_4px_0_0_rgba(18,22,28,0.25)]"
              : "border-ink bg-ink text-paper hover:bg-accent hover:shadow-[4px_4px_0_0_rgba(18,22,28,0.9)]"
          }`}
        >
          {cleaned ? "↺ Вернуть дефолтный <head>" : "▶ Применить cleanup.php"}
        </button>
        <p className="font-mono text-[11px] text-muted">
          {cleaned
            ? "осталось 4 файла, каждый — под контролем enqueue.php"
            : "нажмите, чтобы увидеть, что убирает inc/cleanup.php"}
        </p>
      </div>
    </div>
  );
}
