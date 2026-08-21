import { useState } from "react";
import type { TreeNode } from "../data/files";

type Props = {
  node: TreeNode;
  depth: number;
  selectedPath: string;
  onSelect: (path: string) => void;
  expanded: Set<string>;
  toggleDir: (path: string) => void;
};

function Row({ node, depth, selectedPath, onSelect, expanded, toggleDir }: Props) {
  const isDir = node.type === "dir";
  const isOpen = expanded.has(node.path);
  const isSelected = selectedPath === node.path;

  return (
    <div>
      <button
        type="button"
        onClick={() => (isDir ? toggleDir(node.path) : onSelect(node.path))}
        aria-expanded={isDir ? isOpen : undefined}
        className={`group flex w-full cursor-pointer items-center gap-2 border-l-2 py-[7px] pr-2 text-left transition-colors duration-150 ${
          isSelected
            ? "border-accent bg-accent/10"
            : "border-transparent hover:border-line hover:bg-paper-2"
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {isDir ? (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            aria-hidden="true"
            className={`shrink-0 text-muted transition-transform duration-200 ${isOpen ? "rotate-90 text-accent" : ""}`}
          >
            <path d="M3 1l5 4-5 4" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        ) : (
          <span className="w-[10px] shrink-0" aria-hidden="true" />
        )}

        {isDir ? (
          <svg width="15" height="13" viewBox="0 0 15 13" aria-hidden="true" className="shrink-0 text-accent">
            <path
              d="M1 2.5h4.2l1.6 2H14v7H1z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="bevel"
            />
          </svg>
        ) : (
          <svg width="13" height="14" viewBox="0 0 13 14" aria-hidden="true" className="shrink-0 text-muted">
            <path d="M1.5 1h6.5l3.5 3.5V13h-10z" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 1v3.5h3.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        )}

        <span
          className={`truncate font-mono text-[12.5px] ${
            isSelected ? "font-bold text-accent-deep" : isDir ? "font-semibold text-ink" : "text-ink-2 group-hover:text-ink"
          }`}
        >
          {node.name}
        </span>
        {node.chips?.[0] && (
          <span className="ml-auto hidden shrink-0 border border-line px-1 py-px font-mono text-[9px] uppercase tracking-wider text-muted lg:inline">
            {node.chips[0]}
          </span>
        )}
      </button>

      {isDir && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <Row
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
              expanded={expanded}
              toggleDir={toggleDir}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({
  root,
  selectedPath,
  onSelect,
}: {
  root: TreeNode;
  selectedPath: string;
  onSelect: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(["karkas", "karkas/inc", "karkas/template-parts", "karkas/assets"]),
  );

  const toggleDir = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <div className="thin-scroll max-h-[420px] overflow-y-auto border-2 border-ink bg-panel lg:max-h-[560px]">
      <div className="flex items-center justify-between border-b-2 border-ink bg-ink px-3 py-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-paper">Проводник темы</span>
        <span className="font-mono text-[11px] text-paper/50">wp-content/themes/</span>
      </div>
      <div className="py-2">
        <Row
          node={root}
          depth={0}
          selectedPath={selectedPath}
          onSelect={onSelect}
          expanded={expanded}
          toggleDir={toggleDir}
        />
      </div>
    </div>
  );
}
