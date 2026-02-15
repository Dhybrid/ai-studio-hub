import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send, RefreshCw, Download, Rocket, ExternalLink,
  ChevronRight, File, Folder, FolderOpen, Terminal,
  Check, Loader2, Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

type BuildStep = 'planning' | 'generating' | 'installing' | 'building' | 'ready' | 'idle';

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

const WebBuilder = () => {
  const [prompt, setPrompt] = useState('');
  const [buildStep, setBuildStep] = useState<BuildStep>('ready');
  const [selectedFile, setSelectedFile] = useState('Hero.tsx');
  const [codeTab, setCodeTab] = useState<'files' | 'code' | 'terminal'>('code');
  const [isBuilding, setIsBuilding] = useState(false);

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

  const currentStepIndex = buildSteps.findIndex((s) => s.key === buildStep);

  return (
    <div className="flex h-full">
      {/* Left - Prompt Panel */}
      <div className="w-[340px] border-r border-border flex flex-col bg-background flex-shrink-0">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Project</h2>
          <input
            className="mt-2 w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-foreground outline-none focus:ring-1 focus:ring-accent"
            placeholder="Project name"
            defaultValue="My Landing Page"
          />
          <input
            className="mt-2 w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-muted-foreground outline-none focus:ring-1 focus:ring-accent"
            placeholder="Description"
            defaultValue="A modern SaaS landing page"
          />
        </div>

        <div className="flex-1 p-4 flex flex-col">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 w-full rounded-lg bg-surface border border-border p-3 text-sm text-foreground outline-none resize-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground"
            placeholder="Describe the web app you want to build..."
          />
          <button
            onClick={handleGenerate}
            disabled={isBuilding}
            className="mt-3 w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isBuilding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Building...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generate
              </>
            )}
          </button>
        </div>

        {/* Build Progress */}
        {buildStep !== 'idle' && (
          <div className="p-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Build Progress</p>
            <div className="space-y-2">
              {buildSteps.map((step, idx) => (
                <div key={step.key} className="flex items-center gap-2 text-xs">
                  {idx < currentStepIndex ? (
                    <Check className="w-3.5 h-3.5 text-success" />
                  ) : idx === currentStepIndex ? (
                    isBuilding ? <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" /> : <Check className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-muted-foreground/30" />
                  )}
                  <span className={cn(
                    idx <= currentStepIndex ? "text-foreground" : "text-muted-foreground/50"
                  )}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-1 rounded-full bg-muted overflow-hidden">
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
        <div className="p-4 border-t border-border flex gap-2">
          <button className="flex-1 py-2 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-surface-hover transition-colors flex items-center justify-center gap-1.5">
            <RefreshCw className="w-3 h-3" /> Re-run
          </button>
          <button className="flex-1 py-2 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-surface-hover transition-colors flex items-center justify-center gap-1.5">
            <Download className="w-3 h-3" /> ZIP
          </button>
          <button className="flex-1 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5">
            <Rocket className="w-3 h-3" /> Deploy
          </button>
        </div>
      </div>

      {/* Center - Preview */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-10 flex items-center justify-between px-4 border-b border-border bg-surface/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-destructive/60" />
              <span className="w-3 h-3 rounded-full bg-warning/60" />
              <span className="w-3 h-3 rounded-full bg-success/60" />
            </div>
            <div className="ml-3 px-3 py-1 rounded-md bg-background border border-border text-xs text-muted-foreground font-mono">
              localhost:3000
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-hover transition-colors text-muted-foreground">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-hover transition-colors text-muted-foreground">
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-background flex items-center justify-center">
          {/* Mock Preview */}
          <div className="w-full h-full bg-background p-8 overflow-auto">
            <div className="max-w-4xl mx-auto text-center py-20">
              <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-6">
                ✨ Just shipped v2.0
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Build faster with AI
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                Transform your ideas into production-ready applications in minutes, not months.
              </p>
              <div className="mt-8 flex gap-3 justify-center">
                <button className="px-6 py-3 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity">
                  Get Started
                </button>
                <button className="px-6 py-3 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-surface-hover transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Code Panel */}
      <div className="w-[380px] border-l border-border flex flex-col bg-background flex-shrink-0">
        <div className="h-10 flex items-center border-b border-border px-1">
          {(['files', 'code', 'terminal'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setCodeTab(tab)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize",
                codeTab === tab ? "bg-surface-active text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === 'files' ? 'Files' : tab === 'code' ? 'Code' : 'Terminal'}
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
                        <FolderOpen className="w-4 h-4 text-accent" />
                        <span className="text-xs">{item.name}</span>
                      </div>
                      {item.children?.map((child) => (
                        <button
                          key={child.name}
                          onClick={() => { setSelectedFile(child.name); setCodeTab('code'); }}
                          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-hover cursor-pointer text-muted-foreground ml-4 w-full text-left"
                        >
                          <File className="w-3.5 h-3.5" />
                          <span className="text-xs">{child.name}</span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <button
                      onClick={() => { setSelectedFile(item.name); setCodeTab('code'); }}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-hover cursor-pointer text-muted-foreground w-full text-left"
                    >
                      <File className="w-3.5 h-3.5" />
                      <span className="text-xs">{item.name}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {codeTab === 'code' && (
            <div>
              <div className="px-4 py-2 border-b border-border text-xs text-muted-foreground font-mono">
                {selectedFile}
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
          {codeTab === 'terminal' && (
            <div className="p-4 font-mono text-xs space-y-1">
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
    </div>
  );
};

export default WebBuilder;
