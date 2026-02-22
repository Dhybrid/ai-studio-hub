import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Send, RefreshCw, Download, Rocket, ExternalLink,
  File, FolderOpen, Terminal, Check, Loader2, Circle,
  Code2, Eye, PanelRightClose, PanelRightOpen, ArrowLeft, Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

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

const terminalLogs = [
  { text: '$ npm install', type: 'command' },
  { text: 'Installing dependencies...', type: 'info' },
  { text: 'added 127 packages in 3.2s', type: 'success' },
  { text: '$ npm run build', type: 'command' },
  { text: 'Creating optimized production build...', type: 'info' },
  { text: '✓ Compiled successfully', type: 'success' },
  { text: '✓ Collecting page data', type: 'success' },
  { text: '✓ Generating static pages', type: 'success' },
  { text: 'Ready in 2.1s', type: 'success' },
];

const buildSteps: { key: BuildStep; label: string }[] = [
  { key: 'planning', label: 'Planning' },
  { key: 'generating', label: 'Generating Files' },
  { key: 'installing', label: 'Installing Dependencies' },
  { key: 'building', label: 'Building Preview' },
  { key: 'ready', label: 'Ready' },
];

const projectNames: Record<string, string> = {
  'web-1': 'SaaS Landing Page',
  'web-2': 'E-commerce Dashboard',
  'web-3': 'Portfolio Site',
  new: 'New Project',
};

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
  const projectName = projectNames[projectId || ''] || 'New Project';

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsBuilding(true);
    const steps: BuildStep[] = ['planning', 'generating', 'installing', 'building', 'ready'];
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setBuildStep(steps[i]);
        i++;
      } else {
        clearInterval(interval);
        setIsBuilding(false);
      }
    }, 1200);
  };

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(sampleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStepIndex = buildSteps.findIndex((s) => s.key === buildStep);

  return (
    <div className="flex h-full">
      {/* Left – Prompt Panel */}
      <div className="w-[300px] border-r border-border flex flex-col bg-background flex-shrink-0">
        {/* Project header */}
        <div className="px-4 py-3 border-b border-border flex-shrink-0">
          <button
            onClick={() => navigate('/web-builder')}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="w-3 h-3" /> All Projects
          </button>
          <h2 className="text-sm font-semibold text-foreground truncate">{projectName}</h2>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-[10px] text-muted-foreground">Ready · localhost:3000</span>
          </div>
        </div>

        {/* Prompt */}
        <div className="flex-1 p-3 flex flex-col overflow-hidden">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 w-full rounded-lg bg-surface border border-border p-3 text-sm text-foreground outline-none resize-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground"
            placeholder="Describe a change or feature to add..."
          />
          <button
            onClick={handleGenerate}
            disabled={isBuilding || !prompt.trim()}
            className="mt-2 w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isBuilding ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Building...</>
            ) : (
              <><Send className="w-4 h-4" /> Generate</>
            )}
          </button>
        </div>

        {/* Build Progress */}
        {buildStep !== 'idle' && (
          <div className="p-3 border-t border-border flex-shrink-0">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Build</p>
            <div className="space-y-1.5">
              {buildSteps.map((step, idx) => (
                <div key={step.key} className="flex items-center gap-2 text-xs">
                  {idx < currentStepIndex ? (
                    <Check className="w-3 h-3 text-success flex-shrink-0" />
                  ) : idx === currentStepIndex ? (
                    isBuilding ? (
                      <Loader2 className="w-3 h-3 text-accent animate-spin flex-shrink-0" />
                    ) : (
                      <Check className="w-3 h-3 text-success flex-shrink-0" />
                    )
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

        {/* Actions */}
        <div className="p-3 border-t border-border flex gap-1.5 flex-shrink-0">
          <button className="flex-1 py-2 rounded-lg border border-border text-[11px] font-medium text-foreground hover:bg-surface-hover transition-colors flex items-center justify-center gap-1">
            <RefreshCw className="w-3 h-3" /> Rebuild
          </button>
          <button className="flex-1 py-2 rounded-lg border border-border text-[11px] font-medium text-foreground hover:bg-surface-hover transition-colors flex items-center justify-center gap-1">
            <Download className="w-3 h-3" /> ZIP
          </button>
          <button className="flex-1 py-2 rounded-lg bg-accent text-accent-foreground text-[11px] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1">
            <Rocket className="w-3 h-3" /> Deploy
          </button>
        </div>
      </div>

      {/* Center + Right via ResizablePanels */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-w-0">
        {/* Preview / Code Center */}
        <ResizablePanel defaultSize={codePanelOpen ? 60 : 100} minSize={35}>
          <div className="flex flex-col h-full">
            {/* Browser chrome */}
            <div className="h-10 flex items-center justify-between px-3 border-b border-border bg-surface/50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-destructive/60" />
                  <span className="w-3 h-3 rounded-full bg-warning/60" />
                  <span className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="ml-2 px-3 py-1 rounded-md bg-background border border-border text-[11px] text-muted-foreground font-mono max-w-[200px] truncate">
                  localhost:3000
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* View toggle */}
                <div className="flex items-center p-0.5 rounded-md bg-muted mr-1">
                  <button
                    onClick={() => setViewMode('preview')}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all",
                      viewMode === 'preview' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                  <button
                    onClick={() => setViewMode('code')}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all",
                      viewMode === 'code' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Code2 className="w-3 h-3" /> Code
                  </button>
                </div>
                <button
                  onClick={() => { window.open(window.location.href, '_blank'); }}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-hover transition-colors text-muted-foreground"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCodePanelOpen(!codePanelOpen)}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-hover transition-colors text-muted-foreground"
                  title={codePanelOpen ? 'Hide code panel' : 'Show code panel'}
                >
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
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                      Build faster with AI
                    </h1>
                    <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
                      Transform your ideas into production-ready applications in minutes, not months.
                    </p>
                    <div className="mt-8 flex gap-3 justify-center">
                      <button className="px-6 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors">
                        Get Started
                      </button>
                      <button className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                        Learn More
                      </button>
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

        {/* Code/File Panel */}
        {codePanelOpen && (
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
                                  className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-hover cursor-pointer ml-4 w-full text-left transition-colors",
                                    selectedFile === child.name ? "text-accent bg-accent/5" : "text-muted-foreground"
                                  )}
                                >
                                  <File className="w-3 h-3" />
                                  <span className="text-xs">{child.name}</span>
                                </button>
                              ))}
                            </>
                          ) : (
                            <button
                              onClick={() => { setSelectedFile(item.name); setCodeTab('code'); }}
                              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-hover cursor-pointer text-muted-foreground w-full text-left"
                            >
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
                      <SyntaxHighlighter
                        language="tsx"
                        style={oneDark}
                        customStyle={{ margin: 0, padding: '0.75rem', background: 'transparent', fontSize: '11px' }}
                        showLineNumbers
                        lineNumberStyle={{ color: 'hsl(var(--muted-foreground))', opacity: 0.3, fontSize: '10px' }}
                      >
                        {sampleCode}
                      </SyntaxHighlighter>
                    </div>
                  )}
                  {codeTab === 'terminal' && (
                    <div className="p-4 font-mono text-xs space-y-1 bg-[hsl(var(--code-bg))]">
                      {terminalLogs.map((log, i) => (
                        <div
                          key={i}
                          className={cn(
                            log.type === 'command' && "text-accent font-medium",
                            log.type === 'info' && "text-muted-foreground",
                            log.type === 'success' && "text-success",
                          )}
                        >
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
