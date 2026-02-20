import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Send, Loader2, File, FolderOpen, Check, Circle,
  Code2, Eye, ExternalLink, ArrowLeft, Copy, Terminal, PanelRightClose, PanelRightOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

type BuildStep = 'planning' | 'generating' | 'installing' | 'building' | 'ready' | 'idle';
type ViewMode = 'preview' | 'code';

const flutterCode = `import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('My App'),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: Colors.black87,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(Icons.rocket_launch,
                size: 40, color: Colors.blue),
            ),
            SizedBox(height: 24),
            Text(
              'Welcome to My App',
              style: Theme.of(context)
                .textTheme.headlineSmall,
            ),
            SizedBox(height: 8),
            Text(
              'Built with Flutter & AI',
              style: TextStyle(color: Colors.grey),
            ),
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
  { key: 'planning', label: 'Planning' },
  { key: 'generating', label: 'Generating Files' },
  { key: 'installing', label: 'Installing Packages' },
  { key: 'building', label: 'Building Preview' },
  { key: 'ready', label: 'Ready' },
];

const projectNames: Record<string, string> = {
  'mob-1': 'Fitness Tracker',
  'mob-2': 'Recipe App',
  new: 'New App',
};

const MobileBuilder = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('flutter');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStep, setBuildStep] = useState<BuildStep>('ready');
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [codePanelOpen, setCodePanelOpen] = useState(true);
  const [codeTab, setCodeTab] = useState<'code' | 'files' | 'terminal'>('code');
  const [copied, setCopied] = useState(false);
  const projectName = projectNames[projectId || ''] || 'New App';
  const currentStepIndex = buildSteps.findIndex((s) => s.key === buildStep);

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
    navigator.clipboard.writeText(flutterCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full">
      {/* Left Panel */}
      <div className="w-[280px] border-r border-border flex flex-col bg-background flex-shrink-0">
        <div className="px-4 py-3 border-b border-border flex-shrink-0">
          <button
            onClick={() => navigate('/mobile-builder')}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="w-3 h-3" /> All Projects
          </button>
          <h2 className="text-sm font-semibold text-foreground truncate">{projectName}</h2>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-[10px] text-muted-foreground">Ready</span>
          </div>
        </div>

        <div className="p-3 border-b border-border flex-shrink-0">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Platform</label>
          <div className="grid grid-cols-3 gap-1">
            {['Flutter', 'React Native', 'Expo'].map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p.toLowerCase().replace(' ', '-'))}
                className={cn(
                  "px-1 py-2 rounded-lg text-[10px] font-medium transition-all border leading-tight",
                  platform === p.toLowerCase().replace(' ', '-')
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted-foreground hover:bg-surface-hover"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-3 flex flex-col overflow-hidden">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 w-full rounded-lg bg-surface border border-border p-3 text-sm text-foreground outline-none resize-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground"
            placeholder="Describe the mobile app..."
          />
          <button
            onClick={handleGenerate}
            disabled={isBuilding || !prompt.trim()}
            className="mt-2 w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isBuilding ? <><Loader2 className="w-4 h-4 animate-spin" /> Building...</> : <><Send className="w-4 h-4" /> Generate</>}
          </button>
        </div>

        {buildStep !== 'idle' && (
          <div className="p-3 border-t border-border flex-shrink-0">
            <div className="space-y-1.5">
              {buildSteps.map((step, idx) => (
                <div key={step.key} className="flex items-center gap-2 text-xs">
                  {idx < currentStepIndex ? <Check className="w-3 h-3 text-success flex-shrink-0" />
                    : idx === currentStepIndex ? (
                      isBuilding ? <Loader2 className="w-3 h-3 text-accent animate-spin flex-shrink-0" /> : <Check className="w-3 h-3 text-success flex-shrink-0" />
                    ) : <Circle className="w-3 h-3 text-muted-foreground/30 flex-shrink-0" />}
                  <span className={cn(idx <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground/50')}>{step.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
              <motion.div className="h-full bg-accent rounded-full" initial={{ width: 0 }} animate={{ width: `${((currentStepIndex + 1) / buildSteps.length) * 100}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>
        )}
      </div>

      {/* Center + Right via resizable */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-w-0">
        <ResizablePanel defaultSize={codePanelOpen ? 55 : 100} minSize={30}>
          <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="h-10 flex items-center justify-between px-3 border-b border-border bg-surface/50 flex-shrink-0">
              <span className="text-xs font-medium text-foreground">{projectName}</span>
              <div className="flex items-center gap-1">
                <div className="flex items-center p-0.5 rounded-md bg-muted mr-1">
                  <button
                    onClick={() => setViewMode('preview')}
                    className={cn("flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all", viewMode === 'preview' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                  >
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                  <button
                    onClick={() => setViewMode('code')}
                    className={cn("flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all", viewMode === 'code' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                  >
                    <Code2 className="w-3 h-3" /> Code
                  </button>
                </div>
                <button onClick={() => window.open(window.location.href, '_blank')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-hover transition-colors text-muted-foreground" title="Open in new tab">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setCodePanelOpen(!codePanelOpen)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-hover transition-colors text-muted-foreground">
                  {codePanelOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center bg-surface/30 overflow-auto p-4">
              {viewMode === 'preview' ? (
                /* Phone frame */
                <div className="relative flex-shrink-0">
                  <div className="w-[280px] h-[580px] bg-white rounded-[38px] border-[7px] border-foreground/10 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[110px] h-[26px] bg-foreground/10 rounded-b-2xl z-10" />
                    <div className="h-full pt-7 flex flex-col">
                      <div className="px-5 py-2 flex justify-between text-[9px] text-gray-500">
                        <span>9:41</span>
                        <div className="flex gap-1 items-center"><span>▲</span><span>🔋</span></div>
                      </div>
                      <div className="px-4 py-2.5 border-b border-gray-100 bg-white">
                        <h3 className="text-sm font-semibold text-gray-900 text-center">My App</h3>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center p-5 text-center bg-white">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                          <span className="text-3xl">🚀</span>
                        </div>
                        <h4 className="text-base font-semibold text-gray-900">Welcome to My App</h4>
                        <p className="text-xs text-gray-500 mt-1.5">Built with {platform.charAt(0).toUpperCase() + platform.slice(1).replace('-', ' ')} & AI</p>
                        <button className="mt-5 px-6 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-medium">
                          Get Started
                        </button>
                      </div>
                      <div className="px-2 py-2 border-t border-gray-100 flex justify-around bg-white">
                        {['Home', 'Search', 'Profile'].map((item) => (
                          <div key={item} className="flex flex-col items-center gap-0.5">
                            <div className="w-5 h-5 rounded bg-gray-200" />
                            <span className="text-[8px] text-gray-500">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full overflow-auto">
                  <div className="px-4 py-2 border-b border-border text-xs text-muted-foreground font-mono flex items-center justify-between sticky top-0 bg-background z-10">
                    <span>home_screen.dart</span>
                    <button onClick={copyCode} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <SyntaxHighlighter
                    language="dart"
                    style={oneDark}
                    customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '12px' }}
                    showLineNumbers
                    lineNumberStyle={{ color: 'hsl(var(--muted-foreground))', opacity: 0.3, fontSize: '11px' }}
                  >
                    {flutterCode}
                  </SyntaxHighlighter>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>

        {codePanelOpen && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={45} minSize={25} maxSize={65}>
              <div className="flex flex-col h-full bg-background border-l border-border">
                <div className="h-10 flex items-center border-b border-border px-1 flex-shrink-0">
                  {(['files', 'code', 'terminal'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setCodeTab(t)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5",
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
                    <div className="p-2">
                      {['lib', 'assets', 'test'].map((folder) => (
                        <div key={folder}>
                          <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-hover cursor-pointer text-foreground">
                            <FolderOpen className="w-3.5 h-3.5 text-accent" />
                            <span className="text-xs">{folder}</span>
                          </div>
                          {folder === 'lib' && ['main.dart', 'home_screen.dart', 'theme.dart'].map((f) => (
                            <button key={f} onClick={() => setCodeTab('code')} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-hover text-muted-foreground ml-4 w-full text-left">
                              <File className="w-3 h-3" />
                              <span className="text-xs">{f}</span>
                            </button>
                          ))}
                        </div>
                      ))}
                      <button className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-hover text-muted-foreground w-full text-left">
                        <File className="w-3 h-3" />
                        <span className="text-xs">pubspec.yaml</span>
                      </button>
                    </div>
                  )}
                  {codeTab === 'code' && (
                    <div>
                      <div className="px-3 py-2 border-b border-border text-xs text-muted-foreground font-mono flex justify-between">
                        <span>home_screen.dart</span>
                        <button onClick={copyCode} className="text-muted-foreground hover:text-foreground transition-colors">
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        language="dart"
                        style={oneDark}
                        customStyle={{ margin: 0, padding: '0.75rem', background: 'transparent', fontSize: '11px' }}
                        showLineNumbers
                        lineNumberStyle={{ color: 'hsl(var(--muted-foreground))', opacity: 0.3, fontSize: '10px' }}
                      >
                        {flutterCode}
                      </SyntaxHighlighter>
                    </div>
                  )}
                  {codeTab === 'terminal' && (
                    <div className="p-4 font-mono text-xs space-y-1 bg-[hsl(var(--code-bg))]">
                      {[
                        { text: '$ flutter pub get', type: 'command' },
                        { text: 'Running "flutter pub get" in project...', type: 'info' },
                        { text: 'Got dependencies!', type: 'success' },
                        { text: '$ flutter run', type: 'command' },
                        { text: 'Launching lib/main.dart on Chrome...', type: 'info' },
                        { text: '✓ Built build/web', type: 'success' },
                        { text: 'Ready on http://localhost:51000', type: 'success' },
                      ].map((log, i) => (
                        <div key={i} className={cn(
                          log.type === 'command' && "text-accent font-medium",
                          log.type === 'info' && "text-muted-foreground",
                          log.type === 'success' && "text-success",
                        )}>
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

export default MobileBuilder;
