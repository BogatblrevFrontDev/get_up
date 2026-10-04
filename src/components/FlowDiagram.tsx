const NODES = [
  { title: "Браузер", sub: "fetch POST · JSON", live: true },
  { title: "WP REST API", sub: "karkas/v1/lead", live: false },
  { title: "Проверки", sub: "nonce · honeypot · 30 c", live: false, accent: true },
  { title: "wp_remote_post", sub: "timeout: 5", live: false },
  { title: "Telegram", sub: "чат отдела продаж", live: true, signal: true },
];

function Node({ title, sub, live, accent, signal }: (typeof NODES)[number]) {
  return (
    <div
      className={`relative min-w-[150px] flex-1 border-2 px-3.5 py-3 text-center transition-transform duration-200 hover:-translate-y-0.5 ${
        accent
          ? "border-accent bg-accent text-paper shadow-[4px_4px_0_0_rgba(11,80,208,0.35)]"
          : signal
            ? "border-ink bg-ink text-paper shadow-[4px_4px_0_0_rgba(255,77,0,0.7)]"
            : "border-ink bg-panel shadow-[4px_4px_0_0_rgba(18,22,28,0.15)]"
      } ${live ? "node-live" : ""}`}
    >
      <p className="font-mono text-[12px] font-bold tracking-wide">{title}</p>
      <p className={`mt-0.5 font-mono text-[10.5px] ${accent || signal ? "text-paper/70" : "text-muted"}`}>{sub}</p>
    </div>
  );
}

function ArrowH() {
  return (
    <div className="hidden w-10 shrink-0 flex-col items-center justify-center md:flex" aria-hidden="true">
      <div className="dash-line h-[2px] w-full text-ink/60" />
      <svg width="10" height="10" viewBox="0 0 10 10" className="-mt-[1px] -translate-y-[6px] translate-x-[14px] text-ink/60">
        <path d="M1 1l7 4-7 4z" fill="currentColor" />
      </svg>
    </div>
  );
}

function ArrowV() {
  return (
    <div className="flex h-8 flex-col items-center justify-center md:hidden" aria-hidden="true">
      <div className="dash-line-v h-full w-[2px] text-ink/60" />
      <svg width="10" height="10" viewBox="0 0 10 10" className="-translate-y-[2px] text-ink/60">
        <path d="M1 2l4 7 4-7z" fill="currentColor" />
      </svg>
    </div>
  );
}

export function FlowDiagram() {
  return (
    <div className="border-2 border-ink bg-paper-2/70 p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-3 w-3 bg-signal" aria-hidden="true" />
        <h3 className="font-mono text-[12px] font-bold uppercase tracking-widest text-ink">
          Путь заявки · ~300 мс
        </h3>
        <span className="ml-auto hidden font-mono text-[11px] text-muted sm:block">без перезагрузки страницы</span>
      </div>

      <div className="flex flex-col items-stretch md:flex-row md:items-center">
        {NODES.map((node, i) => (
          <div key={node.title} className="contents">
            {i > 0 && (
              <>
                <ArrowH />
                <ArrowV />
              </>
            )}
            <Node {...node} />
          </div>
        ))}
      </div>

      <p className="mt-4 border-t border-line pt-3 font-mono text-[11px] leading-relaxed text-muted">
        HTTP-статусы честные: 200 — принято · 403 — протух nonce · 422 — валидация · 429 — rate-limit · 502 — Telegram лег.
        Фронт показывает соответствующее сообщение, кнопка разблокируется в finally.
      </p>
    </div>
  );
}
