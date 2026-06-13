import { Copy, Check, PanelRightOpen } from 'lucide-react';
import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodeSnippet } from '@/lib/markdown';

interface RichMarkdownProps {
  content: string;
  onOpenCode?: (snippet: CodeSnippet) => void;
}

function renderMathText(value: string) {
  const parts = value.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\\\[[\s\S]+?\\\]|\\\([^)]+?\\\))/g);

  return parts.map((part, index) => {
    const isBlock = part.startsWith('$$') || part.startsWith('\\[');
    const isInline = part.startsWith('$') || part.startsWith('\\(');
    if (!isBlock && !isInline) return part;

    const clean = part
      .replace(/^\$\$|\$\$$/g, '')
      .replace(/^\$|\$$/g, '')
      .replace(/^\\\[|\\\]$/g, '')
      .replace(/^\\\(|\\\)$/g, '');

    return (
      <span key={index} className={isBlock ? "block my-3 overflow-x-auto rounded-md bg-surface px-3 py-2 font-serif text-center" : "rounded bg-surface px-1.5 py-0.5 font-serif"}>
        {clean}
      </span>
    );
  });
}

const CodeBlock = ({ language, children, onOpenCode }: { language?: string; children: string; onOpenCode?: (snippet: CodeSnippet) => void }) => {
  const [copied, setCopied] = useState(false);
  const snippet = useMemo<CodeSnippet>(() => ({
    id: `${language || 'text'}-${children.length}-${children.slice(0, 12)}`,
    language: language || 'text',
    code: children,
    title: `${language || 'code'} block`,
  }), [children, language]);

  const copy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden my-3 border border-border">
      <div className="flex items-center justify-between px-3 py-2 bg-code-bg border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{language || 'code'}</span>
        <div className="flex items-center gap-1">
          {onOpenCode && (
            <button onClick={() => onOpenCode(snippet)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-surface-hover">
              <PanelRightOpen className="w-3 h-3" /> Open
            </button>
          )}
          <button onClick={copy} className="w-6 h-6 rounded hover:bg-surface-hover flex items-center justify-center text-muted-foreground hover:text-foreground">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{ margin: 0, padding: '1rem', background: 'hsl(var(--code-bg))', fontSize: '13px' }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

export default function RichMarkdown({ content, onOpenCode }: RichMarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-([A-Za-z0-9_+#.-]+)/.exec(className || '');
          const text = String(children).replace(/\n$/, '');
          return match ? (
            <CodeBlock language={match[1]} onOpenCode={onOpenCode}>{text}</CodeBlock>
          ) : (
            <code className="px-1.5 py-0.5 rounded bg-code-bg text-xs font-mono" {...props}>
              {children}
            </code>
          );
        },
        table({ children }) {
          return <div className="overflow-x-auto my-3 rounded-lg border border-border"><table className="min-w-full">{children}</table></div>;
        },
        th({ children }) {
          return <th className="px-3 py-2 bg-surface text-left text-xs font-medium text-muted-foreground border-b border-border">{children}</th>;
        },
        td({ children }) {
          return <td className="px-3 py-2 text-sm border-b border-border">{children}</td>;
        },
        p({ children }) {
          return <p>{typeof children === 'string' ? renderMathText(children) : children}</p>;
        },
        li({ children }) {
          return <li>{typeof children === 'string' ? renderMathText(children) : children}</li>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
