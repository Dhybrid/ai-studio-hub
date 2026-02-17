import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Square, RotateCcw, Pencil, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const CodeBlock = ({ language, children }: { language?: string; children: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden my-3 border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-code-bg border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{language || 'code'}</span>
        <button onClick={copy} className="text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
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

const sampleMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'Explain how React hooks work with a code example.',
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: '2',
    role: 'assistant',
    content: `React Hooks are functions that let you use state and other React features in functional components.

## useState

The most basic hook is \`useState\`, which lets you add state to functional components:

\`\`\`typescript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

## useEffect

\`useEffect\` lets you perform side effects in components:

\`\`\`typescript
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]); // Only re-run when count changes
\`\`\`

### Key Rules
1. Only call hooks at the **top level**
2. Only call hooks from **React functions**
3. Custom hooks must start with \`use\`

| Hook | Purpose |
|------|---------|
| useState | State management |
| useEffect | Side effects |
| useContext | Context access |
| useRef | Mutable references |`,
    timestamp: new Date(),
  },
];

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Simulate streaming
    setIsStreaming(true);
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMsg]);

    const response = "I understand your question. Let me think about this...\n\nThis is a simulated response demonstrating the streaming effect. In a production environment, this would connect to an actual AI model API.";
    let i = 0;
    const interval = setInterval(() => {
      if (i < response.length) {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            last.content = response.slice(0, i + 1);
          }
          return [...updated];
        });
        i++;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 15);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-4", msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold text-accent-foreground">AI</span>
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed",
                    msg.role === 'user'
                      ? "bg-chat-user text-foreground"
                      : "bg-transparent text-foreground"
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <div className={cn("prose prose-sm dark:prose-invert max-w-none", isStreaming && msg.id === messages[messages.length - 1]?.id && "streaming-cursor")}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const isInline = !match;
                            return isInline ? (
                              <code className="px-1.5 py-0.5 rounded bg-code-bg text-xs font-mono" {...props}>
                                {children}
                              </code>
                            ) : (
                              <CodeBlock language={match[1]}>{String(children).replace(/\n$/, '')}</CodeBlock>
                            );
                          },
                          table({ children }) {
                            return (
                              <div className="overflow-x-auto my-3">
                                <table className="min-w-full border border-border rounded-lg overflow-hidden">
                                  {children}
                                </table>
                              </div>
                            );
                          },
                          th({ children }) {
                            return <th className="px-3 py-2 bg-surface text-left text-xs font-medium text-muted-foreground border-b border-border">{children}</th>;
                          },
                          td({ children }) {
                            return <td className="px-3 py-2 text-sm border-b border-border">{children}</td>;
                          },
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-medium">JD</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {isStreaming && (
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
              </div>
              <span>Generating...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-surface rounded-2xl border border-border p-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-hover transition-colors text-muted-foreground">
              <Paperclip className="w-4 h-4" />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message COXMOX..."
              rows={1}
              className="flex-1 bg-transparent border-none outline-none resize-none text-sm py-2 px-1 text-foreground placeholder:text-muted-foreground max-h-32"
              style={{ minHeight: '36px' }}
            />
            {isStreaming ? (
              <button
                onClick={() => setIsStreaming(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-30"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground text-center mt-2">
            COXMOX can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
