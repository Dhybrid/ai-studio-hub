import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Send, RefreshCw, Download, Rocket, ExternalLink,
  File, FolderOpen, Terminal, Check, Loader2, Circle,
  Code2, Eye, PanelRightClose, PanelRightOpen, Copy, MousePointer2,
  Settings, MoreHorizontal, Menu, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';

type BuildStep = 'planning' | 'generating' | 'installing' | 'building' | 'ready' | 'idle';
type ViewMode = 'preview' | 'code';

const fileTree = [
  { name: 'app', type: 'folder', children: [
    { name: 'layout.tsx', type: 'file' },
    { name: 'page.tsx', type: 'file' },
    { name: 'globals.css', type: 'file' },
  ]},
  { name: 'components', type: 'folder', children: [
    { name: 'Header.tsx', type: 'file' },
    { name: 'Hero.tsx', type: 'file' },
    { name: 'Footer.tsx', type: 'file' },
  ]},
  { name: 'lib', type: 'folder', children: [
    { name: 'utils.ts', type: 'file' },
  ]},
  { name: 'package.json', type: 'file' },
  { name: 'tailwind.config.ts', type: 'file' },
];

const sampleCode = `import React from 'react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight">
            Build faster with AI
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Transform your ideas into production-ready 
            applications in minutes.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}`;

const buildSteps: { key: BuildStep; label: string }[] = [
  { key: 'planning', label: 'Planning structure...' },
  { key: 'generating', label: 'Generating components...' },
  { key: 'installing', label: 'Installing dependencies...' },
  { key: 'building', label: 'Building preview...' },
  { key: 'ready', label: 'Ready' },
];

const projectNames: Record<string, string> = {
  'web-1': 'SaaS Landing Page',
  'web-2': 'E-commerce Dashboard',
  'web-3': 'Portfolio Site',
  new: 'New Project',
};

interface ActivityLog {
  id: string;
  type: 'info' | 'file' | 'success' | 'thinking';
  text: string;
  time: string;
}

const mockActivity: ActivityLog[] = [
  { id: '1', type: 'thinking', text: 'Analyzing your prompt...', time: '0s' },
  { id: '2', type: 'info', text: 'Planning component architecture', time: '1s' },
  { id: '3', type: 'file', text: 'Created app/page.tsx', time: '2s' },
  { id: '4', type: 'file', text: 'Created components/Hero.tsx', time: '3s' },
  { id: '5', type: 'file', text: 'Created components/Header.tsx', time: '3s' },
  { id: '6', type: 'file', text: 'Updated globals.css', time: '4s' },
  { id: '7', type: 'success', text: 'Build complete — preview is ready', time: '5s' },
];

const WebBuilder = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [buildStep, setBuildStep] = useState<BuildStep>('ready');
  const [selectedFile, setSelectedFile] = useState('Hero.tsx');
  const [codeTab, setCodeTab] = useState<'files' | 'code' | 'terminal'>('code');
  const [isBuilding, setIsBuilding] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [codePanelOpen, setCodePanelOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobilePromptOpen, setMobilePromptOpen] = useState(false);
  const projectName = projectNames[projectId || ''] || 'New Project';
  const isMobile = useIsMobile();

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsBuilding(true);
    const steps: BuildStep[] = ['planning', 'generating', 'installing', 'building', 'ready'];
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) { setBuildStep(steps[i]); i++; }
      else { clearInterval(interval); setIsBuilding(false); }
    }, 1200);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(sampleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStepIndex = buildSteps.findIndex((s) => s.key === buildStep);

  // Left prompt panel content
  const PromptPanel = () => (
    <div className="flex flex-col h-full bg-background">
      {/* Activity Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {mockActivity.map((log) => (
          <div key={log.id} className="flex items-start gap-2 text-xs">
            {log.type === 'thinking' && <Loader2 className="w-3 h-3 text-accent mt-0.5 flex-shrink-0 animate-spin" />}
            {log.type === 'info' && <Circle className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />}
            {log.type === 'file' && <File className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />}
            {log.type === 'success' && <Check className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />}
            <span className={cn(
              "flex-1",
              log.type === 'success' ? 'text-success font-medium' : 'text-muted-foreground'
            )}>{log.text}</span>
          </div>
        ))}

        {/* Build progress */}
        {isBuilding && buildStep !== 'idle' && (
          <div className="mt-4 p-3 rounded-lg bg-surface border border-border">
            <div className="space-y-1.5">
              {buildSteps.map((step, idx) => (
                <div key={step.key} className="flex items-center gap-2 text-xs">
                  {idx < currentStepIndex ? (
                    <Check className="w-3 h-3 text-success flex-shrink-0" />
                  ) : idx === currentStepIndex ? (
                    <Loader2 className="w-3 h-3 text-accent animate-spin flex-shrink-0" />
                  ) : (
                    <Circle className="w-3 h-3 text-muted-foreground/30 flex-shrink-0" />
                  )}
                  <span className={cn(idx <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground/50')}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStepIndex + 1) / buildSteps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Prompt Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-end gap-2 bg-surface rounded-xl border border-border p-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); }
            }}
            className="flex-1 bg-transparent border-none outline-none resize-none text-sm py-2 px-1 text-foreground placeholder:text-muted-foreground max-h-32"
            placeholder="Describe a change or feature..."
            rows={1}
            style={{ minHeight: '36px' }}
          />
          {isBuilding ? (
            <button
              onClick={() => setIsBuilding(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-destructive text-destructive-foreground"
            >
              <Circle className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-foreground text-background hover:opacity-90 disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Left Panel - Prompt & Activity (hidden on mobile, toggled) */}
      {!isMobile && (
        <div className="w-[320px] border-r border-border flex-shrink-0 flex flex-col">
          <PromptPanel />
        </div>
      )}

      {/* Mobile prompt sheet */}
      {isMobile && (
        <AnimatePresence>
          {mobilePromptOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setMobilePromptOpen(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="fixed bottom-0 left-0 right-0 h-[60vh] bg-background border-t border-border rounded-t-2xl z-50 flex flex-col"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-sm font-medium text-foreground">AI Activity</span>
                  <button onClick={() => setMobilePromptOpen(false)}><X className="w-4 h-4" /></button>
                </div>
                <PromptPanel />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      {/* Right - Preview */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-w-0">
        <ResizablePanel defaultSize={codePanelOpen ? 60 : 100} minSize={35}>
          <div className="flex flex-col h-full">
            {/* Browser chrome / toolbar */}
            <div className="h-10 flex items-center justify-between px-3 border-b border-border bg-surface/50 flex-shrink-0">
              <div className="flex items-center gap-2">
                {isMobile && (
                  <button onClick={() => setMobilePromptOpen(true)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-hover text-muted-foreground">
                    <Menu className="w-4 h-4" />
                  </button>
                )}
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-destructive/60" />
                  <span className="w-3 h-3 rounded-full bg-warning/60" />
                  <span className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="ml-2 px-3 py-1 rounded-md bg-background border border-border text-[11px] text-muted-foreground font-mono max-w-[160px] truncate hidden sm:block">
                  localhost:3000
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Visual Edit */}
                <button className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all" title="Visual Edit">
                  <MousePointer2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                {/* View toggle */}
                <div className="flex items-center p-0.5 rounded-md bg-muted">
                  <button
                    onClick={() => setViewMode('preview')}
                    className={cn("flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all", viewMode === 'preview' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                  >
                    <Eye className="w-3 h-3" /> <span className="hidden sm:inline">Preview</span>
                  </button>
                  <button
                    onClick={() => setViewMode('code')}
                    className={cn("flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all", viewMode === 'code' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                  >
                    <Code2 className="w-3 h-3" /> <span className="hidden sm:inline">Code</span>
                  </button>
                </div>
                {/* Action icons */}
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-hover transition-colors text-muted-foreground" title="Refresh">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-hover transition-colors text-muted-foreground" title="Download ZIP">
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded bg-accent text-accent-foreground hover:opacity-90 transition-opacity" title="Deploy">
                  <Rocket className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => window.open(window.location.href, '_blank')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-hover transition-colors text-muted-foreground" title="Open in new tab">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setCodePanelOpen(!codePanelOpen)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-hover transition-colors text-muted-foreground hidden md:flex" title={codePanelOpen ? 'Hide code' : 'Show code'}>
                  {codePanelOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              {viewMode === 'preview' ? (
                <div className="w-full h-full bg-white text-gray-900 p-8 overflow-auto">
                  <div className="max-w-4xl mx-auto text-center py-20">
                    <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium mb-6 border border-blue-100">
                      ✨ Just shipped v2.0
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">Build faster with AI</h1>
                    <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">Transform your ideas into production-ready applications in minutes, not months.</p>
                    <div className="mt-8 flex gap-3 justify-center flex-wrap">
                      <button className="px-6 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors">Get Started</button>
                      <button className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">Learn More</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="px-4 py-2 border-b border-border text-xs text-muted-foreground font-mono flex items-center justify-between">
                    <span>{selectedFile}</span>
                    <button onClick={copyCode} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <SyntaxHighlighter
                    language="tsx"
                    style={oneDark}
                    customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '12px' }}
                    showLineNumbers
                    lineNumberStyle={{ color: 'hsl(var(--muted-foreground))', opacity: 0.3, fontSize: '11px' }}
                  >
                    {sampleCode}
                  </SyntaxHighlighter>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>

        {/* Code Panel */}
        {codePanelOpen && !isMobile && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
              <div className="flex flex-col h-full bg-background border-l border-border">
                <div className="h-10 flex items-center border-b border-border px-1 flex-shrink-0">
                  {(['files', 'code', 'terminal'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setCodeTab(t)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize flex items-center gap-1.5",
                        codeTab === t ? "bg-surface-active text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t === 'files' && <FolderOpen className="w-3 h-3" />}
                      {t === 'code' && <Code2 className="w-3 h-3" />}
                      {t === 'terminal' && <Terminal className="w-3 h-3" />}
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-auto">
                  {codeTab === 'files' && (
                    <div className="p-2 text-sm">
                      {fileTree.map((item) => (
                        <div key={item.name}>
                          {item.type === 'folder' ? (
                            <>
                              <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-hover cursor-pointer text-foreground">
                                <FolderOpen className="w-3.5 h-3.5 text-accent" />
                                <span className="text-xs">{item.name}</span>
                              </div>
                              {item.children?.map((child) => (
                                <button
                                  key={child.name}
                                  onClick={() => { setSelectedFile(child.name); setCodeTab('code'); }}
                                  className={cn("flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-hover cursor-pointer ml-4 w-full text-left transition-colors", selectedFile === child.name ? "text-accent bg-accent/5" : "text-muted-foreground")}
                                >
                                  <File className="w-3 h-3" />
                                  <span className="text-xs">{child.name}</span>
                                </button>
                              ))}
                            </>
                          ) : (
                            <button onClick={() => { setSelectedFile(item.name); setCodeTab('code'); }} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-hover cursor-pointer text-muted-foreground w-full text-left">
                              <File className="w-3 h-3" />
                              <span className="text-xs">{item.name}</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {codeTab === 'code' && (
                    <div>
                      <div className="px-3 py-2 border-b border-border text-xs text-muted-foreground font-mono flex items-center justify-between">
                        <span>{selectedFile}</span>
                        <button onClick={copyCode} className="text-muted-foreground hover:text-foreground transition-colors">
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <SyntaxHighlighter language="tsx" style={oneDark} customStyle={{ margin: 0, padding: '0.75rem', background: 'transparent', fontSize: '11px' }} showLineNumbers lineNumberStyle={{ color: 'hsl(var(--muted-foreground))', opacity: 0.3, fontSize: '10px' }}>
                        {sampleCode}
                      </SyntaxHighlighter>
                    </div>
                  )}
                  {codeTab === 'terminal' && (
                    <div className="p-4 font-mono text-xs space-y-1 bg-[hsl(var(--code-bg))]">
                      {[
                        { text: '$ npm install', type: 'command' },
                        { text: 'added 127 packages in 3.2s', type: 'success' },
                        { text: '$ npm run build', type: 'command' },
                        { text: '✓ Compiled successfully', type: 'success' },
                        { text: 'Ready in 2.1s', type: 'success' },
                      ].map((log, i) => (
                        <div key={i} className={cn(log.type === 'command' && "text-accent font-medium", log.type === 'success' && "text-success")}>
                          {log.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default WebBuilder;
