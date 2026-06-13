import { useState, useRef, useEffect } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  FileSpreadsheet, FileText, Presentation, Wand2, Loader2, ArrowLeft,
  Sparkles, Shield, Zap, Globe, Star, ChevronRight, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { routeAgent } from '@/lib/agentApi';
import OfficeEditor from './OfficeEditor';
import { ThreeDGeometry } from '@/components/ui/ThreeDGeometry';

type OfficeType = 'document' | 'spreadsheet' | 'presentation';

const tips = [
  { title: 'Use AI to Draft', desc: 'Type a detailed prompt to automatically construct complex templates, data tables, and slide outlines.' },
  { title: 'Keyboard Shortcuts', desc: 'Save workspace with Ctrl+S. Standard rich-text formatting shortcuts are fully operational.' },
  { title: 'Real-time Sync', desc: 'Changes are automatically committed to sandboxed local state. Look for the sync indicators.' },
  { title: 'Full Compatibility', desc: 'Export sheets to CSV/XLSX, documents to PDF/DOCX, and presentations to PPTX/PDF.' },
];

const OfficeDashboard = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState<OfficeType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Isometric tilt state
  const [tilts, setTilts] = useState<{ [key: string]: { x: number; y: number } }>({
    document: { x: 0, y: 0 },
    spreadsheet: { x: 0, y: 0 },
    presentation: { x: 0, y: 0 },
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
      <div className="flex h-screen w-full overflow-hidden bg-[#070708]">
        <OfficeEditor />
      </div>
    );
  }

  const handleCreate = (type: OfficeType) => {
    if (type === 'document') return navigate('/office/documents/new');
    if (type === 'spreadsheet') return navigate('/office/spreadsheets/new');
    if (type === 'presentation') return navigate('/office/presentations/new');
  };

  const createPromptPath = (type: OfficeType, promptText: string) => {
    const q = encodeURIComponent(promptText);
    if (type === 'document') return `/office/documents/doc-${Date.now()}?prompt=${q}`;
    if (type === 'spreadsheet') return `/office/spreadsheets/sheet-${Date.now()}?prompt=${q}`;
    return `/office/presentations/pres-${Date.now()}?prompt=${q}`;
  };

  const routeToPromptTarget = async (promptText: string): Promise<string> => {
    if (selectedType) return createPromptPath(selectedType, promptText);

    const result = await routeAgent(promptText);
    if (result.route === 'office-spreadsheet') return createPromptPath('spreadsheet', promptText);
    if (result.route === 'office-presentation') return createPromptPath('presentation', promptText);
    if (result.route === 'office-document') return createPromptPath('document', promptText);
    if (result.route === 'cereva') return `/cereva?prompt=${encodeURIComponent(promptText)}`;
    return `/chat?prompt=${encodeURIComponent(promptText)}`;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const promptText = prompt.trim();
    setIsGenerating(true);
    try {
      navigate(await routeToPromptTarget(promptText));
    } catch {
      navigate(createPromptPath('document', promptText));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#070708] text-white overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:35px_35px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      
      {/* 3D Wave Grid on bottom */}
      <div className="absolute bottom-[-50px] left-0 w-full h-[320px] pointer-events-none z-0 opacity-80 overflow-hidden">
        <ThreeDGeometry mode="grid" color="#3b82f6" opacity={0.25} interactive={true} />
      </div>

      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-white/5 bg-[#08080a]/60 backdrop-blur-md z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="text-muted-foreground hover:text-white transition-colors w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 border border-transparent hover:border-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-yellow-500" />
            </div>
            <h1 className="text-sm font-semibold tracking-wider uppercase text-white">Office Studio</h1>
          </div>
        </div>
      </div>

      {/* Content wrapper */}
      <div className="flex-1 overflow-y-auto z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
          
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/5 text-yellow-500 text-xs font-semibold uppercase tracking-wider mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Cosmox Suite
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">Create documents with intelligence</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto font-light leading-relaxed">
              Formulate spreadsheets, compose formal documents, or construct high-impact slide decks manually or powered by AI.
            </p>
          </div>

          {/* AI Prompt Capsule */}
          <div className="max-w-2xl mx-auto mb-14">
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-white/5 focus-within:from-yellow-500/40 focus-within:to-yellow-600/10 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              <div className="bg-[#0b0b0d]/90 backdrop-blur-xl rounded-[15px] p-3">
                <div className="flex items-center gap-1.5 mb-2 px-1 flex-wrap">
                  {(['document', 'spreadsheet', 'presentation'] as const).map((t) => {
                    const isSelected = selectedType === t;
                    const colors = {
                      document: { text: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', icon: FileText },
                      spreadsheet: { text: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20', icon: FileSpreadsheet },
                      presentation: { text: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', icon: Presentation },
                    }[t];
                    const Icon = colors.icon;
                    return (
                      <button
                        key={t}
                        onClick={() => setSelectedType(selectedType === t ? null : t)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 border",
                          isSelected
                            ? `${colors.text} ${colors.bg} ${colors.border}`
                            : "text-muted-foreground hover:text-white hover:bg-white/5 border-transparent"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="capitalize">{t}</span>
                      </button>
                    );
                  })}
                </div>
                
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-transparent border-none outline-none resize-none text-sm py-2.5 px-3 text-white placeholder:text-muted-foreground min-h-[44px] max-h-[160px] overflow-y-auto"
                  placeholder={selectedType ? `Describe the ${selectedType} you want to draft...` : "Describe what you need — e.g. 'Create a Q4 sales forecast table with sample formulas'"}
                  rows={1}
                />
                
                <div className="flex items-center justify-between px-2 pt-2 border-t border-white/5 mt-1">
                  <p className="text-[10px] text-muted-foreground">
                    {selectedType ? `Targeting new ${selectedType} sandbox` : 'Select a node or let AI route'}
                  </p>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="px-4 py-2 rounded-xl bg-white text-black hover:bg-neutral-100 text-xs font-bold flex items-center gap-2 disabled:opacity-20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Structuring...</>
                    ) : (
                      <><Wand2 className="w-3.5 h-3.5" /> Generate Workspace</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cards Grid with high-fidelity animated SVG mockups */}
          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            
            {/* Document Card */}
            <div 
              onMouseMove={(e) => handleMouseMove('document', e)}
              onMouseLeave={() => handleMouseLeave('document')}
              style={{
                transform: `perspective(1000px) rotateX(${tilts.document.x}deg) rotateY(${tilts.document.y}deg) scale(${tilts.document.x || tilts.document.y ? 1.02 : 1})`,
                transition: tilts.document.x || tilts.document.y ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              className="rounded-2xl border border-white/5 bg-[#0b0b0d]/50 overflow-hidden hover:border-blue-500/35 transition-colors group relative"
            >
              {/* Card ambient glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(59,130,246,0.12),transparent_50%)] pointer-events-none" />
              
              {/* SVG Mockup */}
              <div className="h-44 bg-[#09090b]/80 border-b border-white/5 flex items-center justify-center p-6 relative overflow-hidden">
                <svg className="w-full h-full max-w-[200px]" viewBox="0 0 200 120" fill="none">
                  {/* Outer paper sheet */}
                  <rect x="35" y="10" width="130" height="100" rx="4" fill="#131317" stroke="#2a2a35" strokeWidth="1.5" />
                  {/* Top header bar */}
                  <rect x="45" y="20" width="110" height="10" rx="2" fill="#202026" />
                  <rect x="52" y="23" width="30" height="4" rx="1" fill="#3b82f6" />
                  {/* Document Content Lines */}
                  <line x1="45" y1="42" x2="155" y2="42" stroke="#25252d" strokeWidth="3" strokeLinecap="round" />
                  <line x1="45" y1="52" x2="135" y2="52" stroke="#25252d" strokeWidth="3" strokeLinecap="round" />
                  <line x1="45" y1="62" x2="155" y2="62" stroke="#25252d" strokeWidth="3" strokeLinecap="round" />
                  {/* Image skeleton block */}
                  <rect x="45" y="72" width="45" height="25" rx="2" fill="#202026" stroke="#2d2d37" />
                  {/* Interactive cursor */}
                  <line x1="96" y1="72" x2="96" y2="82" stroke="#3b82f6" strokeWidth="2" className="animate-pulse" />
                  {/* Secondary Text lines */}
                  <line x1="96" y1="87" x2="155" y2="87" stroke="#25252d" strokeWidth="3" strokeLinecap="round" />
                  <line x1="96" y1="97" x2="140" y2="97" stroke="#25252d" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <FileText className="w-4.5 h-4.5 text-blue-500" />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate('/office/documents')}
                      className="text-[10px] font-bold text-muted-foreground hover:text-white uppercase tracking-wider px-2 py-1 rounded-md hover:bg-white/5 transition-all"
                    >
                      Files
                    </button>
                    <button 
                      onClick={() => handleCreate('document')}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-all"
                    >
                      <Plus className="w-3 h-3" /> New
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">Documents</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-light mb-4">
                  Write documents with structured typography, embedded images, and export capabilities.
                </p>
                <div className="space-y-2">
                  {['Custom styles & grids', 'Auto-draft layouts', 'PDF / DOCX download'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
                      <span className="font-light">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Spreadsheet Card */}
            <div 
              onMouseMove={(e) => handleMouseMove('spreadsheet', e)}
              onMouseLeave={() => handleMouseLeave('spreadsheet')}
              style={{
                transform: `perspective(1000px) rotateX(${tilts.spreadsheet.x}deg) rotateY(${tilts.spreadsheet.y}deg) scale(${tilts.spreadsheet.x || tilts.spreadsheet.y ? 1.02 : 1})`,
                transition: tilts.spreadsheet.x || tilts.spreadsheet.y ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              className="rounded-2xl border border-white/5 bg-[#0b0b0d]/50 overflow-hidden hover:border-green-500/35 transition-colors group relative"
            >
              {/* Card ambient glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(34,197,94,0.12),transparent_50%)] pointer-events-none" />
              
              {/* SVG Mockup */}
              <div className="h-44 bg-[#09090b]/80 border-b border-white/5 flex items-center justify-center p-6 relative overflow-hidden">
                <svg className="w-full h-full max-w-[200px]" viewBox="0 0 200 120" fill="none">
                  {/* Grid Box */}
                  <rect x="25" y="15" width="150" height="90" rx="3" fill="#131317" stroke="#2a2a35" strokeWidth="1.5" />
                  {/* Header Row */}
                  <rect x="25" y="15" width="150" height="15" fill="#202026" stroke="#2a2a35" strokeWidth="0.75" />
                  {/* Grid Lines */}
                  <line x1="62" y1="15" x2="62" y2="105" stroke="#25252d" strokeWidth="1" />
                  <line x1="100" y1="15" x2="100" y2="105" stroke="#25252d" strokeWidth="1" />
                  <line x1="138" y1="15" x2="138" y2="105" stroke="#25252d" strokeWidth="1" />
                  
                  <line x1="25" y1="45" x2="175" y2="45" stroke="#25252d" strokeWidth="1" />
                  <line x1="25" y1="60" x2="175" y2="60" stroke="#25252d" strokeWidth="1" />
                  <line x1="25" y1="75" x2="175" y2="75" stroke="#25252d" strokeWidth="1" />
                  <line x1="25" y1="90" x2="175" y2="90" stroke="#25252d" strokeWidth="1" />
                  
                  {/* Highlight active cell */}
                  <rect x="62" y="45" width="38" height="15" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1.5" />
                  <rect x="97" y="57" width="4" height="4" fill="#22c55e" />
                  
                  {/* Content bars inside cells */}
                  <rect x="30" y="35" width="20" height="4" rx="1" fill="#3b3b47" />
                  <rect x="70" y="35" width="18" height="4" rx="1" fill="#3b3b47" />
                  
                  <rect x="30" y="50" width="15" height="4" rx="1" fill="#3b3b47" />
                  <rect x="70" y="50" width="22" height="4" rx="1" fill="#22c55e" />
                  
                  {/* Interactive Chart overlay on right */}
                  <rect x="106" y="38" width="62" height="60" rx="3" fill="#1b1b22" stroke="#3c3c4b" strokeWidth="1" />
                  {/* Glowing Chart Line */}
                  <path d="M110 85 L120 70 L130 80 L140 55 L150 65 L160 48" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="160" cy="48" r="2.5" fill="#22c55e" />
                </svg>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <FileSpreadsheet className="w-4.5 h-4.5 text-green-500" />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate('/office/spreadsheets')}
                      className="text-[10px] font-bold text-muted-foreground hover:text-white uppercase tracking-wider px-2 py-1 rounded-md hover:bg-white/5 transition-all"
                    >
                      Files
                    </button>
                    <button 
                      onClick={() => handleCreate('spreadsheet')}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold hover:bg-green-500/20 transition-all"
                    >
                      <Plus className="w-3 h-3" /> New
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">Spreadsheets</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-light mb-4">
                  Compile data, write formulas, build dynamic charts, and export workbook logs.
                </p>
                <div className="space-y-2">
                  {['100+ native formulas', 'Live chart generator', 'CSV & XLSX export/import'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                      <span className="font-light">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Presentation Card */}
            <div 
              onMouseMove={(e) => handleMouseMove('presentation', e)}
              onMouseLeave={() => handleMouseLeave('presentation')}
              style={{
                transform: `perspective(1000px) rotateX(${tilts.presentation.x}deg) rotateY(${tilts.presentation.y}deg) scale(${tilts.presentation.x || tilts.presentation.y ? 1.02 : 1})`,
                transition: tilts.presentation.x || tilts.presentation.y ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              className="rounded-2xl border border-white/5 bg-[#0b0b0d]/50 overflow-hidden hover:border-orange-500/35 transition-colors group relative"
            >
              {/* Card ambient glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(249,115,22,0.12),transparent_50%)] pointer-events-none" />
              
              {/* SVG Mockup */}
              <div className="h-44 bg-[#09090b]/80 border-b border-white/5 flex items-center justify-center p-6 relative overflow-hidden">
                <svg className="w-full h-full max-w-[200px]" viewBox="0 0 200 120" fill="none">
                  {/* Left Sidebar slide navigation list */}
                  <rect x="15" y="15" width="22" height="90" rx="2" fill="#131317" stroke="#25252d" strokeWidth="1" />
                  <rect x="19" y="22" width="14" height="10" rx="1" fill="#202026" stroke="#2a2a35" strokeWidth="0.75" />
                  <rect x="19" y="38" width="14" height="10" rx="1" fill="#202026" stroke="#2a2a35" strokeWidth="0.75" />
                  <rect x="19" y="54" width="14" height="10" rx="1" fill="rgba(249,115,22,0.06)" stroke="#f97316" strokeWidth="0.75" />
                  
                  {/* Main Slide frame */}
                  <rect x="44" y="15" width="140" height="90" rx="4" fill="#131317" stroke="#2a2a35" strokeWidth="1.5" />
                  
                  {/* Slide details (e.g. Pie chart or visual element and bullet lines) */}
                  <circle cx="84" cy="60" r="24" fill="#202026" stroke="#2d2d37" strokeWidth="1" />
                  {/* Sector outline inside circle */}
                  <path d="M84 60 L84 36 A24 24 0 0 1 108 60 Z" fill="#f97316" />
                  
                  {/* Right hand lines */}
                  <rect x="120" y="36" width="50" height="8" rx="2" fill="#202026" />
                  <line x1="120" y1="56" x2="165" y2="56" stroke="#25252d" strokeWidth="3" strokeLinecap="round" />
                  <line x1="120" y1="66" x2="155" y2="66" stroke="#25252d" strokeWidth="3" strokeLinecap="round" />
                  <line x1="120" y1="76" x2="160" y2="76" stroke="#25252d" strokeWidth="3" strokeLinecap="round" />
                  
                  {/* bottom progress indicators */}
                  <circle cx="108" cy="95" r="1.5" fill="#3b3b47" />
                  <circle cx="114" cy="95" r="1.5" fill="#f97316" />
                  <circle cx="120" cy="95" r="1.5" fill="#3b3b47" />
                </svg>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <Presentation className="w-4.5 h-4.5 text-orange-500" />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate('/office/presentations')}
                      className="text-[10px] font-bold text-muted-foreground hover:text-white uppercase tracking-wider px-2 py-1 rounded-md hover:bg-white/5 transition-all"
                    >
                      Files
                    </button>
                    <button 
                      onClick={() => handleCreate('presentation')}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold hover:bg-orange-500/20 transition-all"
                    >
                      <Plus className="w-3 h-3" /> New
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">Presentations</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-light mb-4">
                  Construct stunning slide deck presentations with flexible grids and assets.
                </p>
                <div className="space-y-2">
                  {['Interactive slide canvas', 'Slide auto-structurer', 'PPTX presentation export'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500/60" />
                      <span className="font-light">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Quick start blank block */}
          <div className="text-center mb-16 relative z-10">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-5">Quick start a blank model</p>
            <div className="flex items-center justify-center gap-3.5 flex-wrap">
              {[
                { type: 'document' as const, label: 'Document', icon: FileText, color: 'hover:border-blue-500/30 hover:text-blue-400' },
                { type: 'spreadsheet' as const, label: 'Spreadsheet', icon: FileSpreadsheet, color: 'hover:border-green-500/30 hover:text-green-400' },
                { type: 'presentation' as const, label: 'Presentation', icon: Presentation, color: 'hover:border-orange-500/30 hover:text-orange-400' }
              ].map((t) => (
                <button
                  key={t.type}
                  onClick={() => handleCreate(t.type)}
                  className={cn(
                    "flex items-center gap-2.5 px-5 py-3 rounded-xl border border-white/5 bg-[#0e0e11]/60 hover:bg-[#121216] transition-all text-xs font-semibold text-muted-foreground hover:scale-105 active:scale-95 duration-250",
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
            <h3 className="text-base font-bold text-center text-white uppercase tracking-wider mb-8">Why Coxmox Office Suite</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Sparkles, title: 'AI-Powered', desc: 'Draft full sheets & reports with prompt templates.' },
                { icon: Zap, title: '60FPS Sandbox', desc: 'Auto-saving, zero latency visual components.' },
                { icon: Shield, title: 'Encrypted Logs', desc: 'All database transactions are fully secure.' },
                { icon: Globe, title: 'Responsive Flow', desc: 'Work across devices with mobile layouts.' },
              ].map((f, i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-[#0b0b0d]/50 p-5 text-center hover:border-white/10 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3.5">
                    <f.icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1.5">{f.title}</h4>
                  <p className="text-[10px] text-muted-foreground font-light leading-normal">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="mb-16 relative z-10">
            <h3 className="text-base font-bold text-center text-white uppercase tracking-wider mb-8">System Tips & Shortcuts</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {tips.map((tip, i) => (
                <div key={i} className="flex gap-3.5 rounded-xl border border-white/5 bg-[#0b0b0d]/30 p-5 hover:border-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/5 border border-yellow-500/15 flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1">{tip.title}</h4>
                    <p className="text-[11px] text-muted-foreground font-light leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compatibility formats */}
          <div className="rounded-xl border border-white/5 bg-[#0b0b0d]/40 p-6 text-center relative z-10">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Supported File Formats</h3>
            <p className="text-[10px] text-muted-foreground mb-4 font-light">Full compatibility for importing and exporting binary segments</p>
            <div className="flex items-center justify-center gap-3.5 flex-wrap">
              {['.docx', '.xlsx', '.pptx', '.pdf', '.csv', '.txt', '.html'].map(ext => (
                <span key={ext} className="px-3 py-1.5 rounded-lg border border-white/5 bg-[#070708]/60 text-[10px] font-mono text-muted-foreground hover:text-white transition-colors">{ext}</span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OfficeDashboard;
