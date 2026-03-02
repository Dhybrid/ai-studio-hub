import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Send, Loader2, File, FolderOpen, Check, Circle,
  Code2, Eye, ExternalLink, Copy, Terminal, PanelRightClose, PanelRightOpen,
  MousePointer2, RefreshCw, Download, Rocket, Menu, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';

type BuildStep = 'planning' | 'generating' | 'installing' | 'building' | 'ready' | 'idle';
type ViewMode = 'preview' | 'code';

const flutterCode = `import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Welcome to My App',
              style: Theme.of(context).textTheme.headlineSmall),
            SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {},
              child: Text('Get Started'),
            ),
          ],
        ),
      ),
    );
  }
}`;

const buildSteps: { key: BuildStep; label: string }[] = [
  { key: 'planning', label: 'Planning structure...' },
  { key: 'generating', label: 'Generating files...' },
  { key: 'installing', label: 'Installing packages...' },
  { key: 'building', label: 'Building preview...' },
  { key: 'ready', label: 'Ready' },
];

const projectNames: Record<string, string> = { 'mob-1': 'Fitness Tracker', 'mob-2': 'Recipe App', new: 'New App' };

const MobileBuilder = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStep, setBuildStep] = useState<BuildStep>('ready');
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [codePanelOpen, setCodePanelOpen] = useState(false);
  const [codeTab, setCodeTab] = useState<'code' | 'files' | 'terminal'>('code');
  const [copied, setCopied] = useState(false);
  const [mobilePromptOpen, setMobilePromptOpen] = useState(false);
  const projectName = projectNames[projectId || ''] || 'New App';
  const currentStepIndex = buildSteps.findIndex((s) => s.key === buildStep);
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

  const copyCode = () => { navigator.clipboard.writeText(flutterCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const PromptPanel = () => (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {[
          { type: 'thinking', text: 'Analyzing prompt...' },
          { type: 'file', text: 'Created lib/home_screen.dart' },
          { type: 'file', text: 'Updated pubspec.yaml' },
          { type: 'success', text: 'Build complete' },
        ].map((log, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            {log.type === 'thinking' && <Loader2 className="w-3 h-3 text-accent mt-0.5 animate-spin" />}
            {log.type === 'file' && <File className="w-3 h-3 text-accent mt-0.5" />}
            {log.type === 'success' && <Check className="w-3 h-3 text-success mt-0.5" />}
            <span className={cn(log.type === 'success' ? 'text-success font-medium' : 'text-muted-foreground')}>{log.text}</span>
          </div>
        ))}
        {isBuilding && (
          <div className="mt-4 p-3 rounded-lg bg-surface border border-border">
            <div className="space-y-1.5">
              {buildSteps.map((step, idx) => (
                <div key={step.key} className="flex items-center gap-2 text-xs">
                  {idx < currentStepIndex ? <Check className="w-3 h-3 text-success" /> : idx === currentStepIndex ? <Loader2 className="w-3 h-3 text-accent animate-spin" /> : <Circle className="w-3 h-3 text-muted-foreground/30" />}
                  <span className={cn(idx <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground/50')}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="p-3 border-t border-border">
        <div className="flex items-end gap-2 bg-surface rounded-xl border border-border p-2">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); }}} className="flex-1 bg-transparent border-none outline-none resize-none text-sm py-2 px-1 text-foreground placeholder:text-muted-foreground max-h-32" placeholder="Describe the app..." rows={1} style={{ minHeight: '36px' }} />
          <button onClick={handleGenerate} disabled={isBuilding || !prompt.trim()} className="w-8 h-8 flex items-center justify-center rounded-lg bg-foreground text-background disabled:opacity-30">
            {isBuilding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full">
      {!isMobile && <div className="w-[320px] border-r border-border flex-shrink-0"><PromptPanel /></div>}

      {isMobile && (
        <AnimatePresence>
          {mobilePromptOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobilePromptOpen(false)} />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 right-0 h-[60vh] bg-background border-t border-border rounded-t-2xl z-50 flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-sm font-medium">AI Activity</span>
                  <button onClick={() => setMobilePromptOpen(false)}><X className="w-4 h-4" /></button>
                </div>
                <PromptPanel />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      <ResizablePanelGroup direction="horizontal" className="flex-1 min-w-0">
        <ResizablePanel defaultSize={codePanelOpen ? 55 : 100} minSize={30}>
          <div className="flex flex-col h-full">
            <div className="h-10 flex items-center justify-between px-3 border-b border-border bg-surface/50 flex-shrink-0">
              <div className="flex items-center gap-2">
                {isMobile && <button onClick={() => setMobilePromptOpen(true)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-hover text-muted-foreground"><Menu className="w-4 h-4" /></button>}
                <span className="text-xs font-medium text-foreground">{projectName}</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-surface-hover"><MousePointer2 className="w-3 h-3" /><span className="hidden sm:inline">Edit</span></button>
                <div className="flex items-center p-0.5 rounded-md bg-muted">
                  <button onClick={() => setViewMode('preview')} className={cn("flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium", viewMode === 'preview' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}><Eye className="w-3 h-3" /></button>
                  <button onClick={() => setViewMode('code')} className={cn("flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium", viewMode === 'code' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}><Code2 className="w-3 h-3" /></button>
                </div>
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-hover text-muted-foreground"><RefreshCw className="w-3.5 h-3.5" /></button>
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-hover text-muted-foreground"><Download className="w-3.5 h-3.5" /></button>
                <button className="w-7 h-7 flex items-center justify-center rounded bg-accent text-accent-foreground"><Rocket className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center bg-surface/30 overflow-auto p-4">
              {viewMode === 'preview' ? (
                <div className="w-[280px] h-[580px] bg-white rounded-[38px] border-[7px] border-foreground/10 shadow-2xl overflow-hidden relative flex-shrink-0">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[110px] h-[26px] bg-foreground/10 rounded-b-2xl z-10" />
                  <div className="h-full pt-7 flex flex-col">
                    <div className="px-4 py-2.5 border-b border-gray-100 bg-white"><h3 className="text-sm font-semibold text-gray-900 text-center">My App</h3></div>
                    <div className="flex-1 flex flex-col items-center justify-center p-5 text-center bg-white">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4"><span className="text-3xl">🚀</span></div>
                      <h4 className="text-base font-semibold text-gray-900">Welcome</h4>
                      <p className="text-xs text-gray-500 mt-1.5">Built with AI</p>
                      <button className="mt-5 px-6 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-medium">Get Started</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full overflow-auto">
                  <div className="px-4 py-2 border-b border-border text-xs text-muted-foreground font-mono flex justify-between sticky top-0 bg-background z-10">
                    <span>home_screen.dart</span>
                    <button onClick={copyCode}>{copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}</button>
                  </div>
                  <SyntaxHighlighter language="dart" style={oneDark} customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '12px' }} showLineNumbers>
                    {flutterCode}
                  </SyntaxHighlighter>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
        {codePanelOpen && !isMobile && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={45} minSize={25}>
              <div className="flex flex-col h-full bg-background border-l border-border">
                <div className="h-10 flex items-center border-b border-border px-1">
                  {(['files', 'code', 'terminal'] as const).map(t => (
                    <button key={t} onClick={() => setCodeTab(t)} className={cn("px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5", codeTab === t ? "bg-surface-active text-foreground" : "text-muted-foreground")}>
                      {t === 'files' && <FolderOpen className="w-3 h-3" />}{t === 'code' && <Code2 className="w-3 h-3" />}{t === 'terminal' && <Terminal className="w-3 h-3" />}
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-auto">
                  {codeTab === 'code' && (
                    <SyntaxHighlighter language="dart" style={oneDark} customStyle={{ margin: 0, padding: '0.75rem', background: 'transparent', fontSize: '11px' }} showLineNumbers>{flutterCode}</SyntaxHighlighter>
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

export default MobileBuilder;
