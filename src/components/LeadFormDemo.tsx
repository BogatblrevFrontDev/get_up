import { useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

export function LeadFormDemo() {
  const [state, setState] = useState<FormState>("idle");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) {
      setState("success"); // бот попался — молча «успех»
      return;
    }
    setState("loading");
    setTimeout(() => {
      setState("success");
    }, 1200);
  };

  const reset = () => {
    setState("idle");
    setName("");
    setPhone("");
    setMessage("");
    setHoneypot("");
  };

  return (
    <div className="border-2 border-ink bg-panel shadow-[6px_6px_0_0_rgba(18,22,28,0.15)]">
      <div className="flex flex-wrap items-center gap-3 border-b-2 border-ink px-4 py-3">
        <span className="h-3 w-3 bg-signal" aria-hidden="true" />
        <h3 className="font-mono text-[12px] font-bold uppercase tracking-widest text-ink">
          Демо формы заявки · AJAX без перезагрузки
        </h3>
        <span className="ml-auto hidden font-mono text-[11px] text-muted sm:block">
          попробуйте заполнить и отправить
        </span>
      </div>

      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest text-ink-2">
                  Ваше имя
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  placeholder="Иван"
                  className="w-full border-2 border-ink bg-paper px-3 py-2 font-body text-[14px] text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest text-ink-2">
                  Телефон
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  inputMode="tel"
                  placeholder="+7 ___ ___-__-__"
                  className="w-full border-2 border-ink bg-paper px-3 py-2 font-body text-[14px] text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest text-ink-2">
                Пара слов о задаче
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Например: нужен корпоративный сайт с каталогом"
                className="w-full resize-none border-2 border-ink bg-paper px-3 py-2 font-body text-[14px] text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
              />
            </label>

            {/* honeypot */}
            <label className="sr-only" aria-hidden="true">
              <span>Ваш сайт</span>
              <input
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </label>

            <button
              type="submit"
              disabled={state === "loading"}
              className={`w-full cursor-pointer border-2 border-ink px-4 py-3 font-mono text-[13px] font-bold uppercase tracking-widest transition-all duration-150 ${
                state === "loading"
                  ? "border-muted bg-muted text-paper"
                  : "bg-ink text-paper hover:-translate-y-0.5 hover:bg-accent hover:shadow-[4px_4px_0_0_rgba(18,22,28,0.9)] active:translate-y-0"
              }`}
            >
              {state === "loading" ? "Отправка..." : "Отправить заявку"}
            </button>

            <p className="font-mono text-[10.5px] leading-relaxed text-muted">
              Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных.
            </p>

            {/* статус */}
            {state === "success" && (
              <div className="border-2 border-accent bg-accent/10 px-4 py-3" role="status">
                <p className="flex items-center gap-2 font-mono text-[12px] font-bold text-accent-deep">
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                    <path d="M2 7l4 4L12 3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
                  </svg>
                  Спасибо! Заявка улетела в Telegram — ответим в течение 15 минут.
                </p>
              </div>
            )}
            {state === "error" && (
              <div className="border-2 border-signal bg-signal/10 px-4 py-3" role="alert">
                <p className="flex items-center gap-2 font-mono text-[12px] font-bold text-signal">
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                    <path d="M7 1v8M7 11v2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
                  </svg>
                  Что-то пошло не так. Попробуйте ещё раз.
                </p>
              </div>
            )}
          </form>

          {state === "success" && (
            <button
              type="button"
              onClick={reset}
              className="mt-3 cursor-pointer border-2 border-ink bg-panel px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-ink transition-all duration-150 hover:-translate-y-0.5 hover:bg-paper-2 hover:shadow-[3px_3px_0_0_rgba(18,22,28,0.25)] active:translate-y-0"
            >
              ↺ Сбросить форму
            </button>
          )}
        </div>

        {/* панель статуса */}
        <aside className="flex min-w-0 flex-col border-2 border-ink bg-codebg text-paper" aria-live="polite">
          <div className="flex items-center justify-between border-b border-codeline px-3.5 py-2.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-paper/50">Состояние</span>
            <span
              className={`border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${
                state === "idle"
                  ? "border-muted text-muted"
                  : state === "loading"
                    ? "border-[#e8b168] text-[#e8b168]"
                    : state === "success"
                      ? "border-[#8ed8a0] text-[#8ed8a0]"
                      : "border-signal text-signal"
              }`}
            >
              {state}
            </span>
          </div>
          <div className="flex flex-1 flex-col p-4">
            <p className="font-display text-[14px] font-bold leading-snug text-paper">
              {state === "idle" && "Форма готова к отправке"}
              {state === "loading" && "fetch → REST API → Telegram"}
              {state === "success" && "Заявка принята"}
              {state === "error" && "Ошибка сети или валидации"}
            </p>
            <ul className="mt-3 space-y-2">
              {state === "idle" && (
                <>
                  <li className="flex items-start gap-2 text-[11.5px] leading-relaxed text-paper/70">
                    <svg width="10" height="10" viewBox="0 0 10 10" className="mt-0.5 shrink-0 text-[#7fb5ff]" aria-hidden="true">
                      <path d="M1.5 5l2.5 2.5L8.5 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
                    </svg>
                    Заполните поля — валидация на клиенте и сервере
                  </li>
                  <li className="flex items-start gap-2 text-[11.5px] leading-relaxed text-paper/70">
                    <svg width="10" height="10" viewBox="0 0 10 10" className="mt-0.5 shrink-0 text-[#7fb5ff]" aria-hidden="true">
                      <path d="M1.5 5l2.5 2.5L8.5 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
                    </svg>
                    Honeypot-поле скрыто от людей, заполняется ботами
                  </li>
                  <li className="flex items-start gap-2 text-[11.5px] leading-relaxed text-paper/70">
                    <svg width="10" height="10" viewBox="0 0 10 10" className="mt-0.5 shrink-0 text-[#7fb5ff]" aria-hidden="true">
                      <path d="M1.5 5l2.5 2.5L8.5 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
                    </svg>
                    Nonce защищает от CSRF-атак
                  </li>
                </>
              )}
              {state === "loading" && (
                <li className="flex items-start gap-2 text-[11.5px] leading-relaxed text-[#e8b168]">
                  <span className="caret" aria-hidden="true">▊</span>
                  wp_remote_post → api.telegram.org/bot.../sendMessage
                </li>
              )}
              {state === "success" && (
                <>
                  <li className="flex items-start gap-2 text-[11.5px] leading-relaxed text-[#8ed8a0]">
                    <svg width="10" height="10" viewBox="0 0 10 10" className="mt-0.5 shrink-0" aria-hidden="true">
                      <path d="M1.5 5l2.5 2.5L8.5 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
                    </svg>
                    HTTP 200 · {name || "Иван"} → чат отдела продаж
                  </li>
                  <li className="flex items-start gap-2 text-[11.5px] leading-relaxed text-[#8ed8a0]">
                    <svg width="10" height="10" viewBox="0 0 10 10" className="mt-0.5 shrink-0" aria-hidden="true">
                      <path d="M1.5 5l2.5 2.5L8.5 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
                    </svg>
                    set_transient на 30 секунд — rate-limit сработал
                  </li>
                </>
              )}
              {state === "error" && (
                <li className="flex items-start gap-2 text-[11.5px] leading-relaxed text-signal">
                  <svg width="10" height="10" viewBox="0 0 10 10" className="mt-0.5 shrink-0" aria-hidden="true">
                    <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
                  </svg>
                  Проверьте nonce или попробуйте позже
                </li>
              )}
            </ul>
            <p className="mt-auto border-t border-codeline pt-3 font-mono text-[10px] leading-relaxed text-paper/50">
              Без перезагрузки страницы · без плагинов форм · чистый fetch + REST
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
