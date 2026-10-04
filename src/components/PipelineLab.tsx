import { useState } from "react";

type Prop = {
  id: "layout" | "paint" | "composite";
  label: string;
  stages: [boolean, boolean, boolean]; // Layout, Paint, Composite
  animClass: string;
  verdict: string;
  tag: string;
  tone: "signal" | "mid" | "accent";
  example: string;
};

const PROPS: Prop[] = [
  {
    id: "layout",
    label: "width / height",
    stages: [true, true, true],
    animClass: "lab-anim-layout",
    verdict:
      "Каждый кадр пересчитывает геометрию всей страницы (reflow) и перерисовывает пиксели. На мобильном — рваные 20–30 fps и просадки INP. В теме не используем никогда.",
    tag: "дорого",
    tone: "signal",
    example: "анимация аккордеона через height",
  },
  {
    id: "paint",
    label: "box-shadow",
    stages: [false, true, true],
    animClass: "lab-anim-paint",
    verdict:
      "Геометрия не меняется, но главный поток перерисовывает область на каждом кадре. Допустимо дозированно — тени, подсветки при hover; не для длинных скролл-сцен.",
    tag: "средне",
    tone: "mid",
    example: "подсветка карточки при наведении",
  },
  {
    id: "composite",
    label: "transform + opacity",
    stages: [false, false, true],
    animClass: "lab-anim-composite",
    verdict:
      "Работу делает композитор на GPU, главный поток свободен: плавные 60 fps даже на слабом телефоне. Именно поэтому _reveal.scss анимирует только translateY и opacity.",
    tag: "наш выбор",
    tone: "accent",
    example: "reveal-анимации темы",
  },
];

const STAGES = [
  { name: "Layout", hint: "геометрия страницы" },
  { name: "Paint", hint: "пиксели слоёв" },
  { name: "Composite", hint: "сборка на GPU" },
];

export function PipelineLab() {
  const [propId, setPropId] = useState<Prop["id"]>("composite");
  const prop = PROPS.find((p) => p.id === propId) ?? PROPS[2];

  return (
    <div className="border-2 border-ink bg-panel shadow-[6px_6px_0_0_rgba(18,22,28,0.15)]">
      <div className="flex flex-wrap items-center gap-3 border-b-2 border-ink px-4 py-3">
        <span className="h-3 w-3 bg-signal" aria-hidden="true" />
        <h3 className="font-mono text-[12px] font-bold uppercase tracking-widest text-ink">
          Лаборатория рендера · чем анимировать
        </h3>
        <span className="ml-auto hidden font-mono text-[11px] text-muted sm:block">цель: 60 fps на мобильном</span>
      </div>

      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          {/* переключатель свойств */}
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Анимируемое свойство">
            {PROPS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={p.id === propId}
                onClick={() => setPropId(p.id)}
                className={`cursor-pointer border-2 px-3 py-1.5 font-mono text-[12px] font-bold transition-all duration-150 ${
                  p.id === propId
                    ? "border-ink bg-ink text-paper shadow-[3px_3px_0_0_rgba(11,80,208,0.85)]"
                    : "border-line bg-paper text-ink-2 hover:-translate-y-0.5 hover:border-ink"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* полигон анимации */}
          <div className="mt-4">
            <div className="lab-track relative flex h-20 items-center overflow-hidden border-2 border-ink bg-paper px-3">
              <span className="pointer-events-none absolute left-3 top-1.5 font-mono text-[9.5px] uppercase tracking-widest text-muted">
                {prop.example}
              </span>
              <span
                className={`lab-square block h-12 w-14 shrink-0 bg-accent ${prop.animClass}`}
                aria-hidden="true"
              />
              <span className="pointer-events-none absolute right-3 bottom-1.5 font-mono text-[9.5px] uppercase tracking-widest text-muted">
                60 кадров/с ?
              </span>
            </div>
          </div>

          {/* конвейер */}
          <div className="mt-4 flex items-stretch gap-2">
            {STAGES.map((s, i) => {
              const lit = prop.stages[i];
              return (
                <div key={s.name} className="flex min-w-0 flex-1 items-center gap-2">
                  <div
                    className={`min-w-0 flex-1 border-2 px-2.5 py-2.5 transition-all duration-300 ${
                      lit
                        ? i === 2
                          ? "border-accent bg-accent text-paper shadow-[3px_3px_0_0_rgba(11,80,208,0.4)]"
                          : "border-signal bg-signal text-paper shadow-[3px_3px_0_0_rgba(255,77,0,0.4)]"
                        : "border-line bg-paper text-muted opacity-60"
                    }`}
                  >
                    <p className="truncate font-mono text-[11.5px] font-bold uppercase tracking-wider">{s.name}</p>
                    <p className={`truncate font-mono text-[9.5px] ${lit ? "text-paper/70" : "text-muted"}`}>{s.hint}</p>
                  </div>
                  {i < STAGES.length - 1 && (
                    <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0 text-ink/50" aria-hidden="true">
                      <path d="M2 3l8 4-8 4z" fill="currentColor" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-2 font-mono text-[10.5px] text-muted">
            {prop.stages.filter(Boolean).length === 3
              ? "загружены все три стадии"
              : prop.stages.filter(Boolean).length === 2
                ? "Layout пропущен — уже лучше"
                : "работает только композитор — главный поток свободен"}
          </p>
        </div>

        {/* вердикт */}
        <aside
          className={`flex min-w-0 flex-col border-2 p-4 transition-colors duration-300 ${
            prop.tone === "accent" ? "border-accent bg-accent/10" : prop.tone === "signal" ? "border-signal bg-signal/10" : "border-ink bg-paper-2/60"
          }`}
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Вердикт</span>
            <span
              className={`border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${
                prop.tone === "accent"
                  ? "border-accent bg-accent text-paper"
                  : prop.tone === "signal"
                    ? "border-signal bg-signal text-paper"
                    : "border-ink bg-ink text-paper"
              }`}
            >
              {prop.tag}
            </span>
          </div>
          <p className="mt-3 font-display text-[15px] font-bold leading-snug text-ink">{prop.label}</p>
          <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-2">{prop.verdict}</p>
          <p className="mt-auto border-t border-line pt-3 font-mono text-[10.5px] leading-relaxed text-muted">
            Правило темы: анимируем только transform/opacity · всё остальное — мгновенные состояния или hover-акценты
          </p>
        </aside>
      </div>
    </div>
  );
}
