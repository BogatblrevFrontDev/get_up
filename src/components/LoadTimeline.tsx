const STOPS = [
  {
    time: "0 мс",
    title: "critical.css уже внутри <head>",
    text: "wp_add_inline_style печатает ~3 КБ вместе с HTML. Браузер рисует первый экран без единого сетевого запроса за стилями.",
    live: true,
  },
  {
    time: "первая отрисовка",
    title: "LCP нарисован",
    text: "Герой, шапка и кнопки полностью покрыты критическим CSS — LCP закрывается зелёным даже на медленной мобильной сети.",
    live: false,
  },
  {
    time: "параллельно",
    title: "main.css — preload, не блокирует",
    text: "rel=\"preload\" + onload переключает rel на stylesheet. Парсер продолжает разбирать HTML, стили остального сайта доезжают фоном.",
    live: false,
  },
  {
    time: "DOMContentLoaded",
    title: "defer-скрипты исполняются",
    text: "app.js (reveal-анимации, бургер) и lead-form.js (AJAX-форма) стартуют, когда DOM готов. Парсер они ни разу не прерывали.",
    live: false,
  },
];

export function LoadTimeline() {
  return (
    <div className="border-2 border-ink bg-panel shadow-[6px_6px_0_0_rgba(18,22,28,0.15)]">
      <div className="flex flex-wrap items-center gap-3 border-b-2 border-ink px-4 py-3 sm:px-5">
        <span className="h-3 w-3 bg-signal" aria-hidden="true" />
        <h3 className="font-mono text-[12px] font-bold uppercase tracking-widest text-ink">
          Таймлайн загрузки страницы
        </h3>
        <span className="ml-auto hidden font-mono text-[11px] text-muted sm:block">
          ни одного render-blocking ресурса
        </span>
      </div>

      <ol className="px-4 py-5 sm:px-6">
        {STOPS.map((s, i) => (
          <li key={s.title} className="relative flex gap-4 pb-6 last:pb-0 sm:gap-5">
            {/* рельса */}
            {i < STOPS.length - 1 && (
              <span className="dash-line-v absolute left-[5px] top-5 h-[calc(100%-14px)] w-[2px] text-ink/30" aria-hidden="true" />
            )}
            <span
              className={`relative z-10 mt-1 h-3 w-3 shrink-0 border-2 ${
                s.live ? "border-accent bg-accent node-live" : "border-ink bg-paper"
              }`}
              aria-hidden="true"
            />
            <div className="min-w-0 group">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="border border-ink bg-ink px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-paper">
                  {s.time}
                </span>
                <h4 className="text-[14px] font-bold text-ink transition-colors duration-150 group-hover:text-accent-deep">
                  {s.title}
                </h4>
              </div>
              <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t-2 border-ink bg-paper-2/60 px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-widest text-muted sm:px-6">
        <span>Σ свои ассеты: <b className="text-accent-deep">≈ 38 КБ</b></span>
        <span>сторонний JS: <b className="text-accent-deep">0 КБ</b></span>
        <span className="hidden text-signal sm:inline">цель PSI 95+ достижима</span>
      </div>
    </div>
  );
}
