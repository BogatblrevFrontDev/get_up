import { useMemo } from "react";
import hljs from "highlight.js/lib/core";
import php from "highlight.js/lib/languages/php";
import phpTemplate from "highlight.js/lib/languages/php-template";
import xml from "highlight.js/lib/languages/xml";
import javascript from "highlight.js/lib/languages/javascript";
import css from "highlight.js/lib/languages/css";
import scss from "highlight.js/lib/languages/scss";
import type { CodeFile } from "../data/step2";
import { toast } from "../lib/toast";

hljs.registerLanguage("xml", xml);
hljs.registerLanguage("php", php);
hljs.registerLanguage("php-template", phpTemplate);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("css", css);
hljs.registerLanguage("scss", scss);

const LANG_LABEL: Record<string, string> = {
  php: "PHP",
  "php-template": "PHP + HTML",
  javascript: "JS",
  css: "CSS",
  scss: "SCSS",
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

export function CodeBlock({ file }: { file: CodeFile }) {
  const html = useMemo(
    () => hljs.highlight(file.code, { language: file.lang }).value,
    [file.code, file.lang],
  );
  const lines = useMemo(() => file.code.trim().split("\n").length, [file.code]);

  const onCopy = async () => {
    const ok = await copyText(file.code);
    toast(ok ? `${file.name} — скопирован в буфер` : "Не удалось скопировать");
  };

  return (
    <div className="overflow-hidden border-2 border-ink bg-codebg shadow-[6px_6px_0_0_rgba(18,22,28,0.18)]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-codeline bg-codebar px-4 py-2.5">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-signal" aria-hidden="true" />
          <span className="h-2.5 w-2.5 bg-accent" aria-hidden="true" />
          <span className="h-2.5 w-2.5 bg-paper-2" aria-hidden="true" />
        </span>
        <span className="font-mono text-[12px] font-medium tracking-wide text-paper">{file.name}</span>
        <span className="border border-codeline px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[#8fa3b8]">
          {LANG_LABEL[file.lang] ?? file.lang}
        </span>
        <span className="ml-auto hidden font-mono text-[11px] text-[#66738a] sm:inline">
          {lines} стр.
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="ml-auto flex cursor-pointer items-center gap-1.5 border border-codeline px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-paper transition-colors duration-150 hover:border-paper hover:bg-ink-2 sm:ml-3"
        >
          <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
            <rect x="4.5" y="4.5" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M9.5 4.5v-3h-8v8h3" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          Копировать
        </button>
      </div>
      <pre className="thin-scroll max-h-[540px] overflow-auto p-4 text-[12.5px] leading-relaxed sm:p-5 sm:text-[13px]">
        <code className="hljs font-mono" dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
