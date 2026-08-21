import { useRef, useState } from "react";

const BLOCKS = [
  { label: "hero · LCP", height: "h-24", accent: true },
  { label: "cases · lazy", height: "h-16" },
  { label: "cta + форма", height: "h-16" },
];

export function RevealDemo() {
  const [runId, setRunId] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<number[]>([]);

  const play = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setVisible(false);
    const id = runId + 1;
    setRunId(id);
    // даём браузеру кадр на сброс классов
    timers.current.push(window.setTimeout(() => setVisible(true), 60));
  };

  return (
    <div className="border-2 border-ink bg-paper-2/70 p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="h-3 w-3 bg-accent" aria-hidden="true" />
        <h3 className="font-mono text-[12px] font-bold uppercase tracking-widest text-ink">
          Живое демо · reveal на Intersection Observer
        </h3>
        <button
          type="button"
          onClick={play}
          className="ml-auto cursor-pointer border-2 border-ink bg-ink px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-paper transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent hover:shadow-[3px_3px_0_0_rgba(18,22,28,0.9)] active:translate-y-0"
        >
          ▶ Проиграть
        </button>
      </div>

      <div className="border border-dashed border-ink-2/50 bg-panel p-4">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted">
          viewport · пользователь скроллит ↓
        </p>
        <div className="space-y-3">
          {BLOCKS.map((b, i) => (
            <div
              key={`${b.label}-${runId}`}
              className={`reveal ${b.height} flex items-center justify-between border-2 px-4 ${
                b.accent ? "border-accent bg-accent/10" : "border-ink-2/40 bg-paper"
              } ${visible ? "is-in" : ""}`}
              style={{ transitionDelay: visible ? `${i * 120}ms` : "0ms" }}
            >
              <span className={`font-mono text-[11px] font-semibold ${b.accent ? "text-accent-deep" : "text-ink-2"}`}>
                .reveal — {b.label}
              </span>
              <span className="font-mono text-[10px] text-muted">transform + opacity</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 font-mono text-[11px] leading-relaxed text-muted">
        Стаггер — через transition-delay (0 / 120 / 240 мс), класс .is-in вешает Intersection Observer.
        Ровно этот код — в assets/js/app.js и _reveal.scss на вкладках выше.
      </p>
    </div>
  );
}
