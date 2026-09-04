import { useState } from "react";

type Section = {
  id: string;
  title: string;
  file: string;
  badge: string;
  call: string;
  bullets: string[];
  perf: string;
};

const SECTIONS: Section[] = [
  {
    id: "hero",
    title: "Hero — первый экран",
    file: "template-parts/hero.php",
    badge: "LCP",
    call: "get_template_part( 'template-parts/hero' )",
    bullets: [
      "Кикер, H1 с УТП, лид-абзац, два CTA, блок микро-доказательств (dl/dt/dd)",
      "Вся разметка героя покрыта critical.css — рисуется до загрузки main.css",
    ],
    perf: "LCP живёт здесь: у героя нет loading='lazy', картинки с width/height, ноль render-blocking-ресурсов.",
  },
  {
    id: "advantages",
    title: "Преимущества",
    file: "template-parts/advantages.php",
    badge: "SVG",
    call: "get_template_part( 'template-parts/advantages' )",
    bullets: [
      "Шесть пунктов: одна колонка на мобильном, три на десктопе",
      "Иконки — inline-SVG на currentColor, по 300–700 байт каждая",
    ],
    perf: "Никаких иконочных шрифтов: минус запрос на 100+ КБ, перекраска иконки — одна строка CSS.",
  },
  {
    id: "cases",
    title: "Превью кейсов",
    file: "template-parts/cases-preview.php",
    badge: "CPT",
    call: "get_template_part( 'template-parts/cases', 'preview' )",
    bullets: [
      "Три свежих проекта из CPT «case», миниатюры case-thumb 640×400",
      "WP_Query с no_found_rows: true — без второго запроса COUNT(*)",
    ],
    perf: "loading='lazy' + decoding='async': картинки ниже первого экрана не отнимают сеть у LCP.",
  },
  {
    id: "cta",
    title: "CTA + форма заявки",
    file: "template-parts/cta.php",
    badge: "ЛИДЫ",
    call: "get_template_part( 'template-parts/cta' )",
    bullets: [
      "Заголовок-оффер и разметка формы из forms/lead-form.php",
      "lead-form.js подключён с defer и не трогает рендер",
    ],
    perf: "Отправка формы — через REST без перезагрузки страницы (шаг 05). На этом листе — только разметка.",
  },
];

function CodeLine({
  children,
  active,
  onClick,
  indent = 1,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  indent?: number;
}) {
  const base = `flex w-full items-center gap-2 py-1 font-mono text-[11.5px] leading-relaxed ${
    onClick ? "cursor-pointer transition-colors duration-150" : ""
  } ${active ? "bg-accent/15 text-accent-deep" : onClick ? "text-ink-2 hover:bg-paper-2" : "text-muted"}`;
  return (
    <span className="block" style={{ paddingLeft: `${indent * 14}px` }}>
      {onClick ? (
        <button type="button" onClick={onClick} className={base} aria-pressed={active}>
          {children}
        </button>
      ) : (
        <span className={base}>{children}</span>
      )}
    </span>
  );
}

export function AssemblyMap() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);
  const active = SECTIONS.find((s) => s.id === activeId) ?? SECTIONS[0];

  return (
    <div className="border-2 border-ink bg-panel shadow-[6px_6px_0_0_rgba(18,22,28,0.15)]">
      <div className="flex flex-wrap items-center gap-3 border-b-2 border-ink px-4 py-3">
        <span className="h-3 w-3 bg-accent" aria-hidden="true" />
        <h3 className="font-mono text-[12px] font-bold uppercase tracking-widest text-ink">
          Сборка главной · get_template_part()
        </h3>
        <span className="ml-auto hidden font-mono text-[11px] text-muted sm:block">
          кликните строку или карточку секции
        </span>
      </div>

      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {/* front-page.php */}
          <div className="border border-ink bg-paper">
            <div className="flex items-center gap-2 border-b border-line bg-paper-2/80 px-3 py-1.5">
              <span className="h-2 w-2 bg-signal" aria-hidden="true" />
              <span className="font-mono text-[11px] font-bold text-ink">front-page.php</span>
              <span className="ml-auto font-mono text-[9.5px] uppercase tracking-widest text-muted">
                только порядок секций
              </span>
            </div>
            <div className="px-2 py-2">
              <CodeLine indent={0}>&lt;?php get_header(); ?&gt;</CodeLine>
              <CodeLine indent={0}>&lt;main id="content" class="page-main"&gt;</CodeLine>
              {SECTIONS.map((s) => (
                <CodeLine
                  key={s.id}
                  indent={1}
                  active={s.id === activeId}
                  onClick={() => setActiveId(s.id)}
                >
                  <span className="text-muted select-none" aria-hidden="true">
                    ▸
                  </span>
                  {s.call}
                </CodeLine>
              ))}
              <CodeLine indent={0}>&lt;/main&gt;</CodeLine>
              <CodeLine indent={0}>&lt;?php get_footer(); ?&gt;</CodeLine>
            </div>
          </div>

          {/* карточки секций */}
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {SECTIONS.map((s) => {
              const isActive = s.id === activeId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveId(s.id)}
                  aria-pressed={isActive}
                  className={`group cursor-pointer border-2 p-3 text-left transition-all duration-150 ${
                    isActive
                      ? "border-ink bg-ink text-paper shadow-[4px_4px_0_0_rgba(11,80,208,0.85)]"
                      : "border-ink/25 bg-panel hover:-translate-y-0.5 hover:border-ink hover:shadow-[4px_4px_0_0_rgba(18,22,28,0.15)]"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className={`text-[13px] font-bold leading-tight ${isActive ? "text-paper" : "text-ink"}`}>
                      {s.title}
                    </span>
                    <span
                      className={`shrink-0 border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${
                        isActive ? "border-signal text-signal" : "border-accent text-accent"
                      }`}
                    >
                      {s.badge}
                    </span>
                  </span>
                  <span
                    className={`mt-1.5 block truncate font-mono text-[10.5px] ${
                      isActive ? "text-paper/60" : "text-muted"
                    }`}
                  >
                    {s.file}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* панель деталей */}
        <aside className="flex min-w-0 flex-col border-2 border-ink bg-codebg text-paper" aria-live="polite">
          <div className="flex items-center justify-between border-b border-codeline px-3.5 py-2.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-paper/50">Секция</span>
            <span className="font-mono text-[11px] font-bold text-paper">{active.file}</span>
          </div>
          <div key={active.id} className="flex flex-1 flex-col p-4">
            <p className="font-display text-[15px] font-bold leading-snug text-paper">{active.title}</p>
            <p className="mt-2 border-l-2 border-accent pl-2.5 font-mono text-[10.5px] leading-relaxed break-all text-[#7fb5ff]">
              {active.call}
            </p>
            <ul className="mt-3.5 space-y-2">
              {active.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-[12px] leading-relaxed text-paper/80">
                  <svg width="11" height="11" viewBox="0 0 12 12" className="mt-1 shrink-0 text-[#7fb5ff]" aria-hidden="true">
                    <path d="M2 1l8 5-8 5z" fill="currentColor" />
                  </svg>
                  {b}
                </li>
              ))}
            </ul>
            <p className="mt-auto flex items-start gap-2 border-t border-codeline pt-3">
              <svg width="13" height="13" viewBox="0 0 14 14" className="mt-0.5 shrink-0 text-[#8ed8a0]" aria-hidden="true">
                <path d="M7 1v6l3.5 2M7 13A6 6 0 107 1a6 6 0 000 12z" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="font-mono text-[10.5px] leading-relaxed text-[#8ed8a0]">{active.perf}</span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
