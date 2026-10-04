import { useState, type ReactNode } from "react";
import type { CodeFile } from "../data/step2";
import { CodeBlock } from "./CodeBlock";
import { Reveal } from "./Reveal";

export function StepHeader({
  num,
  title,
  lead,
}: {
  num: string;
  title: string;
  lead: string;
}) {
  return (
    <header className="mb-8">
      <p className="mb-3 flex items-center gap-3 font-mono text-[12px] font-bold uppercase tracking-[0.25em] text-accent">
        <span className="inline-block h-[2px] w-8 bg-accent" aria-hidden="true" />
        Шаг {num}
      </p>
      <h1 className="font-display text-[clamp(1.35rem,4.2vw,2.3rem)] font-bold leading-[1.12] tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-2">{lead}</p>
    </header>
  );
}

type Props = {
  num: string;
  title: string;
  lead: string;
  files: CodeFile[];
  notes: { title: string; text: string }[];
  children?: ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  nextLabel?: string;
};

export function StepCode({ num, title, lead, files, notes, children, onPrev, onNext, nextLabel }: Props) {
  const [active, setActive] = useState(0);
  const file = files[Math.min(active, files.length - 1)];

  return (
    <section>
      <StepHeader num={num} title={title} lead={lead} />

      <Reveal>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0">
            {/* табы файлов */}
            <div className="thin-scroll -mb-[2px] flex gap-1.5 overflow-x-auto pb-2" role="tablist">
              {files.map((f, i) => (
                <button
                  key={f.name}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  onClick={() => setActive(i)}
                  className={`shrink-0 cursor-pointer border-2 px-3 py-1.5 font-mono text-[11.5px] font-semibold tracking-wide transition-all duration-150 ${
                    i === active
                      ? "border-ink bg-ink text-paper shadow-[3px_3px_0_0_rgba(11,80,208,0.85)]"
                      : "border-line bg-panel text-ink-2 hover:-translate-y-0.5 hover:border-ink hover:text-ink"
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>

            <CodeBlock file={file} />

            {file.note && (
              <p className="mt-3 flex items-start gap-2.5 border-l-[3px] border-signal bg-panel px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-2">
                <svg width="14" height="14" viewBox="0 0 14 14" className="mt-0.5 shrink-0 text-signal" aria-hidden="true">
                  <path d="M7 1v8M7 11.5v1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
                </svg>
                {file.note}
              </p>
            )}
          </div>

          {/* заметки к шагу */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="mb-3 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-muted">
              <span className="h-2.5 w-2.5 bg-signal" aria-hidden="true" />
              Заметки к шагу
            </h2>
            <ol className="space-y-3">
              {notes.map((n, i) => (
                <Reveal key={n.title} delay={i * 70}>
                  <li className="group border border-line bg-panel p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-[4px_4px_0_0_rgba(18,22,28,0.12)]">
                    <p className="mb-1 flex items-baseline gap-2">
                      <span className="font-mono text-[11px] font-bold text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[13.5px] font-bold leading-snug text-ink">{n.title}</span>
                    </p>
                    <p className="pl-[26px] text-[12.5px] leading-relaxed text-muted">{n.text}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </aside>
        </div>
      </Reveal>

      {children && <div className="mt-10 space-y-8">{children}</div>}

      <nav className="mt-12 flex items-center justify-between gap-3 border-t-2 border-ink pt-5" aria-label="Навигация по шагам">
        {onPrev ? (
          <button
            type="button"
            onClick={onPrev}
            className="cursor-pointer border-2 border-ink bg-panel px-4 py-2.5 font-mono text-[12px] font-bold uppercase tracking-widest text-ink transition-all duration-150 hover:-translate-y-0.5 hover:bg-paper-2 hover:shadow-[4px_4px_0_0_rgba(18,22,28,0.25)] active:translate-y-0"
          >
            ← Назад
          </button>
        ) : (
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">Начало чертежа</span>
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="cursor-pointer border-2 border-ink bg-ink px-4 py-2.5 font-mono text-[12px] font-bold uppercase tracking-widest text-paper transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent hover:shadow-[4px_4px_0_0_rgba(18,22,28,0.9)] active:translate-y-0"
          >
            {nextLabel ?? "Далее →"}
          </button>
        )}
      </nav>
    </section>
  );
}
