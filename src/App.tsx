import { useEffect, useState } from "react";
import { StepOne } from "./components/StepOne";
import { StepCode } from "./components/StepCode";
import { HeadCleanup } from "./components/HeadCleanup";
import { LoadTimeline } from "./components/LoadTimeline";
import { PageWireframe } from "./components/PageWireframe";
import { FontSpec } from "./components/FontSpec";
import { AssemblyMap } from "./components/AssemblyMap";
import { PipelineLab } from "./components/PipelineLab";
import { RevealDemo } from "./components/RevealDemo";
import { FlowDiagram } from "./components/FlowDiagram";
import { Checklist } from "./components/Checklist";
import { Toaster } from "./components/Toaster";
import { Reveal } from "./components/Reveal";
import { STEP2_FILES, STEP2_NOTES } from "./data/step2";
import { STEP3_FILES, STEP3_NOTES } from "./data/step3";
import { STEP4_FILES, STEP4_NOTES } from "./data/step4";
import { STEP5_FILES, STEP5_NOTES, SECURITY_CHECKS, TG_SETUP } from "./data/step5";

const STEPS = [
  { num: "01", short: "Структура", title: "Структура темы", meta: "~20 файлов" },
  { num: "02", short: "Фундамент", title: "style.css + functions.php", meta: "6 файлов" },
  { num: "03", short: "Каркас HTML", title: "header.php + footer.php", meta: "2 файла" },
  { num: "04", short: "Главная", title: "front-page.php + анимации", meta: "5 файлов" },
  { num: "05", short: "Лиды в Telegram", title: "AJAX-форма → Telegram", meta: "4 файла" },
];

const TICKER = [
  "PHP 8.x",
  "0 конструкторов",
  "критический CSS ~3 КБ",
  "defer-скрипты",
  "native lazy-loading",
  "REST API вместо admin-ajax",
  "Telegram Bot API",
  "Intersection Observer",
  "Vanilla JS ~7 КБ",
  "без jQuery",
  "PageSpeed 95+",
  "LCP · CLS · INP",
];

// r4: чертёж открыт на текущем листе диалога (Шаг 04)
const STEP_KEY = "karkas-active-step-r4";
const VISITED_KEY = "karkas-visited-steps";

const A11Y_CHECKS = [
  "<html lang> — через language_attributes(), а не хардкодом",
  "skip-link — первый элемент <body>, виден при фокусе с клавиатуры",
  "aria-label у каждой зоны <nav> — шапка, мобильное меню, подвал",
  "бургер: aria-expanded + aria-controls + скрытый текст для скринридера",
  "логотип — img с width/height: сдвиг макета (CLS) равен нулю",
  "fallback_cb => false — никакого автогенерируемого меню",
  "wp_footer() ровно один раз, непосредственно перед </body>",
  "ссылка на политику конфиденциальности — get_privacy_policy_url()",
];

// чек-лист производительности главной (лист 04)
const FRONT_CHECKS = [
  "Главная — только порядок секций: логика в inc/, вёрстка в template-parts/",
  "LCP-элемент (hero) полностью покрыт critical.css — не ждёт main.css",
  "У героя нет loading='lazy' — он и есть LCP; у всего ниже — lazy обязателен",
  "decoding='async' на всех миниатюрах — декодирование вне главного потока",
  "WP_Query с no_found_rows: true — без второго запроса COUNT(*)",
  "Reveal анимирует только transform/opacity — композитор, 60 fps",
  "io.unobserve() после появления — на длинной странице нет сотен подписок",
  "prefers-reduced-motion: reduce — анимации отключены, блоки видны сразу",
  "Стаггер сеток — через transition-delay, а не setTimeout-лесенки",
];

function Logo() {
  return (
    <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-3" aria-label="KARKAS — начало">
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true" className="shrink-0">
        <rect width="34" height="34" fill="#0B50D0" />
        <path d="M10 8v18M10 17l11-9M11.5 15.5L23 26" stroke="#F2F4F1" strokeWidth="3.4" strokeLinecap="square" fill="none" />
        <rect x="26.5" y="6" width="4" height="4" fill="#FF4D00" />
      </svg>
      <span className="leading-none">
        <span className="block font-display text-[17px] font-bold tracking-tight text-ink">KARKAS</span>
        <span className="mt-1 block font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted">
          чертёж WordPress-темы
        </span>
      </span>
    </a>
  );
}

export default function App() {
  const [step, setStep] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem(STEP_KEY));
      if (saved >= 1 && saved <= 5) return saved;
    } catch { /* noop */ }
    return 4;
  });
  const [visited, setVisited] = useState<Set<number>>(() => {
    try {
      const raw = localStorage.getItem(VISITED_KEY);
      if (raw) return new Set(JSON.parse(raw) as number[]);
    } catch { /* noop */ }
    return new Set([1]);
  });

  useEffect(() => {
    try {
      localStorage.setItem(STEP_KEY, String(step));
      localStorage.setItem(VISITED_KEY, JSON.stringify([...visited, step]));
    } catch { /* noop */ }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [step, visited]);

  const go = (n: number) => {
    setVisited((prev) => new Set(prev).add(step));
    setStep(Math.min(5, Math.max(1, n)));
  };

  const current = STEPS[step - 1];

  return (
    <div className="blueprint-grid min-h-screen">
      {/* ── шапка-штамп ── */}
      <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/95 backdrop-blur-[2px]">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Logo />
          <span className="hidden h-8 w-px bg-line md:block" aria-hidden="true" />
          <span className="hidden font-mono text-[11px] uppercase tracking-widest text-muted md:block">
            многостраничный корпоративный сайт · mobile-first
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-2 sm:block">
              Шифр KRK-01
            </span>
            <span className="border border-signal bg-signal/10 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-signal">
              Rev 1.0
            </span>
            <span className="hidden border border-accent bg-accent/10 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-accent lg:block">
              цель: PSI 95+
            </span>
          </div>
        </div>

        {/* бегущая строка спецификации */}
        <div className="overflow-hidden border-t border-ink bg-ink py-1.5" aria-hidden="true">
          <div className="ticker-track flex w-max whitespace-nowrap">
            {[0, 1].map((dup) => (
              <span key={dup} className="flex items-center">
                {TICKER.map((t) => (
                  <span key={`${dup}-${t}`} className="flex items-center font-mono text-[10.5px] uppercase tracking-widest text-paper/80">
                    <span className="px-4">{t}</span>
                    <span className="text-signal">◆</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── мобильная навигация по шагам ── */}
      <nav
        className="thin-scroll sticky top-[92px] z-30 flex gap-2 overflow-x-auto border-b border-line bg-paper/95 px-4 py-2.5 backdrop-blur-[2px] lg:hidden"
        aria-label="Шаги (мобильная навигация)"
      >
        {STEPS.map((s, i) => {
          const n = i + 1;
          const active = n === step;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => go(n)}
              aria-current={active ? "step" : undefined}
              className={`flex shrink-0 cursor-pointer items-center gap-2 border-2 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors duration-150 ${
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-panel text-ink-2 hover:border-ink"
              }`}
            >
              <span className={active ? "text-signal" : "text-accent"}>{s.num}</span>
              {s.short}
            </button>
          );
        })}
      </nav>

      {/* ── основная сетка ── */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="lg:grid lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-10">
          {/* боковая навигация (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-32">
              <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted">
                Листы чертежа
              </p>
              <ol className="border-l-2 border-ink">
                {STEPS.map((s, i) => {
                  const n = i + 1;
                  const active = n === step;
                  const done = visited.has(n) && !active;
                  return (
                    <li key={s.num}>
                      <button
                        type="button"
                        onClick={() => go(n)}
                        aria-current={active ? "step" : undefined}
                        className={`group relative flex w-full cursor-pointer items-start gap-3 py-3 pl-4 pr-2 text-left transition-colors duration-150 ${
                          active ? "bg-panel" : "hover:bg-panel/60"
                        }`}
                      >
                        <span
                          className={`absolute -left-[2px] top-0 h-full w-[3px] transition-all duration-200 ${
                            active ? "bg-signal" : "bg-transparent group-hover:bg-line"
                          }`}
                          aria-hidden="true"
                        />
                        <span
                          className={`mt-0.5 font-display text-[15px] font-bold leading-none ${
                            active ? "text-accent" : done ? "text-ink-2" : "text-muted"
                          }`}
                        >
                          {s.num}
                        </span>
                        <span className="min-w-0">
                          <span
                            className={`block text-[13px] font-bold leading-tight ${
                              active ? "text-ink" : "text-ink-2"
                            }`}
                          >
                            {s.title}
                          </span>
                          <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                            {done && (
                              <svg width="10" height="10" viewBox="0 0 10 10" className="text-accent" aria-hidden="true">
                                <path d="M1.5 5.5l2.5 2.5L8.5 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                              </svg>
                            )}
                            {s.meta}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-6 border border-line bg-panel p-3.5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Терминал</p>
                <p className="mt-2 font-mono text-[11.5px] leading-relaxed text-ink-2">
                  <span className="text-accent">$</span> wp theme activate karkas<span className="caret text-signal">▊</span>
                </p>
                <p className="mt-1 font-mono text-[10.5px] text-muted">успех: тема активна, мусора в head нет</p>
              </div>
            </div>
          </aside>

          {/* контент шага */}
          <main key={step} className="min-w-0">
            {step === 1 && <StepOne onNext={() => go(2)} />}

            {step === 2 && (
              <StepCode
                num="02"
                title="style.css и functions.php"
                lead="Паспорт темы, загрузчик модулей и три модуля инкапсуляции — setup, enqueue, cleanup. Именно здесь закладывается весь бюджет производительности: инлайн-критический CSS, неблокирующий main.css и defer-скрипты."
                files={STEP2_FILES}
                notes={STEP2_NOTES}
                onPrev={() => go(1)}
                onNext={() => go(3)}
              >
                <Reveal>
                  <HeadCleanup />
                </Reveal>
                <Reveal delay={80}>
                  <LoadTimeline />
                </Reveal>
              </StepCode>
            )}

            {step === 3 && (
              <StepCode
                num="03"
                title="header.php и footer.php"
                lead="Чистый семантический HTML: <head> на три строки плюс wp_head(), самозагружаемые шрифты без единого CDN, skip-link и полная aria-разметка. Всё тяжёлое уже вынесено в модули из шага 02 — шаблоны остались только разметкой."
                files={STEP3_FILES}
                notes={STEP3_NOTES}
                onPrev={() => go(2)}
                onNext={() => go(4)}
              >
                <Reveal>
                  <PageWireframe />
                </Reveal>
                <Reveal delay={80}>
                  <FontSpec />
                </Reveal>
                <Reveal delay={120}>
                  <div className="max-w-xl">
                    <Checklist items={A11Y_CHECKS} storageKey="karkas-a11y-checks" />
                  </div>
                </Reveal>
              </StepCode>
            )}

            {step === 4 && (
              <StepCode
                num="04"
                title="front-page.php и лёгкие анимации"
                lead="Главная собирается из template-parts как из деталей: шаблон держит только порядок секций. Анимации появления — только transform и opacity на Intersection Observer: дёшево для композитора, безопасно для INP. Ниже — схема сборки, живое демо приёма и лаборатория рендера."
                files={STEP4_FILES}
                notes={STEP4_NOTES}
                onPrev={() => go(3)}
                onNext={() => go(5)}
              >
                <Reveal>
                  <AssemblyMap />
                </Reveal>
                <Reveal delay={80}>
                  <RevealDemo />
                </Reveal>
                <Reveal delay={120}>
                  <PipelineLab />
                </Reveal>
                <Reveal delay={160}>
                  <div className="max-w-xl">
                    <Checklist items={FRONT_CHECKS} storageKey="karkas-front-checks" />
                  </div>
                </Reveal>
              </StepCode>
            )}

            {step === 5 && (
              <StepCode
                num="05"
                title="AJAX-форма заявки → Telegram"
                lead="Лид уходит через WP REST API напрямую в Telegram Bot API: валидация в args, nonce против CSRF, honeypot против ботов, rate-limit на транзиентах. Ни одного плагина форм."
                files={STEP5_FILES}
                notes={STEP5_NOTES}
                onPrev={() => go(4)}
                nextLabel="В начало ↺"
                onNext={() => go(1)}
              >
                <Reveal>
                  <FlowDiagram />
                </Reveal>
                <div className="grid gap-8 lg:grid-cols-2">
                  <Reveal delay={60}>
                    <Checklist items={SECURITY_CHECKS} />
                  </Reveal>
                  <Reveal delay={120}>
                    <div className="flex h-full flex-col border-2 border-ink bg-panel">
                      <div className="flex items-center gap-3 border-b-2 border-ink px-4 py-3">
                        <svg width="16" height="16" viewBox="0 0 16 16" className="text-accent" aria-hidden="true">
                          <path d="M14.5 1.5L7 9M14.5 1.5L10 14.5 7 9M14.5 1.5L1.5 6.5 7 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="bevel" />
                        </svg>
                        <h3 className="font-mono text-[12px] font-bold uppercase tracking-widest">
                          Подключение за 5 минут
                        </h3>
                      </div>
                      <ol className="flex-1 divide-y divide-line">
                        {TG_SETUP.map((t) => (
                          <li key={t.step} className="flex items-start gap-3.5 px-4 py-3.5">
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border-2 border-accent font-display text-[12px] font-bold text-accent">
                              {t.step}
                            </span>
                            <span className="text-[13px] leading-relaxed text-ink-2">{t.text}</span>
                          </li>
                        ))}
                      </ol>
                      <p className="border-t-2 border-signal bg-signal/10 px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-widest text-signal">
                        Токен — только в wp-config.php
                      </p>
                    </div>
                  </Reveal>
                </div>
              </StepCode>
            )}
          </main>
        </div>
      </div>

      {/* ── нижний штамповый блок ── */}
      <footer className="border-t-2 border-ink bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-ink px-0 sm:grid-cols-4">
          {[
            { label: "Разработано", value: "KARKAS · WP 6.x + PHP 8" },
            { label: "Проверено", value: "PageSpeed · Lighthouse" },
            { label: "Формат", value: "5 листов · A4" },
            { label: "Лист", value: `${current.num} из 05` },
          ].map((c) => (
            <div key={c.label} className="border border-ink-2/60 px-4 py-3.5">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-paper/45">{c.label}</p>
              <p className="mt-1 font-mono text-[12px] font-semibold text-paper">{c.value}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-ink-2/60">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="font-mono text-[11px] text-paper/60">
              Чистый WordPress · без Elementor, Divi и WPBakery · без Three.js
            </p>
            <p className="font-mono text-[11px] text-paper/60">
              Стек темы: <span className="text-paper">HTML5 · SCSS · Vanilla JS · REST API</span>
            </p>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
