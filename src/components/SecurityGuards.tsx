import { useState } from "react";

type Guard = "nonce" | "honeypot" | "rate";

const GUARDS: Record<Guard, { title: string; icon: string; code: string; explain: string; tone: "accent" | "signal" | "ink" }> = {
  nonce: {
    title: "Nonce против CSRF",
    icon: "🔐",
    code: `// inc/enqueue.php — создаём
wp_create_nonce( 'karkas_lead' )

// inc/ajax.php — проверяем
if ( ! wp_verify_nonce( $request['nonce'], 'karkas_lead' ) ) {
    return new WP_Error( 'expired', '...', [ 'status' => 403 ] );
}`,
    explain:
      "Nonce — одноразовый токен, привязанный к сессии пользователя. Создаётся на сервере, уезжает в window.karkasData, возвращается с каждым POST. Если токен протух (обычно через 24 часа) или пришёл с другого домена — 403.",
    tone: "accent",
  },
  honeypot: {
    title: "Honeypot против ботов",
    icon: "🍯",
    code: `<!-- template-parts/forms/lead-form.php -->
<label class="visually-hidden" aria-hidden="true">
    <input type="text" name="website" tabindex="-1" autocomplete="off">
</label>

// inc/ajax.php
if ( '' !== trim( $request['website'] ) ) {
    return new WP_REST_Response( [ 'ok' => true ], 200 );
    // молча «принимаем» — бот не узнает, что его раскрыли
}`,
    explain:
      "Скрытое поле website: люди его не видят (visually-hidden + aria-hidden), автозаполнители ботов заполняют. Если поле не пустое — отвечаем «успехом» и молча выбрасываем заявку. Бот не обучается.",
    tone: "signal",
  },
  rate: {
    title: "Rate-limit на транзиентах",
    icon: "⏱",
    code: `// inc/ajax.php
$ip  = sanitize_text_field( $_SERVER['REMOTE_ADDR'] );
$key = 'karkas_lead_' . md5( $ip );

if ( false !== get_transient( $key ) ) {
    return new WP_Error( 'slow_down', '...', [ 'status' => 429 ] );
}

set_transient( $key, 1, 30 ); // 30 секунд тишины`,
    explain:
      "set_transient на 30 секунд с ключом по md5(IP) — простейшая защита от флуда. Не требует внешних сервисов (Redis, Memcached), не трогает cron. Одна заявка с IP в полминуты — максимум.",
    tone: "ink",
  },
};

export function SecurityGuards() {
  const [active, setActive] = useState<Guard>("nonce");
  const guard = GUARDS[active];

  return (
    <div className="border-2 border-ink bg-panel shadow-[6px_6px_0_0_rgba(18,22,28,0.15)]">
      <div className="flex flex-wrap items-center gap-3 border-b-2 border-ink px-4 py-3">
        <span className="h-3 w-3 bg-accent" aria-hidden="true" />
        <h3 className="font-mono text-[12px] font-bold uppercase tracking-widest text-ink">
          Три рубежа защиты · кликните по пункту
        </h3>
      </div>

      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {/* переключатель */}
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Рубеж защиты">
            {(Object.keys(GUARDS) as Guard[]).map((g) => (
              <button
                key={g}
                type="button"
                role="tab"
                aria-selected={g === active}
                onClick={() => setActive(g)}
                className={`cursor-pointer border-2 px-3 py-1.5 font-mono text-[12px] font-bold transition-all duration-150 ${
                  g === active
                    ? "border-ink bg-ink text-paper shadow-[3px_3px_0_0_rgba(11,80,208,0.85)]"
                    : "border-line bg-paper text-ink-2 hover:-translate-y-0.5 hover:border-ink"
                }`}
              >
                {GUARDS[g].icon} {g === "nonce" ? "Nonce" : g === "honeypot" ? "Honeypot" : "Rate-limit"}
              </button>
            ))}
          </div>

          {/* код */}
          <div key={active} className="mt-4 overflow-hidden border-2 border-ink bg-codebg shadow-[4px_4px_0_0_rgba(18,22,28,0.18)]">
            <div className="flex items-center gap-2 border-b border-codeline bg-codebar px-3 py-2">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="h-2 w-2 bg-signal" />
                <span className="h-2 w-2 bg-ink/20" />
                <span className="h-2 w-2 bg-ink/20" />
              </span>
              <span className="font-mono text-[11px] font-bold text-paper">
                {active === "nonce" ? "inc/enqueue.php + inc/ajax.php" : active === "honeypot" ? "template-parts/forms/lead-form.php + inc/ajax.php" : "inc/ajax.php"}
              </span>
            </div>
            <pre className="thin-scroll max-h-[280px] overflow-auto p-4 font-mono text-[12px] leading-relaxed text-[#d7dee8]">
              <code>{guard.code}</code>
            </pre>
          </div>
        </div>

        {/* объяснение */}
        <aside
          className={`flex min-w-0 flex-col border-2 p-4 transition-colors duration-300 ${
            guard.tone === "accent" ? "border-accent bg-accent/10" : guard.tone === "signal" ? "border-signal bg-signal/10" : "border-ink bg-paper-2/60"
          }`}
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Рубеж</span>
            <span
              className={`border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${
                guard.tone === "accent"
                  ? "border-accent bg-accent text-paper"
                  : guard.tone === "signal"
                    ? "border-signal bg-signal text-paper"
                    : "border-ink bg-ink text-paper"
              }`}
            >
              {active === "nonce" ? "CSRF" : active === "honeypot" ? "СПАМ" : "ФЛУД"}
            </span>
          </div>
          <p className="mt-3 font-display text-[15px] font-bold leading-snug text-ink">{guard.title}</p>
          <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-2">{guard.explain}</p>
          <p className="mt-auto border-t border-line pt-3 font-mono text-[10.5px] leading-relaxed text-muted">
            Все три рубежа работают последовательно: nonce → honeypot → rate-limit → Telegram
          </p>
        </aside>
      </div>
    </div>
  );
}
