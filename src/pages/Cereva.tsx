import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Send, Mic, MicOff, Volume2, Sparkles, BookOpen, Bookmark, Search,
  Plus, ChevronLeft, ChevronRight, Home, Lightbulb, Square, Copy, Check,
  Loader2, Eye, FileText, X, Menu, Play, Pause, AudioWaveform, ChevronDown,
  Layout, PanelRightClose, PanelRightOpen, CheckCircle2, Shield, Settings, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { routeAgent } from '@/lib/agentApi';
import { CodeSnippet, extractCodeSnippets } from '@/lib/markdown';
import RichMarkdown from '@/components/chat/RichMarkdown';
import CodeSidePanel from '@/components/chat/CodeSidePanel';
import OfficeSidePanel from '@/components/chat/OfficeSidePanel';
import { ThreeDGeometry } from '@/components/ui/ThreeDGeometry';

interface CerevaMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  subject?: 'science' | 'math' | 'coding';
}

const mockChats = [
  { id: 'cc1', title: 'Photosynthesis & Chloroplasts', time: '1h ago', subject: 'science' },
  { id: 'cc2', title: 'Quadratic equations curves', time: '3h ago', subject: 'math' },
  { id: 'cc3', title: 'Neural network weight nodes', time: '1d ago', subject: 'coding' },
];

const mockSaved = [
  { id: 's1', title: 'Cell division diagram', subject: 'Science' },
  { id: 's2', title: 'Trigonometry cheat sheet', subject: 'Math' },
  { id: 's3', title: 'Periodic table notes', subject: 'Chemistry' },
];

const voiceOptions = [
  { id: 'nova', name: 'Nova', accent: 'American', type: 'Female', demo: 'Hi! I\'m Nova, ready to explain complex topics.' },
  { id: 'atlas', name: 'Atlas', accent: 'British', type: 'Male', demo: 'Hello, I\'m Atlas. Let\'s outline the lesson plan.' },
  { id: 'sage', name: 'Sage', accent: 'Australian', type: 'Female', demo: 'G\'day! I\'m Sage, your AI conceptual tutor.' },
  { id: 'echo', name: 'Echo', accent: 'American', type: 'Male', demo: 'Hey there! I\'m Echo, ready to test your skills.' },
  { id: 'luna', name: 'Luna', accent: 'British', type: 'Female', demo: 'Hi! I\'m Luna, let\'s explore this diagram together.' },
  { id: 'kai', name: 'Kai', accent: 'Japanese', type: 'Male', demo: 'Hello! I\'m Kai, let\'s review code structures.' },
];

const Cereva = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<CerevaMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [voiceCallMode, setVoiceCallMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // App states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'history' | 'saved'>('history');
  const [chatSearch, setChatSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [voiceSelectorOpen, setVoiceSelectorOpen] = useState(false);
  const [playingDemo, setPlayingDemo] = useState<string | null>(null);
  
  // Interactive blackboard states
  const [showBoard, setShowBoard] = useState(true);
  const [activeDiagram, setActiveDiagram] = useState<'chloroplast' | 'math' | 'neural'>('chloroplast');
  const [highlightedFeature, setHighlightedFeature] = useState<string | null>(null);

  // Multi-step Onboarding Wizard States
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('cereva_onboarded');
  });
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    goal: '',
    style: '',
    voice: 'nova'
  });

  // Code side panels
  const [codePanelOpen, setCodePanelOpen] = useState(false);
  const [selectedCodeId, setSelectedCodeId] = useState<string | undefined>();
  
  // Office side panels
  const [officePanelOpen, setOfficePanelOpen] = useState(false);
  const [officePanelType, setOfficePanelType] = useState<'document' | 'spreadsheet' | 'presentation'>('document');
  const [officePanelTitle, setOfficePanelTitle] = useState('');
  const [officePanelContent, setOfficePanelContent] = useState<any>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const audioWaveCanvasRef = useRef<HTMLCanvasElement>(null);
  const initialPromptRun = useRef(false);
  const isMobile = useIsMobile();

  const filteredChats = mockChats.filter(c => c.title.toLowerCase().includes(chatSearch.toLowerCase()));
  const currentVoice = voiceOptions.find(v => v.id === selectedVoice)!;
  const codeSnippets = messages.flatMap((message) =>
    message.role === 'assistant' ? extractCodeSnippets(message.content) : []
  );

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }
  }, [input]);

  useEffect(() => { 
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages]);

  // Audio wave canvas animation
  useEffect(() => {
    if (!voiceCallMode) return;
    const canvas = audioWaveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = 300;
    let height = canvas.height = 100;
    let phase = 0;

    const drawWave = () => {
      ctx.clearRect(0, 0, width, height);
      phase += 0.08;
      
      const waveCount = 3;
      const step = 0.05;
      
      ctx.lineWidth = 1.5;
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        const amplitude = isRecording ? (15 - w * 3) : 2; // high wave if recording
        const colorFactor = 1 - w * 0.25;
        ctx.strokeStyle = `rgba(16, 185, 129, ${colorFactor})`;

        for (let x = 0; x < width; x++) {
          const angle = x * step + phase + w * Math.PI * 0.4;
          const y = height / 2 + Math.sin(angle) * amplitude * Math.sin(x * 0.01);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      animationId = requestAnimationFrame(drawWave);
    };

    drawWave();
    return () => cancelAnimationFrame(animationId);
  }, [voiceCallMode, isRecording]);

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || isStreaming) return;
    
    // Set diagram based on keywords in user prompt
    const lowerText = text.toLowerCase();
    let subject: 'science' | 'math' | 'coding' | undefined;
    if (lowerText.includes('photosynthesis') || lowerText.includes('leaf') || lowerText.includes('chloroplast') || lowerText.includes('dna') || lowerText.includes('cell')) {
      setActiveDiagram('chloroplast');
      subject = 'science';
    } else if (lowerText.includes('quadratic') || lowerText.includes('equation') || lowerText.includes('calculus') || lowerText.includes('math') || lowerText.includes('formula')) {
      setActiveDiagram('math');
      subject = 'math';
    } else if (lowerText.includes('neural') || lowerText.includes('network') || lowerText.includes('node') || lowerText.includes('weights') || lowerText.includes('coding') || lowerText.includes('react')) {
      setActiveDiagram('neural');
      subject = 'coding';
    }

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date(), subject }]);
    setInput('');
    setIsStreaming(true);
    
    const aiMsg: CerevaMessage = { id: assistantId, role: 'assistant', content: '', timestamp: new Date(), subject };
    setMessages(prev => [...prev, aiMsg]);

    try {
      // Allow natural routing if prompt asks for office files, otherwise guide to cereva
      const isOfficePrompt = /spreadsheet|excel|sheet|xlsx|csv|presentation|powerpoint|slide|ppt|pptx|document|word|docx/i.test(text);
      const routeHint = isOfficePrompt ? undefined : 'cereva';
      const result = await routeAgent(text, { routeHint });
      const route = result.route;
      const content = result.generated_content || {};

      let response = '';
      if (route === 'office-document') {
        response = `I have generated the document **"${result.title}"** for you. You can preview, edit, and download it in the side panel.`;
        setOfficePanelType('document');
        setOfficePanelTitle(result.title);
        setOfficePanelContent(content);
        setOfficePanelOpen(true);
        setCodePanelOpen(false);
      } else if (route === 'office-spreadsheet') {
        response = `I have generated the spreadsheet **"${result.title}"** for you. You can preview, edit, and download it in the side panel.`;
        setOfficePanelType('spreadsheet');
        setOfficePanelTitle(result.title);
        setOfficePanelContent(content);
        setOfficePanelOpen(true);
        setCodePanelOpen(false);
      } else if (route === 'office-presentation') {
        response = `I have generated the presentation **"${result.title}"** for you. You can preview, edit, and download it in the side panel.`;
        setOfficePanelType('presentation');
        setOfficePanelTitle(result.title);
        setOfficePanelContent(content);
        setOfficePanelOpen(true);
        setCodePanelOpen(false);
      } else {
        const visual = content.visual_elements || {};
        const cards = Array.isArray(visual.cards)
          ? visual.cards.map((card: any) => `- **${card.title || 'Idea'}:** ${card.desc || ''}`).join('\n')
          : '';
        const equation = visual.equation ? `\n\n## Formula\n\n$$${visual.equation}$$` : '';
        const markdown = String(content.markdown || content.reply || 'Cereva could not build a lesson for this prompt.');
        response = `${markdown}${equation}${cards ? `\n\n## Visual Notes\n${cards}` : ''}`;
        setOfficePanelOpen(false);
      }
      
      setMessages(prev => prev.map(message => message.id === assistantId ? { ...message, content: response } : message));
      
      if (route === 'cereva') {
        const snippets = extractCodeSnippets(response);
        if (snippets.length) {
          setSelectedCodeId(snippets[0].id);
          setCodePanelOpen(true);
        }
      }
    } catch {
      const errorText = 'Cereva could not reach the backend agent. Start the backend on `http://localhost:8000`, then ask again.';
      setMessages(prev => prev.map(message => message.id === assistantId ? { ...message, content: errorText } : message));
    } finally {
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    const routedPrompt = searchParams.get('prompt') || '';
    if (!routedPrompt.trim() || initialPromptRun.current) return;
    initialPromptRun.current = true;
    setMessages([]);
    handleSend(routedPrompt);
  }, [searchParams]);

  const handleKeyDown = (e: React.KeyboardEvent) => { 
    if (e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault(); 
      handleSend(); 
    } 
  };

  const openCode = (snippet: CodeSnippet) => {
    const existing = codeSnippets.find((item) => item.language === snippet.language && item.code === snippet.code);
    setSelectedCodeId(existing?.id || snippet.id);
    setCodePanelOpen(true);
  };

  const playVoiceDemo = (voiceId: string) => {
    setPlayingDemo(voiceId);
    setTimeout(() => setPlayingDemo(null), 2500);
  };

  const completeOnboarding = () => {
    localStorage.setItem('cereva_onboarded', 'true');
    setShowOnboarding(false);
    // Add introductory message from the selected voice
    const introductoryText = `Hello! I am your AI classroom tutor. I see we onboarded under the goal of **${onboardingData.goal}** with a **${onboardingData.style}** cognitive focus. I have loaded my interactive visual blackboard on the right. Ask me any question, and let's explore it together!`;
    setMessages([
      { id: 'intro', role: 'assistant', content: introductoryText, timestamp: new Date() }
    ]);
  };

  const selectHistoryLesson = (lesson: typeof mockChats[0]) => {
    setActiveDiagram(lesson.subject as any);
    setMessages([
      { 
        id: `h-${lesson.id}`, 
        role: 'assistant', 
        content: `# Lesson Review: ${lesson.title}\n\nWe are reviewing the workspace structure for **${lesson.title}**. The interactive visual board on the right has loaded the detailed model nodes. Ask me to explain any element in detail.`,
        timestamp: new Date()
      }
    ]);
    if (isMobile) setMobileMenuOpen(false);
  };

  // Onboarding Wizard Overlay
  if (showOnboarding) {
    return (
      <div className="fixed inset-0 z-50 bg-[#070708] flex items-center justify-center p-4 selection:bg-emerald-500/30 overflow-y-auto">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[450px] pointer-events-none opacity-40">
          <ThreeDGeometry mode="sphere" color="#10b981" opacity={0.3} interactive={true} />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl bg-[#0b0b0d]/90 border border-white/5 shadow-2xl rounded-2xl p-6 sm:p-8 backdrop-blur-xl z-10 relative overflow-hidden"
        >
          {/* Progress step dots */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Cereva Academy Setup</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map(s => (
                <div 
                  key={s} 
                  className={cn("w-2 h-2 rounded-full transition-all duration-350", onboardingStep === s ? "bg-emerald-400 w-5" : "bg-white/10")} 
                />
              ))}
            </div>
          </div>

          {/* Step 1: Goal */}
          {onboardingStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 className="text-lg font-bold text-white mb-2">What is your primary learning goal?</h3>
              <p className="text-xs text-muted-foreground mb-6 font-light">Cereva will structure its visual blackboard and equations around your course direction.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {[
                  { id: 'Computer Science', title: 'Computer Science & WASM', desc: 'Algorithm architectures, coding runtimes, and databases.' },
                  { id: 'Mathematics', title: 'Mathematics & Calculus', desc: 'Equations, vector curves, derivatives, and charts.' },
                  { id: 'Biomedical Science', title: 'Biomedical Science & Chemistry', desc: 'Cell processes, chloroplasts, molecules, and DNA.' },
                  { id: 'Global History', title: 'Global History & Literature', desc: 'Chronologies, structural timelines, and critiques.' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setOnboardingData(prev => ({ ...prev, goal: opt.id }))}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all hover:bg-white/5",
                      onboardingData.goal === opt.id ? "border-emerald-500 bg-emerald-500/5" : "border-white/5 bg-[#0e0e11]/60"
                    )}
                  >
                    <h4 className="text-xs font-bold text-white mb-1">{opt.title}</h4>
                    <p className="text-[10px] text-muted-foreground font-light leading-normal">{opt.desc}</p>
                  </button>
                ))}
              </div>
              
              <button
                disabled={!onboardingData.goal}
                onClick={() => setOnboardingStep(2)}
                className="w-full py-3 rounded-xl bg-white hover:bg-neutral-100 text-black text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-20 transition-all"
              >
                Continue <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {/* Step 2: Learning Style */}
          {onboardingStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 className="text-lg font-bold text-white mb-2">Choose your cognitive teaching style:</h3>
              <p className="text-xs text-muted-foreground mb-6 font-light">Customize how details are displayed inside your sandboxed lessons.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {[
                  { id: 'Visual', title: 'Visual Diagrams', desc: 'Prioritize interactive whiteboard drawings and graphs.' },
                  { id: 'Auditory', title: 'Auditory Dialogs', desc: 'Use voice communication and verbal descriptions.' },
                  { id: 'Conceptual', title: 'Conceptual Guides', desc: 'Deep-dive theoretical markdown tables and logs.' },
                  { id: 'Hands-on', title: 'Practical Sandboxes', desc: 'Provide code sandboxes, steps, and formulas.' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setOnboardingData(prev => ({ ...prev, style: opt.id }))}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all hover:bg-white/5",
                      onboardingData.style === opt.id ? "border-emerald-500 bg-emerald-500/5" : "border-white/5 bg-[#0e0e11]/60"
                    )}
                  >
                    <h4 className="text-xs font-bold text-white mb-1">{opt.title}</h4>
                    <p className="text-[10px] text-muted-foreground font-light leading-normal">{opt.desc}</p>
                  </button>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setOnboardingStep(1)}
                  className="px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white font-semibold"
                >
                  Back
                </button>
                <button
                  disabled={!onboardingData.style}
                  onClick={() => setOnboardingStep(3)}
                  className="flex-1 py-3 rounded-xl bg-white hover:bg-neutral-100 text-black text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-20 transition-all"
                >
                  Continue <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Tutor voice */}
          {onboardingStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 className="text-lg font-bold text-white mb-2">Select your AI Tutor voice:</h3>
              <p className="text-xs text-muted-foreground mb-6 font-light">Choose your conversational vocal agent and test their acoustics.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-8 max-h-[160px] overflow-y-auto pr-1">
                {voiceOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setOnboardingData(prev => ({ ...prev, voice: opt.id }))}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all hover:bg-white/5 relative group/voice",
                      onboardingData.voice === opt.id ? "border-emerald-500 bg-emerald-500/5" : "border-white/5 bg-[#0e0e11]/60"
                    )}
                  >
                    <p className="text-xs font-bold text-white">{opt.name}</p>
                    <p className="text-[8px] text-muted-foreground mt-0.5">{opt.accent}</p>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playVoiceDemo(opt.id);
                      }}
                      className="absolute right-2 top-2 w-5 h-5 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white"
                    >
                      {playingDemo === opt.id ? <Pause className="w-2.5 h-2.5 text-emerald-400" /> : <Play className="w-2.5 h-2.5 ml-0.5" />}
                    </button>
                  </button>
                ))}
              </div>

              {playingDemo && (
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] text-emerald-400 mb-6 italic animate-pulse">
                  "{voiceOptions.find(v => v.id === playingDemo)?.demo}"
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setOnboardingStep(2)}
                  className="px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={completeOnboarding}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-transform"
                >
                  Begin Learning <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

        </motion.div>
      </div>
    );
  }

  // Voice Call Overlay Mode
  if (voiceCallMode) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#070708] text-white">
        {/* Left: Blackboard panel */}
        <div className="flex-1 flex flex-col bg-[#070708] relative">
          <div className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-[#08080a]/60 backdrop-blur-md flex-shrink-0 z-10">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Blackboard</span>
            <button 
              onClick={() => setVoiceCallMode(false)}
              className="text-xs font-semibold text-emerald-400 hover:underline"
            >
              Exit Voice Screen
            </button>
          </div>
          <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
            {activeDiagram === 'chloroplast' && <ChloroplastDiagram highlightedFeature={highlightedFeature} setHighlightedFeature={setHighlightedFeature} />}
            {activeDiagram === 'math' && <MathPlotDiagram />}
            {activeDiagram === 'neural' && <NeuralNetworkDiagram />}
          </div>
        </div>

        {/* Right: Audio Wave call dashboard */}
        <div className="w-[320px] border-l border-white/5 bg-[#0b0b0d] flex flex-col items-center justify-between py-12 px-6">
          <div className="text-center w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider mb-6">
              Vocal Session
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{currentVoice.name} Tutor</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">{currentVoice.accent} Accent · {currentVoice.type}</p>
          </div>

          {/* Canvas waves */}
          <div className="w-full flex justify-center py-6">
            <canvas ref={audioWaveCanvasRef} className="w-full max-w-[260px] h-[80px]" />
          </div>

          <div className="text-center w-full space-y-8">
            <div>
              <p className="text-xs font-bold text-white">
                {isRecording ? 'Capturing Audio...' : 'Voice Stream Idle'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px] mx-auto font-light leading-relaxed">
                {isRecording ? 'Speak clearly. Cereva translates mouth coordinates in real-time.' : 'Press the green button to open voice streaming.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                  isRecording 
                    ? "bg-red-500 text-white scale-105 shadow-red-500/20" 
                    : "bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20"
                )}
              >
                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <button
                onClick={() => { setVoiceCallMode(false); setIsRecording(false); }}
                className="w-14 h-14 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cereva custom application sidebar
  const CerevaSidebarInner = () => (
    <div className="flex flex-col h-full bg-[#0b0b0d] text-white">
      <div className="flex items-center gap-3 px-4 h-14 border-b border-white/5 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <p className="text-xs font-bold text-white tracking-widest uppercase">CEREVA</p>
          <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">AI Tutor App</p>
        </div>
        {isMobile && (
          <button onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="px-3 pt-4 space-y-2 flex-shrink-0">
        <button 
          onClick={() => {
            setMessages([]);
            setInput('');
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-white/10 hover:border-emerald-500/30 text-xs font-semibold text-muted-foreground hover:text-white hover:bg-emerald-500/5 transition-all"
        >
          <Plus className="w-4 h-4 text-emerald-400" /> New Lesson
        </button>
      </div>

      <div className="flex px-3 mt-4 gap-1 flex-shrink-0">
        {(['history', 'saved'] as const).map(t => (
          <button 
            key={t} 
            onClick={() => setSidebarTab(t)} 
            className={cn(
              "flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all", 
              sidebarTab === t ? "bg-white/5 text-white" : "text-muted-foreground hover:text-white"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Sidebar search / list */}
      <div className="flex-1 flex flex-col py-3 px-2 overflow-hidden min-h-0">
        {sidebarTab === 'history' && (
          <>
            <div className="px-2 mb-2 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input 
                  value={chatSearch} 
                  onChange={(e) => setChatSearch(e.target.value)} 
                  placeholder="Search lessons..." 
                  className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-[#0e0e11] border border-white/5 text-[10px] text-white outline-none placeholder:text-muted-foreground focus:border-emerald-500/20 transition-colors" 
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {filteredChats.map((chat) => (
                <button 
                  key={chat.id} 
                  onClick={() => selectHistoryLesson(chat)}
                  className="w-full flex flex-col gap-0.5 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-white/5 border-l border-transparent hover:border-emerald-500"
                >
                  <p className="text-[11px] text-white font-medium truncate">{chat.title}</p>
                  <div className="flex justify-between items-center text-[9px] text-muted-foreground">
                    <span className="capitalize">{chat.subject}</span>
                    <span>{chat.time}</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
        {sidebarTab === 'saved' && (
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {mockSaved.map((lesson) => (
              <button key={lesson.id} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors hover:bg-white/5">
                <Bookmark className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white font-medium truncate">{lesson.title}</p>
                  <p className="text-[9px] text-muted-foreground/60">{lesson.subject}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-white/5 p-3 flex flex-col gap-2 bg-[#08080a] flex-shrink-0">
        <button 
          onClick={() => navigate('/')}
          className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors border border-white/5"
        >
          <Home className="w-3 h-3 text-blue-400" /> Exit to Cereva
        </button>
        <div className="flex items-center gap-3 mt-1 px-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">JD</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Ikiogha</p>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">Student</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#070708] text-white relative">
      {/* Background visual meshes */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.008)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.008)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      {/* Voice selector popup */}
      <VoiceSelectorPopup
        open={voiceSelectorOpen}
        onClose={() => setVoiceSelectorOpen(false)}
        voices={voiceOptions}
        selectedVoice={selectedVoice}
        onSelectVoice={setSelectedVoice}
        playingDemo={playingDemo}
        onPlayDemo={playVoiceDemo}
      />

      {/* Sidebar */}
      {isMobile ? (
        <>
          <button 
            onClick={() => setMobileMenuOpen(true)} 
            className="fixed top-3 left-3 z-40 w-9 h-9 rounded-lg bg-[#0e0e11] border border-white/5 flex items-center justify-center text-white"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div
            className={cn("fixed inset-0 bg-black/60 z-40 transition-opacity duration-200", mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className={cn("fixed left-0 top-0 bottom-0 w-[260px] z-50 flex flex-col border-r border-white/5 overflow-hidden transition-transform duration-250 ease-out", mobileMenuOpen ? "translate-x-0" : "-translate-x-full")}>
            <CerevaSidebarInner />
          </aside>
        </>
      ) : (
        <aside
          className="h-screen flex-shrink-0 flex flex-col border-r border-white/5 overflow-hidden relative transition-[width] duration-200 ease-in-out z-30"
          style={{ width: sidebarCollapsed ? 64 : 260 }}
        >
          {!sidebarCollapsed && <CerevaSidebarInner />}
          {sidebarCollapsed && (
            <div className="flex flex-col items-center py-4 gap-3 bg-[#0b0b0d] h-full justify-between">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white"
                title="Exit to Cereva"
              >
                <Home className="w-4 h-4 text-blue-400" />
              </button>
            </div>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#0b0b0d] border border-white/5 flex items-center justify-center hover:bg-white/5 z-40 text-muted-foreground" 
            style={{ right: -10 }}
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </aside>
      )}

      {/* Main visual interface panel (Split screen: chat + whiteboard blackboard) */}
      <div className="flex-1 flex min-w-0 overflow-hidden relative z-10">
        
        {/* Left Side: Lesson Chat */}
        <div className="flex-1 flex flex-col min-w-0 h-full border-r border-white/5">
          <header className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-white/5 bg-[#08080a]/80 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-2">
              {isMobile && <div className="w-9" />}
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-xs font-bold text-white uppercase tracking-widest">Cereva Lesson Stream</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {codeSnippets.length > 0 && (
                <button
                  onClick={() => setCodePanelOpen(!codePanelOpen)}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 text-xs text-muted-foreground hover:text-white hover:bg-white/5"
                >
                  {codePanelOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
                  Code
                </button>
              )}
              {/* Voice Mode Call Button */}
              <button
                onClick={() => setVoiceCallMode(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-400 transition-colors text-xs font-bold"
              >
                <AudioWaveform className="w-3.5 h-3.5" />
                <span>Voice Call</span>
              </button>
              {/* Show/Hide Board toggle */}
              <button
                onClick={() => setShowBoard(!showBoard)}
                className={cn(
                  "hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border",
                  showBoard 
                    ? "bg-white/5 text-white border-white/10" 
                    : "text-muted-foreground border-transparent hover:text-white hover:bg-white/5"
                )}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Board</span>
              </button>
            </div>
          </header>

          {/* Lessons Message Stream */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-md">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                      <Lightbulb className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-extrabold text-white mb-2 uppercase tracking-wide">Enter Learning Subject</h2>
                    <p className="text-xs text-muted-foreground mb-8 font-light leading-relaxed">
                      Cereva maps conceptual node graphs and splits calculations onto the visual board.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                      {[
                        { q: 'How does chloroplast photosynthesis work?', sub: 'molecular biology' },
                        { q: 'Explain quadratic equation curve formulas', sub: 'coordinate geometry' },
                        { q: 'How do neural network layers run weights?', sub: 'machine learning' },
                      ].map((s) => (
                        <button 
                          key={s.q} 
                          onClick={() => setInput(s.q)} 
                          className="p-3.5 rounded-xl border border-white/5 bg-[#0b0b0d]/50 hover:bg-[#0b0b0d] hover:border-emerald-500/25 transition-all text-left group"
                        >
                          <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">{s.q}</p>
                          <p className="text-[9px] text-muted-foreground mt-0.5 font-light capitalize">{s.sub}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div 
                      key={msg.id} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className={cn("flex gap-4", msg.role === 'user' ? 'justify-end' : 'justify-start')}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={cn("rounded-2xl px-5 py-4 max-w-[85%] text-sm leading-relaxed border", msg.role === 'user' ? "bg-white/5 border-white/10 text-white shadow-sm" : "bg-transparent border-transparent text-white")}>
                        {msg.role === 'assistant' ? (
                          <div className={cn("prose prose-invert prose-sm max-w-none prose-headings:font-bold prose-code:font-mono", isStreaming && msg.id === messages[messages.length - 1]?.id && "streaming-cursor")}>
                            <RichMarkdown content={msg.content} onOpenCode={openCode} />
                          </div>
                        ) : (
                          <p className="font-light">{msg.content}</p>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-white shadow-md">
                          JD
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              {isStreaming && (
                <div className="flex items-center gap-2.5 text-muted-foreground text-xs ml-12">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 typing-dot" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 typing-dot" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 typing-dot" />
                  </div>
                  <span className="font-light">Cereva is drafting lesson...</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Prompt input bar */}
          <div className="border-t border-white/5 p-4 bg-[#070708]/80 backdrop-blur-md">
            <div className="max-w-3xl mx-auto">
              <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-white/5 focus-within:from-emerald-500/50 focus-within:to-emerald-600/10 transition-all duration-500">
                <div className="flex items-end gap-2 bg-[#0b0b0d]/90 backdrop-blur-xl rounded-[15px] p-2.5">
                  <button
                    onClick={() => setVoiceCallMode(true)}
                    className="w-[3rem] h-[2.5rem] flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-emerald-400"
                    title="Audio call"
                  >
                    <AudioWaveform className="w-4 h-4" />
                  </button>
                  
                  <textarea
                    ref={textareaRef}
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyDown={handleKeyDown} 
                    placeholder="Ask Cereva to teach a concept..." 
                    rows={1} 
                    className="flex-1 bg-transparent border-none outline-none resize-none text-sm py-2 px-2 text-white placeholder:text-muted-foreground max-h-32 font-light" 
                    style={{ minHeight: '2rem' }} 
                  />
                  
                  {isStreaming ? (
                    <button onClick={() => setIsStreaming(false)} className="w-9.5 h-9.5 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                      <Square className="w-3.5 h-3.5 fill-red-500" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleSend()} 
                      disabled={!input.trim()} 
                      className=" w-[3rem] h-[2.5rem] rounded-[5rem] flex items-center justify-center disabled:opacity-20 bg-white text-black"
                      // className="w-20 h-20 items-center justify-center rounded-xl transition-all disabled:opacity-20 bg-white text-black hover:scale-105 active:scale-95"
                      style={{
                        boxShadow: input.trim() ? '0 0 15px rgba(153, 150, 150, 0.2)' : 'none'
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Blackboard Panel ("Show Board") */}
        <AnimatePresence>
          {showBoard && !isMobile && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '48%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="h-full flex flex-col bg-[#08080a] relative overflow-hidden"
            >
              {/* Blackboard Header */}
              <div className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-[#09090b] flex-shrink-0 z-10">
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Visual Blackboard</span>
                </div>
                
                {/* Mode indicators */}
                <div className="flex gap-2">
                  {[
                    { id: 'chloroplast' as const, label: 'Science' },
                    { id: 'math' as const, label: 'Math' },
                    { id: 'neural' as const, label: 'Neural' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveDiagram(tab.id)}
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors",
                        activeDiagram === tab.id ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-muted-foreground hover:text-white"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diagrams Screen Canvas */}
              <div className="flex-1 p-6 flex items-center justify-center overflow-y-auto bg-[#070708]/40">
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {activeDiagram === 'chloroplast' && (
                    <ChloroplastDiagram highlightedFeature={highlightedFeature} setHighlightedFeature={setHighlightedFeature} />
                  )}
                  {activeDiagram === 'math' && (
                    <MathPlotDiagram />
                  )}
                  {activeDiagram === 'neural' && (
                    <NeuralNetworkDiagram />
                  )}
                </div>
              </div>

              {/* Sidebar detail popup inside blackboard */}
              <div className="p-4 border-t border-white/5 bg-[#09090b] flex-shrink-0 text-xs text-muted-foreground font-light leading-relaxed">
                <div className="flex items-center gap-1.5 text-white font-bold mb-1.5 uppercase tracking-wide">
                  <Info className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Blackboard Annotation</span>
                </div>
                {activeDiagram === 'chloroplast' && (
                  <p>Chloroplast chloroplasts convert light energy into ATP. Highlighting thylakoid membranes displays pigment absorption nodes.</p>
                )}
                {activeDiagram === 'math' && (
                  <p>Mathematical plots indicate the quadratic curve $y = x^2 - 4x + 3$ crossing the x-axis roots at points (1,0) and (3,0).</p>
                )}
                {activeDiagram === 'neural' && (
                  <p>Neural node parameters feed forward output weights. Highlight connects activation paths from Input to Hidden vectors.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Code Sidebar Panel */}
        <CodeSidePanel
          open={codePanelOpen}
          snippets={codeSnippets}
          selectedId={selectedCodeId}
          onSelect={setSelectedCodeId}
          onClose={() => setCodePanelOpen(false)}
        />

        {/* Office Sidebar Panel */}
        <OfficeSidePanel
          open={officePanelOpen}
          onClose={() => setOfficePanelOpen(false)}
          type={officePanelType}
          title={officePanelTitle}
          content={officePanelContent}
        />
      </div>
    </div>
  );
};

// ==========================================
// HIGH FIDELITY INTERACTIVE SVG DIAGRAMS
// ==========================================

// 1. Biological Chloroplast Cell Diagram
const ChloroplastDiagram = ({ highlightedFeature, setHighlightedFeature }: {
  highlightedFeature: string | null;
  setHighlightedFeature: (id: string | null) => void;
}) => (
  <div className="w-full max-w-[320px] flex flex-col items-center gap-5">
    <svg viewBox="0 0 240 180" className="w-full h-auto bg-[#0b0b0d] rounded-2xl border border-white/5 p-4 shadow-xl">
      {/* Outer Chloroplast membrane envelope */}
      <ellipse cx="120" cy="90" rx="100" ry="70" fill="#0c1912" stroke="#10b981" strokeWidth="2" />
      <ellipse cx="120" cy="90" rx="94" ry="64" fill="transparent" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
      
      {/* Thylakoids stacks (Grana) */}
      {/* Stack 1 */}
      <g 
        className="cursor-pointer group"
        onClick={() => setHighlightedFeature(highlightedFeature === 'thylakoid' ? null : 'thylakoid')}
      >
        <rect x="60" y="80" width="22" height="6" rx="1.5" fill={highlightedFeature === 'thylakoid' ? '#10b981' : '#1b3b2b'} stroke="#10b981" strokeWidth="1" />
        <rect x="60" y="72" width="22" height="6" rx="1.5" fill={highlightedFeature === 'thylakoid' ? '#10b981' : '#1b3b2b'} stroke="#10b981" strokeWidth="1" />
        <rect x="60" y="64" width="22" height="6" rx="1.5" fill={highlightedFeature === 'thylakoid' ? '#10b981' : '#1b3b2b'} stroke="#10b981" strokeWidth="1" />
        <text x="71" y="55" fill="#10b981" fontSize="8" textAnchor="middle" className="opacity-0 group-hover:opacity-100 transition-opacity font-mono">Grana</text>
      </g>

      {/* Stack 2 */}
      <g 
        className="cursor-pointer group"
        onClick={() => setHighlightedFeature(highlightedFeature === 'stroma' ? null : 'stroma')}
      >
        <rect x="140" y="100" width="22" height="6" rx="1.5" fill={highlightedFeature === 'stroma' ? '#10b981' : '#1b3b2b'} stroke="#10b981" strokeWidth="1" />
        <rect x="140" y="92" width="22" height="6" rx="1.5" fill={highlightedFeature === 'stroma' ? '#10b981' : '#1b3b2b'} stroke="#10b981" strokeWidth="1" />
        <rect x="140" y="84" width="22" height="6" rx="1.5" fill={highlightedFeature === 'stroma' ? '#10b981' : '#1b3b2b'} stroke="#10b981" strokeWidth="1" />
        <rect x="140" y="76" width="22" height="6" rx="1.5" fill={highlightedFeature === 'stroma' ? '#10b981' : '#1b3b2b'} stroke="#10b981" strokeWidth="1" />
      </g>

      {/* Stromal connection lamellae */}
      <path d="M82 75 L140 88" stroke="#10b981" strokeWidth="1.5" fill="none" strokeDasharray="2 2" />

      {/* Sunlight rays arrow */}
      <path d="M25 25 L65 58" stroke="#f59e0b" strokeWidth="2.5" markerEnd="url(#arrow)" strokeLinecap="round" />
      <text x="25" y="18" fill="#f59e0b" fontSize="8" fontWeight="bold" className="font-mono">SUNLIGHT ☀️</text>

      {/* H2O / O2 cycles */}
      <path d="M50 150 Q70 120 70 86" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
      <text x="35" y="150" fill="#3b82f6" fontSize="7" className="font-mono">H₂O</text>

      <path d="M70 80 Q70 50 90 35" stroke="#10b981" strokeWidth="1.5" fill="none" />
      <text x="94" y="32" fill="#10b981" fontSize="7" className="font-mono">O₂ (Oxygen)</text>

      {/* Definitions markers */}
      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
      </marker>
    </svg>
    <div className="flex gap-2 justify-center flex-wrap">
      <button 
        onClick={() => setHighlightedFeature('thylakoid')}
        className={cn("px-2.5 py-1 rounded text-[10px] font-bold border transition-colors", highlightedFeature === 'thylakoid' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/35" : "text-muted-foreground border-white/5 bg-[#0e0e11]")}
      >
        Thylakoid Membrane
      </button>
      <button 
        onClick={() => setHighlightedFeature('stroma')}
        className={cn("px-2.5 py-1 rounded text-[10px] font-bold border transition-colors", highlightedFeature === 'stroma' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/35" : "text-muted-foreground border-white/5 bg-[#0e0e11]")}
      >
        Chloroplast Stroma
      </button>
    </div>
  </div>
);

// 2. Math Curve coordinate plot diagram
const MathPlotDiagram = () => (
  <svg viewBox="0 0 240 180" className="w-full max-w-[300px] bg-[#0b0b0d] rounded-2xl border border-white/5 p-4 shadow-xl">
    {/* Gridlines */}
    <path d="M 20 0 L 20 180 M 60 0 L 60 180 M 100 0 L 100 180 M 140 0 L 140 180 M 180 0 L 180 180 M 220 0 L 220 180" stroke="#131317" strokeWidth="1" />
    <path d="M 0 30 L 240 30 M 0 60 L 240 60 M 0 90 L 240 90 M 0 120 L 240 120 M 0 150 L 240 150" stroke="#131317" strokeWidth="1" />
    
    {/* Coordinate Axes */}
    <line x1="20" y1="120" x2="220" y2="120" stroke="#3b3b47" strokeWidth="1.5" /> {/* X Axis */}
    <line x1="80" y1="15" x2="80" y2="165" stroke="#3b3b47" strokeWidth="1.5" />  {/* Y Axis */}
    
    {/* Curve y = x^2 - 4x + 3 */}
    {/* Vertices projected mapping */}
    <path d="M 30 20 Q 80 160 130 20" fill="none" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Roots intersection dots */}
    <circle cx="58" cy="120" r="3.5" fill="#f59e0b" />
    <text x="52" y="112" fill="#f59e0b" fontSize="7" className="font-mono">x=1</text>

    <circle cx="102" cy="120" r="3.5" fill="#f59e0b" />
    <text x="106" y="112" fill="#f59e0b" fontSize="7" className="font-mono">x=3</text>

    {/* Equation annotation */}
    <text x="135" y="45" fill="#eab308" fontSize="8" className="font-mono">y = x² - 4x + 3</text>
  </svg>
);

// 3. Machine Learning Neural network nodes
const NeuralNetworkDiagram = () => (
  <svg viewBox="0 0 240 180" className="w-full max-w-[300px] bg-[#0b0b0d] rounded-2xl border border-white/5 p-4 shadow-xl">
    {/* Nodes Connections (weight paths) */}
    {/* Input to Hidden */}
    <line x1="40" y1="50" x2="120" y2="35" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
    <line x1="40" y1="50" x2="120" y2="90" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
    <line x1="40" y1="50" x2="120" y2="145" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
    
    <line x1="40" y1="130" x2="120" y2="35" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
    <line x1="40" y1="130" x2="120" y2="90" stroke="rgba(16,185,129,0.3)" strokeWidth="2" className="stroke-dash-pulse" />
    <line x1="40" y1="130" x2="120" y2="145" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />

    {/* Hidden to Output */}
    <line x1="120" y1="35" x2="200" y2="90" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
    <line x1="120" y1="90" x2="200" y2="90" stroke="rgba(16,185,129,0.3)" strokeWidth="2" />
    <line x1="120" y1="145" x2="200" y2="90" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />

    {/* Node Circles */}
    {/* Input Layer */}
    <circle cx="40" cy="50" r="10" fill="#1e1e24" stroke="#3b3b47" strokeWidth="1.5" />
    <text x="40" y="53" fill="#888" fontSize="7" textAnchor="middle" className="font-mono">x₁</text>
    
    <circle cx="40" cy="130" r="10" fill="#13271f" stroke="#10b981" strokeWidth="1.5" />
    <text x="40" y="133" fill="#10b981" fontSize="7" textAnchor="middle" className="font-mono">x₂</text>

    {/* Hidden Layer */}
    <circle cx="120" cy="35" r="10" fill="#1e1e24" stroke="#3b3b47" strokeWidth="1.5" />
    <circle cx="120" cy="90" r="10" fill="#13271f" stroke="#10b981" strokeWidth="1.5" />
    <text x="120" y="93" fill="#10b981" fontSize="7" textAnchor="middle" className="font-mono">h₂</text>
    <circle cx="120" cy="145" r="10" fill="#1e1e24" stroke="#3b3b47" strokeWidth="1.5" />

    {/* Output Layer */}
    <circle cx="200" cy="90" r="10" fill="#13271f" stroke="#10b981" strokeWidth="1.5" />
    <text x="200" y="93" fill="#10b981" fontSize="7" textAnchor="middle" className="font-mono">y</text>
  </svg>
);

// Voice Selector Popup Panel component
const VoiceSelectorPopup = ({ open, onClose, voices, selectedVoice, onSelectVoice, playingDemo, onPlayDemo }: {
  open: boolean; onClose: () => void; voices: typeof voiceOptions; selectedVoice: string;
  onSelectVoice: (id: string) => void; playingDemo: string | null; onPlayDemo: (id: string) => void;
}) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[60]" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[90%] max-w-xl bg-[#0b0b0d] border border-white/5 rounded-2xl shadow-2xl z-[61] overflow-hidden backdrop-blur-xl"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Acoustic Audio Agent</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-light">Select vocal coordinates for teaching simulation</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
            {voices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => { onSelectVoice(voice.id); onClose(); }}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all hover:bg-white/5",
                  selectedVoice === voice.id ? "border-emerald-500 bg-emerald-500/5" : "border-white/5 bg-[#0e0e11]/60"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold",
                    selectedVoice === voice.id ? "bg-emerald-500 text-white" : "bg-white/5 text-muted-foreground"
                  )}>
                    {voice.name[0]}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onPlayDemo(voice.id); }}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center transition-colors",
                      playingDemo === voice.id ? "bg-emerald-500 text-white" : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white"
                    )}
                  >
                    {playingDemo === voice.id ? <Pause className="w-3 h-3 text-emerald-400" /> : <Play className="w-3 h-3 ml-0.5" />}
                  </button>
                </div>
                <p className="text-xs font-bold text-white">{voice.name}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5 font-light">{voice.type} · {voice.accent}</p>
              </button>
            ))}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default Cereva;
