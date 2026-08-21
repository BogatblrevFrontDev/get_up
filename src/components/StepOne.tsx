import { useEffect, useState } from "react";
import { DECISIONS, FILE_TREE, STATS, findNode } from "../data/files";
import { FileTree } from "./FileTree";
import { Reveal } from "./Reveal";
import { StepHeader } from "./StepCode";

const STORAGE_KEY = "karkas-selected-file";

export function StepOne({ onNext }: { onNext: () => void }) {
  const [selectedPath, setSelectedPath] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && findNode(FILE_TREE, saved)) return saved;
    } catch {
      /* noop */
    }
    return "karkas/functions.php";
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, selectedPath);
    } catch {
      /* noop */
    }
  }, [selectedPath]);

  const node = findNode(FILE_TREE, selectedPath) ?? FILE_TREE;

  return (
    <section>
      <StepHeader
        num="01"
        title="Структура папок и файлов темы"
        lead="Минимальный DOM, модульный PHP, статика в два слоя и ноль сторонних зависимостей. Ниже — каждый файл темы и его роль в бюджете производительности: раскройте папки и кликните по файлу."
      />

      {/* сводка */}
      <Reveal>
        <dl className="grid grid-cols-2 border-2 border-ink bg-panel lg:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`px-4 py-4 sm:px-5 ${i > 0 ? "border-l border-line" : ""} ${i >= 2 ? "border-t border-line lg:border-t-0" : ""} ${i === 2 ? "border-l-0 lg:border-l" : ""}`}
            >
              <dd className="font-display text-[clamp(1.4rem,3vw,2rem)] font-bold leading-none text-ink">
                {s.value}
              </dd>
              <dt className="mt-1.5 font-mono text-[10.5px] uppercase tracking-widest text-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
      </Reveal>

      {/* проводник + карточка файла */}
      <Reveal delay={80}>
        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(280px,400px)_minmax(0,1fr)]">
          <FileTree root={FILE_TREE} selectedPath={selectedPath} onSelect={setSelectedPath} />

          <div
            key={node.path}
            className="flex min-h-[300px] flex-col border-2 border-ink bg-panel shadow-[6px_6px_0_0_rgba(11,80,208,0.15)]"
            aria-live="polite"
          >
            <div className="flex flex-wrap items-center gap-2 border-b-2 border-ink bg-paper-2/80 px-4 py-2.5">
              <span className="font-mono text-[11px] text-muted">wp-content/themes/</span>
              <span className="thin-scroll overflow-x-auto whitespace-nowrap font-mono text-[11px] font-bold text-accent-deep">
                {node.path}
              </span>
              <span
                className={`ml-auto shrink-0 border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-widest ${
                  node.type === "dir" ? "border-accent text-accent" : "border-ink-2 text-ink-2"
                }`}
              >
                {node.type === "dir" ? "каталог" : "файл"}
              </span>
            </div>

            <div className="flex-1 p-4 sm:p-5">
              <h2 className="font-display text-[clamp(1.05rem,2.4vw,1.4rem)] font-bold break-all leading-snug text-ink">
                {node.name}
              </h2>
              {node.chips && node.chips.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {node.chips.map((c) => (
                    <span key={c} className="border border-signal bg-signal/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-signal">
                      {c}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-3.5 text-[14px] leading-relaxed text-ink-2">{node.desc}</p>

              {node.points && (
                <ul className="mt-4 space-y-2 border-t border-line pt-4">
                  {node.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ink-2">
                      <svg width="12" height="12" viewBox="0 0 12 12" className="mt-1 shrink-0 text-accent" aria-hidden="true">
                        <path d="M2 1l8 5-8 5z" fill="currentColor" />
                      </svg>
                      <span className="font-mono">{p}</span>
                    </li>
                  ))}
                </ul>
              )}

              {node.type === "dir" && node.children && (
                <p className="mt-4 border-t border-line pt-3.5 font-mono text-[11.5px] uppercase tracking-widest text-muted">
                  Внутри: {node.children.length} {node.children.length === 1 ? "элемент" : node.children.length < 5 ? "элемента" : "элементов"} — раскройте в дереве
                </p>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {/* ключевые решения */}
      <div className="mt-12">
        <Reveal>
          <h2 className="mb-1 flex items-center gap-3 font-display text-[clamp(1.1rem,3vw,1.6rem)] font-bold text-ink">
            <span className="h-3.5 w-3.5 bg-accent" aria-hidden="true" />
            Почему структура именно такая
          </h2>
          <p className="mb-5 text-[13.5px] text-muted">
            Пять решений, которые делают тему поддерживаемой и быстрой ещё до первой строки CSS.
          </p>
        </Reveal>
        <ol className="border-t-2 border-ink">
          {DECISIONS.map((d, i) => (
            <Reveal key={d.title} delay={i * 60}>
              <li className="group grid gap-2 border-b border-line px-1 py-4 transition-colors duration-200 hover:bg-panel sm:grid-cols-[72px_260px_1fr] sm:gap-5 sm:px-2">
                <span className="font-display text-[1.5rem] font-bold leading-none text-accent transition-transform duration-200 group-hover:-translate-y-0.5 sm:text-[1.9rem]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-[15px] font-bold leading-snug text-ink">{d.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-muted">{d.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>

      <nav className="mt-12 flex items-center justify-between gap-3 border-t-2 border-ink pt-5" aria-label="Навигация по шагам">
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted">Начало чертежа</span>
        <button
          type="button"
          onClick={onNext}
          className="cursor-pointer border-2 border-ink bg-ink px-4 py-2.5 font-mono text-[12px] font-bold uppercase tracking-widest text-paper transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent hover:shadow-[4px_4px_0_0_rgba(18,22,28,0.9)] active:translate-y-0"
        >
          Далее: стиль и функции →
        </button>
      </nav>
    </section>
  );
}
