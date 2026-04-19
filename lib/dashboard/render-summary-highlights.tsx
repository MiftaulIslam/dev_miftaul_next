import type { ReactNode } from "react";

/**
 * Renders summary text with markers:
 * - `***text***` => blue/black gradient glow highlight
 * - `**text**` => white/black gradient glow highlight
 */
export function renderSummaryWithHighlights(text: string): ReactNode {
  if (!text.trim()) {
    return <span className="text-slate-500">Empty</span>;
  }

  const nodes: ReactNode[] = [];
  const re = /\*\*\*([\s\S]+?)\*\*\*|\*\*([\s\S]+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;
  let key = 0;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={`plain-${key++}`}>{text.slice(lastIndex, match.index)}</span>);
    }

    if (match[1] !== undefined) {
      nodes.push(
        <span
          key={`triple-${key++}`}
          className="scroll-highlight-token scroll-highlight-token-blue"
          style={{
            backgroundSize: "100% 100%",
            color: "#93c5fd",
            textShadow: "0 0 14px rgba(96,165,250,0.35)",
          }}
        >
          {match[1]}
        </span>,
      );
    } else if (match[2] !== undefined) {
      nodes.push(
        <span
          key={`double-${key++}`}
          className="scroll-highlight-token scroll-highlight-token-white"
          style={{
            backgroundSize: "100% 100%",
            color: "#f8fafc",
            textShadow: "0 0 12px rgba(255,255,255,0.22)",
          }}
        >
          {match[2]}
        </span>,
      );
    }

    lastIndex = re.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(<span key={`plain-${key++}`}>{text.slice(lastIndex)}</span>);
  }

  return <span className="whitespace-pre-wrap leading-relaxed text-slate-200">{nodes}</span>;
}
