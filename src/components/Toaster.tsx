import { useEffect, useState } from "react";

type ToastItem = { id: number; text: string };

let counter = 0;

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const onToast = (e: Event) => {
      const text = (e as CustomEvent<string>).detail;
      const id = ++counter;
      setItems((prev) => [...prev.slice(-2), { id, text }]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 2600);
    };
    window.addEventListener("karkas:toast", onToast);
    return () => window.removeEventListener("karkas:toast", onToast);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-6 sm:translate-x-0">
      {items.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-3 border-2 border-ink bg-ink px-4 py-3 text-paper shadow-[4px_4px_0_0_rgba(11,80,208,0.9)]"
          role="status"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0 text-signal" aria-hidden="true">
            <path d="M2 9l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
          </svg>
          <span className="font-mono text-[12px] leading-snug tracking-wide">{t.text}</span>
        </div>
      ))}
    </div>
  );
}
