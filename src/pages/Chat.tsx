import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Paperclip, Square, Copy, Check, Coins, Zap,
  PanelRightClose, PanelRightOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWorkspace } from '@/hooks/useWorkspace';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens?: number;
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
    tokens: 12,
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
    tokens: 284,
  },
];

const TOKEN_LIMIT = 128000;

const ChatPage = () => {
  const { chatKey } = useWorkspace();
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [tokenPanelOpen, setTokenPanelOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  // Reset chat when chatKey changes (New Chat clicked)
  useEffect(() => {
    if (chatKey > 0) {
      setMessages([]);
      setInput('');
      setIsStreaming(false);
    }
  }, [chatKey]);

  const totalTokens = messages.reduce((sum, m) => sum + (m.tokens || 0), 0);
  const tokenPct = Math.min((totalTokens / TOKEN_LIMIT) * 100, 100);

  // Hide token panel on mobile by default
  useEffect(() => {
    if (isMobile) setTokenPanelOpen(false);
  }, [isMobile]);

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
      tokens: Math.ceil(input.trim().split(' ').length * 1.3),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      tokens: 0,
    };
    setMessages((prev) => [...prev, aiMsg]);
    const response =
      "I understand your question. Let me think about this...\n\nThis is a simulated response demonstrating the streaming effect. In a production environment, this would connect to an actual AI model API like GPT-4 or Claude.";
    let i = 0;
    const interval = setInterval(() => {
      if (i < response.length) {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            last.content = response.slice(0, i + 1);
            last.tokens = Math.ceil((i + 1) / 4);
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
    <div className="flex h-full">
      {/* Center Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {messages.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center max-w-lg"
            >
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">How can I help you today?</h2>
              <p className="text-sm text-muted-foreground mb-8">
                Ask anything — from coding to analysis, writing to data.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {[
                  { q: 'Explain React Server Components', sub: 'with code examples' },
                  { q: 'Write a Python FastAPI endpoint', sub: 'with auth middleware' },
                  { q: 'Design a PostgreSQL schema', sub: 'for a SaaS app' },
                  { q: 'Debug this TypeScript error', sub: 'step by step' },
                ].map((s) => (
                  <button
                    key={s.q}
                    onClick={() => setInput(s.q)}
                    className="p-3 rounded-xl border border-border bg-card hover:border-accent/30 hover:bg-surface-hover transition-all text-left group"
                  >
                    <p className="text-xs font-medium text-foreground group-hover:text-accent transition-colors">{s.q}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-[10px] font-bold text-accent-foreground">AI</span>
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed",
                        msg.role === 'user' ? "bg-chat-user text-foreground" : "bg-transparent text-foreground"
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <div
                          className={cn(
                            "prose prose-sm dark:prose-invert max-w-none",
                            isStreaming && msg.id === messages[messages.length - 1]?.id && "streaming-cursor"
                          )}
                        >
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
                                    <table className="min-w-full border border-border rounded-lg overflow-hidden">{children}</table>
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
                      {msg.tokens && msg.tokens > 0 && (
                        <p className="text-[9px] text-muted-foreground/40 mt-2 text-right">{msg.tokens} tokens</p>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1 text-xs font-medium">
                        JD
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isStreaming && (
                <div className="flex items-center gap-2 text-muted-foreground text-xs ml-10">
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
        )}

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 bg-surface rounded-2xl border border-border p-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover transition-colors text-muted-foreground">
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
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-30"
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

      {/* Right Token Panel - Toggleable */}
      <AnimatePresence>
        {tokenPanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 border-l border-border flex flex-col bg-sidebar overflow-hidden"
          >
            <div className="p-3 border-b border-sidebar-border">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-accent" />
                <span className="text-xs font-semibold text-foreground">Token Usage</span>
              </div>
            </div>

            <div className="flex-1 p-3 space-y-4 overflow-y-auto">
              {/* Context window */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Context Window</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{tokenPct.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      tokenPct > 80 ? "bg-destructive" : tokenPct > 50 ? "bg-warning" : "bg-accent"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${tokenPct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-muted-foreground font-mono">{totalTokens.toLocaleString()}</span>
                  <span className="text-[9px] text-muted-foreground font-mono">{TOKEN_LIMIT.toLocaleString()}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2">
                {[
                  { label: 'Input Tokens', value: messages.filter(m => m.role === 'user').reduce((s, m) => s + (m.tokens || 0), 0) },
                  { label: 'Output Tokens', value: messages.filter(m => m.role === 'assistant').reduce((s, m) => s + (m.tokens || 0), 0) },
                  { label: 'Total Messages', value: messages.length },
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                    <span className="text-[10px] font-mono font-medium text-foreground">{stat.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Per message */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Per Message</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {messages.map((m, i) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full flex-shrink-0",
                        m.role === 'user' ? "bg-muted-foreground/40" : "bg-accent"
                      )} />
                      <span className="text-[9px] text-muted-foreground truncate flex-1">
                        {m.role === 'user' ? 'You' : 'AI'} #{i + 1}
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground">{m.tokens || 0}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly usage */}
              <div className="pt-3 border-t border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">This Month</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-muted-foreground">Tokens</span>
                    <span className="text-[10px] font-mono font-medium text-foreground">1.24M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-muted-foreground">Est. Cost</span>
                    <span className="text-[10px] font-mono font-medium text-foreground">$3.72</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
