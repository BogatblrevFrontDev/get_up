import { useState } from "react";

type Zone = {
  id: string;
  label: string;
  tag: string;
  php: string;
  note: string;
  a11y?: string;
};

const HEADER_ZONES: Zone[] = [
  {
    id: "head",
    label: "<head>",
    tag: "head",
    php: "wp_head()",
    note: "Три строки: charset, viewport, theme-color. Title, canonical и OG отдаёт ядро через title-tag, критический CSS уже заинлайнен модулем enqueue.",
  },
  {
    id: "skiplink",
    label: "skip-link",
    tag: "a.skip-link",
    php: "esc_html_e( 'Перейти к содержимому' )",
    note: "Первый элемент <body>. Видим только при фокусе с клавиатуры — ведёт прямо к #content, минуя шапку и меню.",
    a11y: "href=#content, появляется по :focus-visible",
  },
  {
    id: "logo",
    label: "Логотип",
    tag: "a.site-logo",
    php: "the_custom_logo() · bloginfo('name')",
    note: "Если логотип не загружен — текстовый фолбэк от bloginfo('name'). Картинка всегда с width/height, поэтому сдвиг макета (CLS) равен нулю.",
  },
  {
    id: "nav",
    label: "Основное меню",
    tag: "nav > ul",
    php: "wp_nav_menu([ 'theme_location' => 'primary' ])",
    note: "container => false и fallback_cb => false: никакого автогенерируемого списка всех страниц, если меню не назначено. Разметку контролирует тема.",
  },
  {
    id: "phone",
    label: "Телефон",
    tag: "a.site-phone",
    php: "KARKAS_PHONE → tel:",
    note: "Константа из functions.php. В tel: пробелы и дефисы вырезаются str_replace — на мобильном тап сразу инициирует звонок.",
  },
  {
    id: "burger",
    label: "Бургер",
    tag: "button.burger",
    php: "aria-expanded + aria-controls",
    note: "Состояние переключает app.js: aria-expanded, скрытие #mobile-menu и класс body.menu-open. Никаких инлайн-скриптов в разметке.",
    a11y: "aria-expanded, aria-controls, визуально скрытый текст",
  },
  {
    id: "mobilenav",
    label: "Мобильное меню",
    tag: "nav#mobile-menu",
    php: "wp_nav_menu('primary') + hidden",
    note: "Дублирует primary-меню для мобильного оверлея. Атрибут hidden — нативно, без display:none-хаков; CSS анимирует transform/opacity при menu-open.",
    a11y: "hidden + aria-label «Мобильное меню»",
  },
];

const FOOTER_ZONES: Zone[] = [
  {
    id: "brand",
    label: "Бренд-блок",
    tag: "div.site-footer__brand",
    php: "bloginfo('name') + bloginfo('description')",
    note: "Название и описание сайта берутся из настроек WP — меняются в админке без правки кода темы.",
  },
  {
    id: "footernav",
    label: "Меню подвала",
    tag: "nav.site-footer__nav",
    php: "wp_nav_menu([ 'theme_location' => 'footer' ])",
    note: "Отдельная зона навигации, зарегистрирована в inc/setup.php. Юридические страницы и сервисные ссылки живут здесь, не засоряя primary.",
  },
  {
    id: "contacts",
    label: "Контакты",
    tag: "div.site-footer__contacts",
    php: "tel: · mailto: · t.me",
    note: "Телефон — та же константа KARKAS_PHONE: один источник правды для шапки и подвала. Telegram-ссылка с rel=\"noopener\".",
  },
  {
    id: "bottom",
    label: "Нижняя строка",
    tag: "div.site-footer__bottom",
    php: "gmdate('Y') + get_privacy_policy_url()",
    note: "Год в копирайте не стареет — gmdate('Y'). Политика конфиденциальности выводится, только если она задана в админке (обязательна для формы!).",
  },
  {
    id: "wpfooter",
    label: "wp_footer()",
    tag: "hook",
    php: "wp_footer() — один раз, перед </body>",
    note: "Defer-скрипты темы к этому моменту уже распарсены; хук отдаёт только очереди плагинов. Дублирование wp_footer() — классическая ошибка, удваивающая вывод.",
  },
  {
    id: "closetags",
    label: "</body></html>",
    tag: "html",
    php: "language_attributes() в открывающем теге",
    note: "Язык документа — из настроек сайта (ru-RU): корректно для скринридеров и SEO. Закрывающие теги — всегда в footer.php, никогда в шаблонах страниц.",
  },
];

function ZoneBlock({
  zone,
  active,
  onSelect,
  className = "",
}: {
  zone: Zone;
  active: boolean;
  onSelect: (id: string) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(zone.id)}
      aria-pressed={active}
      className={`cursor-pointer border px-2 py-1.5 text-left font-mono text-[10.5px] leading-tight transition-all duration-150 ${
        active
          ? "border-accent bg-accent text-paper shadow-[3px_3px_0_0_rgba(11,80,208,0.4)]"
          : "border-dashed border-ink-2/50 bg-paper text-ink-2 hover:border-ink hover:bg-paper-2"
      } ${className}`}
    >
      {zone.label}
    </button>
  );
}

export function PageWireframe() {
  const [view, setView] = useState<"header" | "footer">("header");
  const [zoneId, setZoneId] = useState<string>(HEADER_ZONES[0].id);

  const zones = view === "header" ? HEADER_ZONES : FOOTER_ZONES;
  const active = zones.find((z) => z.id === zoneId) ?? zones[0];

  const switchView = (v: "header" | "footer") => {
    setView(v);
    setZoneId((v === "header" ? HEADER_ZONES : FOOTER_ZONES)[0].id);
  };

  return (
    <div className="border-2 border-ink bg-panel shadow-[6px_6px_0_0_rgba(18,22,28,0.15)]">
      <div className="flex flex-wrap items-center gap-3 border-b-2 border-ink px-4 py-3">
        <span className="h-3 w-3 bg-accent" aria-hidden="true" />
        <h3 className="font-mono text-[12px] font-bold uppercase tracking-widest text-ink">
          Анатомия шаблона · кликните по зоне
        </h3>
        <div className="ml-auto flex border border-ink" role="tablist" aria-label="Выбор шаблона">
          {(["header", "footer"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => switchView(v)}
              className={`cursor-pointer px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors duration-150 ${
                view === v ? "bg-ink text-paper" : "bg-panel text-ink-2 hover:bg-paper-2"
              }`}
            >
              {v}.php
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* макет */}
        <div className="min-w-0">
          <div className="border-2 border-ink bg-paper">
            <div className="flex items-center gap-2 border-b border-line bg-paper-2/80 px-3 py-2">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-signal" />
                <span className="h-2 w-2 rounded-full bg-ink/20" />
                <span className="h-2 w-2 rounded-full bg-ink/20" />
              </span>
              <span className="truncate font-mono text-[10px] text-muted">https://example.dev/</span>
            </div>

            {view === "header" ? (
              <div className="p-3 sm:p-4">
                <ZoneBlock zone={zones[0]} active={active.id === zones[0].id} onSelect={setZoneId} className="w-full" />
                <ZoneBlock zone={zones[1]} active={active.id === zones[1].id} onSelect={setZoneId} className="mt-2 w-40" />

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <ZoneBlock zone={zones[2]} active={active.id === zones[2].id} onSelect={setZoneId} />
                  <div className="hidden flex-1 md:block">
                    <ZoneBlock zone={zones[3]} active={active.id === zones[3].id} onSelect={setZoneId} className="w-full" />
                  </div>
                  <ZoneBlock zone={zones[4]} active={active.id === zones[4].id} onSelect={setZoneId} />
                  <div className="md:hidden">
                    <ZoneBlock zone={zones[5]} active={active.id === zones[5].id} onSelect={setZoneId} />
                  </div>
                </div>
                <div className="mt-2 hidden md:block">
                  <ZoneBlock zone={zones[5]} active={active.id === zones[5].id} onSelect={setZoneId} className="w-28" />
                </div>
                <ZoneBlock zone={zones[6]} active={active.id === zones[6].id} onSelect={setZoneId} className="mt-2 w-full opacity-80" />

                <div className="mt-3 flex items-center gap-2">
                  <span className="h-px flex-1 bg-line" aria-hidden="true" />
                  <span className="font-mono text-[9.5px] uppercase tracking-widest text-muted">get_header() → контент страницы</span>
                  <span className="h-px flex-1 bg-line" aria-hidden="true" />
                </div>
                <div className="mt-2 h-20 border border-dashed border-line bg-paper-2/40 p-3">
                  <span className="font-mono text-[10px] text-muted">index / front-page / page…</span>
                </div>
              </div>
            ) : (
              <div className="p-3 sm:p-4">
                <div className="h-14 border border-dashed border-line bg-paper-2/40 p-3">
                  <span className="font-mono text-[10px] text-muted">контент страницы…</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="h-px flex-1 bg-line" aria-hidden="true" />
                  <span className="font-mono text-[9.5px] uppercase tracking-widest text-muted">get_footer()</span>
                  <span className="h-px flex-1 bg-line" aria-hidden="true" />
                </div>

                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  <ZoneBlock zone={zones[0]} active={active.id === zones[0].id} onSelect={setZoneId} className="h-full" />
                  <ZoneBlock zone={zones[1]} active={active.id === zones[1].id} onSelect={setZoneId} className="h-full" />
                  <ZoneBlock zone={zones[2]} active={active.id === zones[2].id} onSelect={setZoneId} className="h-full" />
                </div>
                <ZoneBlock zone={zones[3]} active={active.id === zones[3].id} onSelect={setZoneId} className="mt-2 w-full" />
                <ZoneBlock zone={zones[4]} active={active.id === zones[4].id} onSelect={setZoneId} className="mt-2 w-full" />
                <ZoneBlock zone={zones[5]} active={active.id === zones[5].id} onSelect={setZoneId} className="mt-2 w-full" />
              </div>
            )}
          </div>
        </div>

        {/* детали зоны */}
        <aside className="min-w-0 border-2 border-ink bg-codebg text-paper" aria-live="polite">
          <div className="flex items-center justify-between border-b border-codeline px-3.5 py-2.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-paper/50">Зона</span>
            <span className="font-mono text-[11px] font-bold text-paper">{active.tag}</span>
          </div>
          <div className="p-3.5 sm:p-4" key={active.id + view}>
            <p className="font-display text-[15px] font-bold leading-snug text-paper">{active.label}</p>
            <p className="mt-2 border-l-2 border-accent pl-2.5 font-mono text-[11px] leading-relaxed break-all text-[#7fb5ff]">
              {active.php}
            </p>
            <p className="mt-3 text-[12.5px] leading-relaxed text-paper/75">{active.note}</p>
            {active.a11y && (
              <p className="mt-3 flex items-start gap-2 border border-codeline bg-codebar px-2.5 py-2">
                <svg width="13" height="13" viewBox="0 0 14 14" className="mt-0.5 shrink-0 text-[#8ed8a0]" aria-hidden="true">
                  <circle cx="7" cy="7" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="7" cy="7" r="1.6" fill="currentColor" />
                </svg>
                <span className="font-mono text-[10.5px] leading-relaxed text-[#8ed8a0]">{active.a11y}</span>
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
