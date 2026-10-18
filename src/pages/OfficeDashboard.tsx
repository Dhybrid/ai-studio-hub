import { useState, useRef, useEffect } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  FileSpreadsheet, FileText, Presentation, Wand2, Loader2, ArrowLeft,
  Sparkles, Shield, Zap, Globe, Star, ChevronRight, Plus, FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useBrowserTabs } from '@/hooks/useBrowserTabs';
import { routeAgent } from '@/lib/agentApi';
import OfficeEditor from './OfficeEditor';
import { InteractiveCursorBackground } from '@/components/ui/InteractiveCursorBackground';
import { DocumentIcon, SheetIcon, SlideIcon, PdfIcon } from '@/components/browser/AppIcons';

type OfficeType = 'document' | 'spreadsheet' | 'presentation' | 'pdf';

const tips = [
  { title: 'Use AI to Draft', desc: 'Type a detailed prompt to automatically construct complex templates, data tables, and slide outlines.' },
  { title: 'Keyboard Shortcuts', desc: 'Save workspace with Ctrl+S. Standard rich-text formatting shortcuts are fully operational.' },
  { title: 'Real-time Sync', desc: 'Changes are automatically committed to sandboxed local state. Look for the sync indicators.' },
  { title: 'Full Compatibility', desc: 'Export sheets to CSV/XLSX, documents to PDF/DOCX, and presentations to PPTX/PDF.' },
];

export const OfficeDashboard = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const { theme } = useWorkspace();
  const { openTab } = useBrowserTabs();
  const isDark = theme === 'dark';

  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState<OfficeType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Isometric tilt state for 4 cards
  const [tilts, setTilts] = useState<{ [key: string]: { x: number; y: number } }>({
    document: { x: 0, y: 0 },
    spreadsheet: { x: 0, y: 0 },
    presentation: { x: 0, y: 0 },
    pdf: { x: 0, y: 0 },
  });

  const handleMouseMove = (type: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Cap tilt angles
    const rotateX = -((y - centerY) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setTilts(prev => ({ ...prev, [type]: { x: rotateX, y: rotateY } }));
  };

  const handleMouseLeave = (type: string) => {
    setTilts(prev => ({ ...prev, [type]: { x: 0, y: 0 } }));
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }
  }, [prompt]);

  if (projectId === 'new' && (searchParams.get('mode') === 'document' || !searchParams.get('mode'))) {
    return <Navigate to="/office/documents/new" replace />;
  }

  if (projectId) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-[#070708]">
        <OfficeEditor />
      </div>
    );
  }

  const handleCreate = (type: OfficeType) => {
    if (type === 'document') {
      openTab({ title: 'Documents / Text', url: '/office/documents', type: 'word' });
      navigate('/office/documents/new');
      return;
    }
    if (type === 'spreadsheet') {
      openTab({ title: 'Sheets', url: '/office/spreadsheets', type: 'excel' });
      navigate('/office/spreadsheets/new');
      return;
    }
    if (type === 'presentation') {
      openTab({ title: 'Slides', url: '/office/presentations', type: 'powerpoint' });
      navigate('/office/presentations/new');
      return;
    }
    if (type === 'pdf') {
      openTab({ title: 'PDF Editor', url: '/office/pdf', type: 'pdf' });
      navigate('/office/pdf/new');
      return;
    }
  };

  const handleOpenFiles = (type: OfficeType) => {
    if (type === 'document') {
      openTab({ title: 'Documents / Text', url: '/office/documents', type: 'word' });
      navigate('/office/documents');
      return;
    }
    if (type === 'spreadsheet') {
      openTab({ title: 'Sheets', url: '/office/spreadsheets', type: 'excel' });
      navigate('/office/spreadsheets');
      return;
    }
    if (type === 'presentation') {
      openTab({ title: 'Slides', url: '/office/presentations', type: 'powerpoint' });
      navigate('/office/presentations');
      return;
    }
    if (type === 'pdf') {
      openTab({ title: 'PDF Editor', url: '/office/pdf', type: 'pdf' });
      navigate('/office/pdf');
      return;
    }
  };

  const createPromptPath = (type: OfficeType, promptText: string) => {
    const q = encodeURIComponent(promptText);
    if (type === 'document') {
      openTab({ title: 'Documents / Text', url: `/office/documents?prompt=${q}`, type: 'word' });
      return `/office/documents/doc-${Date.now()}?prompt=${q}`;
    }
    if (type === 'spreadsheet') {
      openTab({ title: 'Sheets', url: `/office/spreadsheets?prompt=${q}`, type: 'excel' });
      return `/office/spreadsheets/sheet-${Date.now()}?prompt=${q}`;
    }
    if (type === 'presentation') {
      openTab({ title: 'Slides', url: `/office/presentations?prompt=${q}`, type: 'powerpoint' });
      return `/office/presentations/pres-${Date.now()}?prompt=${q}`;
    }
    openTab({ title: 'PDF Editor', url: `/office/pdf?prompt=${q}`, type: 'pdf' });
    return `/office/pdf/pdf-${Date.now()}?prompt=${q}`;
  };

  const routeToPromptTarget = async (promptText: string): Promise<string> => {
    if (selectedType) return createPromptPath(selectedType, promptText);

    const result = await routeAgent(promptText);
    if (result.route === 'office-spreadsheet') return createPromptPath('spreadsheet', promptText);
    if (result.route === 'office-presentation') return createPromptPath('presentation', promptText);
    if (result.route === 'office-document') return createPromptPath('document', promptText);
    if (result.route === 'office-pdf' || promptText.toLowerCase().includes('pdf')) return createPromptPath('pdf', promptText);
    if (result.route === 'cereva') return `/cereva?prompt=${encodeURIComponent(promptText)}`;
    return `/chat?prompt=${encodeURIComponent(promptText)}`;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const promptText = prompt.trim();
    setIsGenerating(true);
    try {
      const targetPath = await routeToPromptTarget(promptText);
      navigate(targetPath);
    } catch {
      navigate(createPromptPath('document', promptText));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-[#070708] text-slate-900 dark:text-white overflow-hidden relative transition-colors duration-300">
      {/* Interactive Cursor Background (Grid + Undulating 3D Mesh + Cursor Spotlight) */}
      <InteractiveCursorBackground mode="grid" intensity={1} showWaveGrid={true} />

      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200 dark:border-white/5 bg-white/70 dark:bg-[#08080a]/60 backdrop-blur-md z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="text-slate-500 hover:text-slate-900 dark:text-muted-foreground dark:hover:text-white transition-colors w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/5"
            title="Return to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-yellow-500" />
            </div>
            <h1 className="text-sm font-semibold tracking-wider uppercase text-slate-900 dark:text-white">Office Studio</h1>
          </div>
        </div>
      </div>

      {/* Content wrapper */}
      <div className="flex-1 overflow-y-auto z-10 custom-scrollbar">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
          
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Cosmox Suite
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">Create documents with intelligence</h2>
            <p className="text-sm text-slate-600 dark:text-muted-foreground max-w-lg mx-auto font-light leading-relaxed">
              Formulate spreadsheets, compose formal documents, construct high-impact slide decks, or review PDFs manually or powered by AI.
            </p>
          </div>

          {/* AI Prompt Capsule */}
          <div className="max-w-2xl mx-auto mb-14">
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-slate-300 dark:from-white/10 to-slate-200 dark:to-white/5 focus-within:from-yellow-500/40 focus-within:to-yellow-600/10 transition-all duration-500 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              <div className="bg-white/95 dark:bg-[#0b0b0d]/90 backdrop-blur-xl rounded-[15px] p-3 border border-slate-200/80 dark:border-transparent">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-transparent border-none outline-none resize-none text-sm py-2.5 px-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-muted-foreground min-h-[44px] max-h-[160px] overflow-y-auto font-normal leading-relaxed"
                  placeholder="Describe what you need — e.g. 'Create a Q4 sales forecast table with sample formulas', 'Pitch deck for AI startup', 'Executive agreement contract'..."
                  rows={1}
                />
                
                <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-100 dark:border-white/5 mt-1">
                  <p className="text-[10px] text-slate-500 dark:text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-yellow-500" />
                    <span>AI auto-routes to Documents, Sheets, Slides, or PDF</span>
                  </p>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    title="Generate Workspace"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-yellow-500 via-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-300 text-slate-950 flex items-center justify-center shadow-lg disabled:opacity-25 transition-all hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950 stroke-[2.5]" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cards Grid with high-fidelity animated SVG mockups & 3D Isometric Tilt */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            
            {/* 1. Document Card */}
            <div 
              onMouseMove={(e) => handleMouseMove('document', e)}
              onMouseLeave={() => handleMouseLeave('document')}
              style={{
                transform: `perspective(1000px) rotateX(${tilts.document.x}deg) rotateY(${tilts.document.y}deg) scale(${tilts.document.x || tilts.document.y ? 1.02 : 1})`,
                transition: tilts.document.x || tilts.document.y ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b0b0d]/50 overflow-hidden hover:border-blue-500/40 shadow-sm hover:shadow-xl transition-all group relative"
            >
              {/* Card ambient glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(59,130,246,0.12),transparent_50%)] pointer-events-none" />
              
              {/* SVG Mockup */}
              <div className="h-40 bg-slate-100/90 dark:bg-[#09090b]/80 border-b border-slate-200 dark:border-white/5 flex items-center justify-center p-5 relative overflow-hidden">
                <svg className="w-full h-full max-w-[190px]" viewBox="0 0 200 120" fill="none">
                  {/* Outer paper sheet */}
                  <rect x="35" y="10" width="130" height="100" rx="4" fill={isDark ? "#131317" : "#ffffff"} stroke={isDark ? "#2a2a35" : "#cbd5e1"} strokeWidth="1.5" />
                  {/* Top header bar */}
                  <rect x="45" y="20" width="110" height="10" rx="2" fill={isDark ? "#202026" : "#f1f5f9"} />
                  <rect x="52" y="23" width="30" height="4" rx="1" fill="#3b82f6" />
                  {/* Document Content Lines */}
                  <line x1="45" y1="42" x2="155" y2="42" stroke={isDark ? "#25252d" : "#e2e8f0"} strokeWidth="3" strokeLinecap="round" />
                  <line x1="45" y1="52" x2="135" y2="52" stroke={isDark ? "#25252d" : "#e2e8f0"} strokeWidth="3" strokeLinecap="round" />
                  <line x1="45" y1="62" x2="155" y2="62" stroke={isDark ? "#25252d" : "#e2e8f0"} strokeWidth="3" strokeLinecap="round" />
                  {/* Image skeleton block */}
                  <rect x="45" y="72" width="45" height="25" rx="2" fill={isDark ? "#202026" : "#f1f5f9"} stroke={isDark ? "#2d2d37" : "#cbd5e1"} />
                  {/* Interactive cursor */}
                  <line x1="96" y1="72" x2="96" y2="82" stroke="#3b82f6" strokeWidth="2" className="animate-pulse" />
                  {/* Secondary Text lines */}
                  <line x1="96" y1="87" x2="155" y2="87" stroke={isDark ? "#25252d" : "#e2e8f0"} strokeWidth="3" strokeLinecap="round" />
                  <line x1="96" y1="97" x2="140" y2="97" stroke={isDark ? "#25252d" : "#e2e8f0"} strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <DocumentIcon className="w-4 h-4" />
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleOpenFiles('document')}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:text-muted-foreground dark:hover:text-white uppercase tracking-wider px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                      Files
                    </button>
                    <button 
                      onClick={() => handleCreate('document')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-all"
                    >
                      <Plus className="w-3 h-3" /> New
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">Documents</h3>
                <p className="text-xs text-slate-600 dark:text-muted-foreground leading-relaxed font-light mb-3">
                  Write documents with structured typography, embedded images, and export capabilities.
                </p>
                <div className="space-y-1.5">
                  {['Custom styles & grids', 'Auto-draft layouts', 'PDF / DOCX download'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
                      <span className="font-light">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Spreadsheet Card */}
            <div 
              onMouseMove={(e) => handleMouseMove('spreadsheet', e)}
              onMouseLeave={() => handleMouseLeave('spreadsheet')}
              style={{
                transform: `perspective(1000px) rotateX(${tilts.spreadsheet.x}deg) rotateY(${tilts.spreadsheet.y}deg) scale(${tilts.spreadsheet.x || tilts.spreadsheet.y ? 1.02 : 1})`,
                transition: tilts.spreadsheet.x || tilts.spreadsheet.y ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b0b0d]/50 overflow-hidden hover:border-emerald-500/40 shadow-sm hover:shadow-xl transition-all group relative"
            >
              {/* Card ambient glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(34,197,94,0.12),transparent_50%)] pointer-events-none" />
              
              {/* SVG Mockup */}
              <div className="h-40 bg-slate-100/90 dark:bg-[#09090b]/80 border-b border-slate-200 dark:border-white/5 flex items-center justify-center p-5 relative overflow-hidden">
                <svg className="w-full h-full max-w-[190px]" viewBox="0 0 200 120" fill="none">
                  {/* Grid Box */}
                  <rect x="25" y="15" width="150" height="90" rx="3" fill={isDark ? "#131317" : "#ffffff"} stroke={isDark ? "#2a2a35" : "#cbd5e1"} strokeWidth="1.5" />
                  {/* Header Row */}
                  <rect x="25" y="15" width="150" height="15" fill={isDark ? "#202026" : "#f1f5f9"} stroke={isDark ? "#2a2a35" : "#cbd5e1"} strokeWidth="0.75" />
                  {/* Grid Lines */}
                  <line x1="62" y1="15" x2="62" y2="105" stroke={isDark ? "#25252d" : "#e2e8f0"} strokeWidth="1" />
                  <line x1="100" y1="15" x2="100" y2="105" stroke={isDark ? "#25252d" : "#e2e8f0"} strokeWidth="1" />
                  <line x1="138" y1="15" x2="138" y2="105" stroke={isDark ? "#25252d" : "#e2e8f0"} strokeWidth="1" />
                  
                  <line x1="25" y1="45" x2="175" y2="45" stroke={isDark ? "#25252d" : "#e2e8f0"} strokeWidth="1" />
                  <line x1="25" y1="60" x2="175" y2="60" stroke={isDark ? "#25252d" : "#e2e8f0"} strokeWidth="1" />
                  <line x1="25" y1="75" x2="175" y2="75" stroke={isDark ? "#25252d" : "#e2e8f0"} strokeWidth="1" />
                  <line x1="25" y1="90" x2="175" y2="90" stroke={isDark ? "#25252d" : "#e2e8f0"} strokeWidth="1" />
                  
                  {/* Highlight active cell */}
                  <rect x="62" y="45" width="38" height="15" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="1.5" />
                  <rect x="97" y="57" width="4" height="4" fill="#22c55e" />
                  
                  {/* Content bars inside cells */}
                  <rect x="30" y="35" width="20" height="4" rx="1" fill={isDark ? "#3b3b47" : "#94a3b8"} />
                  <rect x="70" y="35" width="18" height="4" rx="1" fill={isDark ? "#3b3b47" : "#94a3b8"} />
                  
                  <rect x="30" y="50" width="15" height="4" rx="1" fill={isDark ? "#3b3b47" : "#94a3b8"} />
                  <rect x="70" y="50" width="22" height="4" rx="1" fill="#22c55e" />
                  
                  {/* Interactive Chart overlay on right */}
                  <rect x="106" y="38" width="62" height="60" rx="3" fill={isDark ? "#1b1b22" : "#f8fafc"} stroke={isDark ? "#3c3c4b" : "#cbd5e1"} strokeWidth="1" />
                  {/* Glowing Chart Line */}
                  <path d="M110 85 L120 70 L130 80 L140 55 L150 65 L160 48" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="160" cy="48" r="2.5" fill="#22c55e" />
                </svg>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <SheetIcon className="w-4 h-4" />
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleOpenFiles('spreadsheet')}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:text-muted-foreground dark:hover:text-white uppercase tracking-wider px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                      Files
                    </button>
                    <button 
                      onClick={() => handleCreate('spreadsheet')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
                    >
                      <Plus className="w-3 h-3" /> New
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">Spreadsheets</h3>
                <p className="text-xs text-slate-600 dark:text-muted-foreground leading-relaxed font-light mb-3">
                  Compile data, write formulas, build dynamic charts, and export workbook logs.
                </p>
                <div className="space-y-1.5">
                  {['100+ native formulas', 'Live chart generator', 'CSV & XLSX export/import'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                      <span className="font-light">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Presentation Card */}
            <div 
              onMouseMove={(e) => handleMouseMove('presentation', e)}
              onMouseLeave={() => handleMouseLeave('presentation')}
              style={{
                transform: `perspective(1000px) rotateX(${tilts.presentation.x}deg) rotateY(${tilts.presentation.y}deg) scale(${tilts.presentation.x || tilts.presentation.y ? 1.02 : 1})`,
                transition: tilts.presentation.x || tilts.presentation.y ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b0b0d]/50 overflow-hidden hover:border-orange-500/40 shadow-sm hover:shadow-xl transition-all group relative"
            >
              {/* Card ambient glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(249,115,22,0.12),transparent_50%)] pointer-events-none" />
              
              {/* SVG Mockup */}
              <div className="h-40 bg-slate-100/90 dark:bg-[#09090b]/80 border-b border-slate-200 dark:border-white/5 flex items-center justify-center p-5 relative overflow-hidden">
                <svg className="w-full h-full max-w-[190px]" viewBox="0 0 200 120" fill="none">
                  {/* Left Sidebar slide navigation list */}
                  <rect x="15" y="15" width="22" height="90" rx="2" fill={isDark ? "#131317" : "#ffffff"} stroke={isDark ? "#25252d" : "#cbd5e1"} strokeWidth="1" />
                  <rect x="19" y="22" width="14" height="10" rx="1" fill={isDark ? "#202026" : "#f1f5f9"} stroke={isDark ? "#2a2a35" : "#cbd5e1"} strokeWidth="0.75" />
                  <rect x="19" y="38" width="14" height="10" rx="1" fill={isDark ? "#202026" : "#f1f5f9"} stroke={isDark ? "#2a2a35" : "#cbd5e1"} strokeWidth="0.75" />
                  <rect x="19" y="54" width="14" height="10" rx="1" fill="rgba(249,115,22,0.08)" stroke="#f97316" strokeWidth="0.75" />
                  
                  {/* Main Slide frame */}
                  <rect x="44" y="15" width="140" height="90" rx="4" fill={isDark ? "#131317" : "#ffffff"} stroke={isDark ? "#2a2a35" : "#cbd5e1"} strokeWidth="1.5" />
                  
                  {/* Slide details (Pie chart and bullet lines) */}
                  <circle cx="84" cy="60" r="24" fill={isDark ? "#202026" : "#f1f5f9"} stroke={isDark ? "#2d2d37" : "#cbd5e1"} strokeWidth="1" />
                  {/* Sector outline inside circle */}
                  <path d="M84 60 L84 36 A24 24 0 0 1 108 60 Z" fill="#f97316" />
                  
                  {/* Right hand lines */}
                  <rect x="120" y="36" width="50" height="8" rx="2" fill={isDark ? "#202026" : "#f1f5f9"} />
                  <line x1="120" y1="56" x2="165" y2="56" stroke={isDark ? "#25252d" : "#cbd5e1"} strokeWidth="3" strokeLinecap="round" />
                  <line x1="120" y1="66" x2="155" y2="66" stroke={isDark ? "#25252d" : "#cbd5e1"} strokeWidth="3" strokeLinecap="round" />
                  <line x1="120" y1="76" x2="160" y2="76" stroke={isDark ? "#25252d" : "#cbd5e1"} strokeWidth="3" strokeLinecap="round" />
                  
                  {/* bottom progress indicators */}
                  <circle cx="108" cy="95" r="1.5" fill={isDark ? "#3b3b47" : "#94a3b8"} />
                  <circle cx="114" cy="95" r="1.5" fill="#f97316" />
                  <circle cx="120" cy="95" r="1.5" fill={isDark ? "#3b3b47" : "#94a3b8"} />
                </svg>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <SlideIcon className="w-4 h-4" />
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleOpenFiles('presentation')}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:text-muted-foreground dark:hover:text-white uppercase tracking-wider px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                      Files
                    </button>
                    <button 
                      onClick={() => handleCreate('presentation')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold hover:bg-orange-500/20 transition-all"
                    >
                      <Plus className="w-3 h-3" /> New
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">Presentations</h3>
                <p className="text-xs text-slate-600 dark:text-muted-foreground leading-relaxed font-light mb-3">
                  Construct stunning slide deck presentations with flexible grids and assets.
                </p>
                <div className="space-y-1.5">
                  {['Interactive slide canvas', 'Slide auto-structurer', 'PPTX presentation export'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500/60" />
                      <span className="font-light">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. PDF Document Card (The requested addition!) */}
            <div 
              onMouseMove={(e) => handleMouseMove('pdf', e)}
              onMouseLeave={() => handleMouseLeave('pdf')}
              style={{
                transform: `perspective(1000px) rotateX(${tilts.pdf.x}deg) rotateY(${tilts.pdf.y}deg) scale(${tilts.pdf.x || tilts.pdf.y ? 1.02 : 1})`,
                transition: tilts.pdf.x || tilts.pdf.y ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b0b0d]/50 overflow-hidden hover:border-rose-500/40 shadow-sm hover:shadow-xl transition-all group relative"
            >
              {/* Card ambient glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(244,63,94,0.12),transparent_50%)] pointer-events-none" />
              
              {/* SVG Mockup */}
              <div className="h-40 bg-slate-100/90 dark:bg-[#09090b]/80 border-b border-slate-200 dark:border-white/5 flex items-center justify-center p-5 relative overflow-hidden">
                <svg className="w-full h-full max-w-[190px]" viewBox="0 0 200 120" fill="none">
                  {/* Outer PDF Sheet */}
                  <rect x="35" y="10" width="130" height="100" rx="4" fill={isDark ? "#131317" : "#ffffff"} stroke={isDark ? "#2a2a35" : "#cbd5e1"} strokeWidth="1.5" />
                  {/* Top Red PDF Banner */}
                  <rect x="45" y="18" width="110" height="14" rx="2" fill="rgba(244,63,94,0.15)" stroke="rgba(244,63,94,0.3)" strokeWidth="0.8" />
                  <rect x="52" y="23" width="22" height="4" rx="1" fill="#f43f5e" />
                  <rect x="78" y="23" width="40" height="4" rx="1" fill={isDark ? "#3b3b47" : "#cbd5e1"} />
                  {/* Document Lines */}
                  <line x1="45" y1="42" x2="155" y2="42" stroke={isDark ? "#25252d" : "#e2e8f0"} strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="45" y1="52" x2="135" y2="52" stroke={isDark ? "#25252d" : "#e2e8f0"} strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="45" y1="62" x2="148" y2="62" stroke={isDark ? "#25252d" : "#e2e8f0"} strokeWidth="2.5" strokeLinecap="round" />
                  {/* Signature / Stamp Seal */}
                  <rect x="45" y="74" width="55" height="24" rx="2" fill={isDark ? "#18181f" : "#f1f5f9"} stroke={isDark ? "#2d2d37" : "#cbd5e1"} strokeWidth="0.8" />
                  <circle cx="60" cy="86" r="6" fill="rgba(244,63,94,0.18)" stroke="#f43f5e" strokeWidth="1" />
                  <line x1="72" y1="84" x2="92" y2="84" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="72" y1="90" x2="86" y2="90" stroke={isDark ? "#3b3b47" : "#cbd5e1"} strokeWidth="1.5" strokeLinecap="round" />
                  {/* Digital Signature line on right */}
                  <path d="M115 88 Q125 76 135 84 T155 82" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </svg>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <PdfIcon className="w-4 h-4" />
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleOpenFiles('pdf')}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:text-muted-foreground dark:hover:text-white uppercase tracking-wider px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                      Files
                    </button>
                    <button 
                      onClick={() => handleCreate('pdf')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-all"
                    >
                      <Plus className="w-3 h-3" /> New
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">PDF Editor</h3>
                <p className="text-xs text-slate-600 dark:text-muted-foreground leading-relaxed font-light mb-3">
                  Annotate, review, sign, and organize PDF documents with vector precision.
                </p>
                <div className="space-y-1.5">
                  {['PDF Form & Text editing', 'Digital Signatures & Seals', 'Vector annotations & export'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500/60" />
                      <span className="font-light">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Quick start blank block */}
          <div className="text-center mb-16 relative z-10">
            <p className="text-xs text-slate-500 dark:text-muted-foreground uppercase tracking-widest font-semibold mb-5">Quick start a blank model</p>
            <div className="flex items-center justify-center gap-3.5 flex-wrap">
              {[
                { type: 'document' as const, label: 'Document', icon: FileText, color: 'hover:border-blue-500/40 hover:text-blue-500' },
                { type: 'spreadsheet' as const, label: 'Spreadsheet', icon: FileSpreadsheet, color: 'hover:border-emerald-500/40 hover:text-emerald-500' },
                { type: 'presentation' as const, label: 'Presentation', icon: Presentation, color: 'hover:border-orange-500/40 hover:text-orange-500' },
                { type: 'pdf' as const, label: 'PDF', icon: FileCheck, color: 'hover:border-rose-500/40 hover:text-rose-500' },
              ].map((t) => (
                <button
                  key={t.type}
                  onClick={() => handleCreate(t.type)}
                  className={cn(
                    "flex items-center gap-2.5 px-5 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0e0e11]/60 hover:bg-slate-50 dark:hover:bg-[#121216] transition-all text-xs font-semibold text-slate-600 dark:text-muted-foreground hover:scale-105 active:scale-95 duration-250 shadow-sm",
                    t.color
                  )}
                >
                  <t.icon className="w-4 h-4" />
                  <span>Blank {t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Features Detail Grid */}
          <div className="mb-16 relative z-10">
            <h3 className="text-base font-bold text-center text-slate-900 dark:text-white uppercase tracking-wider mb-8">Why Eruwa Office Suite</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Sparkles, title: 'AI-Powered', desc: 'Draft full sheets & reports with prompt templates.' },
                { icon: Zap, title: '60FPS Sandbox', desc: 'Auto-saving, zero latency visual components.' },
                { icon: Shield, title: 'Encrypted Logs', desc: 'All database transactions are fully secure.' },
                { icon: Globe, title: 'Responsive Flow', desc: 'Work across devices with mobile layouts.' },
              ].map((f, i) => (
                <div key={i} className="rounded-xl border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0b0b0d]/50 p-5 text-center hover:border-slate-300 dark:hover:border-white/10 transition-colors shadow-sm">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-3.5">
                    <f.icon className="w-4.5 h-4.5 text-slate-900 dark:text-white" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">{f.title}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-muted-foreground font-light leading-normal">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="mb-16 relative z-10">
            <h3 className="text-base font-bold text-center text-slate-900 dark:text-white uppercase tracking-wider mb-8">System Tips & Shortcuts</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {tips.map((tip, i) => (
                <div key={i} className="flex gap-3.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0b0b0d]/30 p-5 hover:border-slate-300 dark:hover:border-white/10 transition-colors shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">{tip.title}</h4>
                    <p className="text-[11px] text-slate-600 dark:text-muted-foreground font-light leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compatibility formats */}
          <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0b0b0d]/40 p-6 text-center relative z-10 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Supported File Formats</h3>
            <p className="text-[10px] text-slate-500 dark:text-muted-foreground mb-4 font-light">Full compatibility for importing and exporting binary segments</p>
            <div className="flex items-center justify-center gap-3.5 flex-wrap">
              {['.docx', '.xlsx', '.pptx', '.pdf', '.csv', '.txt', '.html'].map(ext => (
                <span key={ext} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-[#070708]/60 text-[10px] font-mono text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-white transition-colors">{ext}</span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OfficeDashboard;
