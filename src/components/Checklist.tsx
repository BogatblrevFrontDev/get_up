import { useEffect, useState } from "react";

const STORAGE_KEY = "karkas-security-checks";

export function Checklist({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<boolean[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as boolean[];
        if (Array.isArray(parsed) && parsed.length === items.length) return parsed;
      }
    } catch {
      /* приватный режим — работаем без сохранения */
    }
    return items.map(() => false);
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {
      /* noop */
    }
  }, [checked]);

  const done = checked.filter(Boolean).length;
  const total = items.length;
  const pct = Math.round((done / total) * 100);

  const toggle = (i: number) =>
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  return (
    <div className="border-2 border-ink bg-panel">
      <div className="flex items-center gap-3 border-b-2 border-ink px-4 py-3">
        <svg width="16" height="16" viewBox="0 0 16 16" className="text-accent" aria-hidden="true">
          <path d="M8 1l2 4.2 4.5.5-3.3 3 .9 4.5L8 11l-4.1 2.2.9-4.5-3.3-3L6 5.2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="bevel" />
        </svg>
        <h3 className="font-mono text-[12px] font-bold uppercase tracking-widest">Чек-лист безопасности</h3>
        <span className="ml-auto font-mono text-[12px] font-bold text-accent-deep">
          {done}/{total}
        </span>
      </div>

      <div className="h-1.5 w-full bg-paper-2" aria-hidden="true">
        <div
          className={`h-full transition-all duration-500 ${done === total ? "bg-signal" : "bg-accent"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="divide-y divide-line">
        {items.map((item, i) => (
          <li key={item}>
            <button
              type="button"
              onClick={() => toggle(i)}
              className={`flex w-full cursor-pointer items-start gap-3 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-paper-2 ${
                checked[i] ? "opacity-60" : ""
              }`}
            >
              <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border-2 transition-colors duration-150 ${
                  checked[i] ? "border-accent bg-accent" : "border-ink-2 bg-transparent"
                }`}
                aria-hidden="true"
              >
                {checked[i] && (
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M1.5 5.5l2.5 2.5L8.5 2" fill="none" stroke="#f2f4f1" strokeWidth="2" strokeLinecap="square" />
                  </svg>
                )}
              </span>
              <span
                className={`font-mono text-[12px] leading-relaxed text-ink-2 ${checked[i] ? "line-through" : ""}`}
              >
                {item}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div
        className={`border-t-2 px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest transition-colors duration-300 ${
          done === total ? "border-signal bg-signal text-paper" : "border-line text-muted"
        }`}
        role="status"
      >
        {done === total ? "✓ Готово к продакшену" : `Отмечайте внедрённое — осталось ${total - done}`}
      </div>
    </div>
  );
}
