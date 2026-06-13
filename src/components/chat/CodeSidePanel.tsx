import { Copy, Check, PanelRightClose, FileCode2 } from 'lucide-react';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodeSnippet } from '@/lib/markdown';
import { cn } from '@/lib/utils';

interface CodeSidePanelProps {
  open: boolean;
  snippets: CodeSnippet[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function CodeSidePanel({ open, snippets, selectedId, onSelect, onClose }: CodeSidePanelProps) {
  const [copied, setCopied] = useState(false);
  const selected = snippets.find((snippet) => snippet.id === selectedId) || snippets[0];

  if (!open) return null;

  const copy = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <aside className="hidden md:flex w-[360px] lg:w-[420px] flex-shrink-0 border-l border-border bg-card flex-col overflow-hidden">
      <div className="h-12 px-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode2 className="w-4 h-4 text-accent flex-shrink-0" />
          <span className="text-xs font-semibold text-foreground truncate">Code Panel</span>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded hover:bg-surface-hover flex items-center justify-center text-muted-foreground" title="Close code panel">
          <PanelRightClose className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex border-b border-border overflow-x-auto px-2 py-2 gap-1">
        {snippets.map((snippet, index) => (
          <button
            key={snippet.id}
            onClick={() => onSelect(snippet.id)}
            className={cn(
              "px-2.5 py-1.5 rounded-md text-[10px] font-medium whitespace-nowrap",
              selected?.id === snippet.id ? "bg-surface-active text-foreground" : "text-muted-foreground hover:bg-surface-hover"
            )}
          >
            {snippet.language || 'code'} {index + 1}
          </button>
        ))}
      </div>

      {selected ? (
        <>
          <div className="h-10 px-3 border-b border-border flex items-center justify-between">
            <span className="text-[11px] font-mono text-muted-foreground truncate">{selected.title}</span>
            <button onClick={copy} className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] hover:bg-surface-hover text-muted-foreground">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="flex-1 overflow-auto bg-[hsl(var(--code-bg))]">
            <SyntaxHighlighter
              language={selected.language || 'text'}
              style={oneDark}
              showLineNumbers
              customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '12px', minHeight: '100%' }}
              lineNumberStyle={{ color: 'hsl(var(--muted-foreground))', opacity: 0.35, fontSize: '10px' }}
            >
              {selected.code}
            </SyntaxHighlighter>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6 text-center text-xs text-muted-foreground">
          Code blocks from assistant messages will appear here.
        </div>
      )}
    </aside>
  );
}
