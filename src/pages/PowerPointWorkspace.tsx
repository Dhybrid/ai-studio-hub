import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Presentation as PresentationIcon, Cloud, CloudOff, Save, Share2, Search, Undo2, Redo2,
  Printer, Download, FilePlus, FolderOpen, FileDown, Home, X, Sparkles, Mic, Loader2, Send,
  Wand2, BookOpen, Languages, ListChecks, Plus, Trash2, Copy as CopyIcon, Play, MonitorPlay,
  ChevronLeft, ChevronRight, StickyNote, PanelRightClose, PanelRight, Menu as MenuIcon, Sun, Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/hooks/useWorkspace';
import PowerPointRibbon, { PptRibbonTab } from '@/components/office/PowerPointRibbon';

type SlideTheme = {
  id: string;
  bg: string;
  text: string;
  titleClass: string;
  accent: string;
};

const themes: Record<string, SlideTheme> = {
  office: { id: 'office', bg: '#ffffff', text: '#1f2937', titleClass: 'font-bold text-zinc-900', accent: '#2563eb' },
  ion: { id: 'ion', bg: 'linear-gradient(135deg,#1e3a8a,#1e40af)', text: '#ffffff', titleClass: 'font-bold text-white', accent: '#22d3ee' },
  gallery: { id: 'gallery', bg: 'linear-gradient(135deg,#f4f4f5,#d4d4d8)', text: '#18181b', titleClass: 'font-bold text-zinc-900', accent: '#f59e0b' },
  facet: { id: 'facet', bg: 'linear-gradient(135deg,#047857,#0f766e)', text: '#ffffff', titleClass: 'font-bold text-white', accent: '#bef264' },
  organic: { id: 'organic', bg: 'linear-gradient(135deg,#fef3c7,#fed7aa)', text: '#451a03', titleClass: 'font-bold text-amber-950', accent: '#ea580c' },
  wisp: { id: 'wisp', bg: 'linear-gradient(135deg,#ede9fe,#c4b5fd)', text: '#3b0764', titleClass: 'font-bold text-violet-950', accent: '#7c3aed' },
  dividend: { id: 'dividend', bg: 'linear-gradient(135deg,#27272a,#09090b)', text: '#fafafa', titleClass: 'font-bold text-zinc-50', accent: '#f43f5e' },
  berlin: { id: 'berlin', bg: 'linear-gradient(135deg,#f43f5e,#be185d)', text: '#fff7ed', titleClass: 'font-bold text-white', accent: '#fde047' },
};

interface SlideObj {
  id: string;
  themeId: string;
  title: string;
  body: string;
  notes: string;
  layout: 'title' | 'content' | 'two-col' | 'section' | 'blank';
  transition?: string;
  animation?: string;
}

const newSlide = (themeId = 'office', title = 'Click to add title', body = 'Click to add content', layout: SlideObj['layout'] = 'content'): SlideObj => ({
  id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  themeId, title, body, notes: '', layout,
});

const templateSlides: Record<string, { name: string; theme: string; slides: Partial<SlideObj>[] }> = {
  blank: { name: 'Untitled Presentation', theme: 'office', slides: [{ layout: 'title', title: 'Click to add title', body: 'Click to add subtitle' }] },
  'pitch-deck': { name: 'Startup Pitch Deck', theme: 'dividend', slides: [
    { layout: 'title', title: 'Acme', body: 'Reinventing X for the modern team' },
    { layout: 'content', title: 'The Problem', body: 'Today, teams waste hours on Y. The cost is enormous.' },
    { layout: 'content', title: 'Our Solution', body: 'A single platform that automates Y end-to-end.' },
    { layout: 'two-col', title: 'Market Opportunity', body: '$12B TAM growing 22% YoY across 3 verticals.' },
    { layout: 'content', title: 'Traction', body: '$1.2M ARR · 240 customers · 18% MoM growth' },
    { layout: 'content', title: 'Business Model', body: 'SaaS subscriptions starting at $99/seat/mo.' },
    { layout: 'content', title: 'Team', body: 'Ex-Google, Stripe, and Airbnb operators.' },
    { layout: 'content', title: 'The Ask', body: 'Raising $5M Series A to scale go-to-market.' },
  ]},
  'business-review': { name: 'Quarterly Business Review', theme: 'ion', slides: [
    { layout: 'title', title: 'Q4 Business Review', body: 'Performance, learnings & outlook' },
    { layout: 'content', title: 'Executive Summary', body: 'Revenue +18% YoY · Margin 22% · NPS 62' },
    { layout: 'two-col', title: 'Highlights', body: '• Closed top 3 enterprise deals\n• Launched mobile app\n• Hired 12 across product & GTM' },
    { layout: 'content', title: 'Outlook', body: 'Strong pipeline entering Q1.' },
  ]},
  'product-launch': { name: 'Product Launch', theme: 'berlin', slides: [
    { layout: 'title', title: 'Introducing Product X', body: 'The fastest way to do Y' },
    { layout: 'content', title: 'Why now?', body: 'The market is ready. Our users have been asking.' },
    { layout: 'content', title: 'Key Features', body: '• Feature A\n• Feature B\n• Feature C' },
    { layout: 'content', title: 'Available today', body: 'Ship faster, smile more.' },
  ]},
  'lesson-plan': { name: 'Lesson Plan', theme: 'facet', slides: [
    { layout: 'title', title: 'Lesson Title', body: 'Course · Date' },
    { layout: 'content', title: 'Learning Objectives', body: '• Objective 1\n• Objective 2\n• Objective 3' },
    { layout: 'content', title: 'Key Concepts', body: 'Explain the main ideas here.' },
    { layout: 'content', title: 'Activity', body: 'Work in pairs to discuss...' },
    { layout: 'content', title: 'Summary', body: 'Recap the key takeaways.' },
  ]},
  portfolio: { name: 'Creative Portfolio', theme: 'wisp', slides: [
    { layout: 'title', title: 'Your Name', body: 'Designer · Creator · Maker' },
    { layout: 'content', title: 'Selected Work', body: 'Project 1 — Project 2 — Project 3' },
    { layout: 'content', title: 'About', body: 'A short paragraph about your craft.' },
  ]},
  'team-update': { name: 'Team Update', theme: 'office', slides: [
    { layout: 'title', title: 'Team Update', body: 'Week of ' + new Date().toLocaleDateString() },
    { layout: 'content', title: 'Wins', body: '• Win 1\n• Win 2' },
    { layout: 'content', title: 'In progress', body: '• Item A\n• Item B' },
    { layout: 'content', title: 'Risks & blockers', body: 'List risks here.' },
  ]},
  training: { name: 'Training Deck', theme: 'organic', slides: [
    { layout: 'title', title: 'Onboarding', body: 'Welcome to the team' },
    { layout: 'content', title: 'Agenda', body: '• Company overview\n• Tools & systems\n• Your first week' },
    { layout: 'content', title: 'Resources', body: 'Where to find help and docs.' },
  ]},
  'minimal-dark': { name: 'Minimal Dark', theme: 'dividend', slides: [
    { layout: 'title', title: 'Title', body: 'Subtitle' },
    { layout: 'content', title: 'Section', body: 'Content goes here.' },
  ]},
  'sales-proposal': { name: 'Sales Proposal', theme: 'ion', slides: [
    { layout: 'title', title: 'Proposal for [Client]', body: 'Prepared by [Your Name]' },
    { layout: 'content', title: 'Understanding', body: 'Your goals and challenges.' },
    { layout: 'content', title: 'Our Approach', body: 'How we will help you succeed.' },
    { layout: 'content', title: 'Pricing', body: 'Investment & terms' },
  ]},
  wedding: { name: 'Event Slides', theme: 'berlin', slides: [
    { layout: 'title', title: 'Welcome', body: 'Thank you for joining us' },
    { layout: 'content', title: 'Schedule', body: '5:00 PM Welcome\n6:00 PM Dinner\n8:00 PM Toasts' },
  ]},
  'idea-board': { name: 'Idea Board', theme: 'gallery', slides: [
    { layout: 'title', title: 'Brainstorm', body: 'Today\'s session' },
    { layout: 'content', title: 'Ideas', body: '• Idea 1\n• Idea 2\n• Idea 3' },
  ]},
};

export default function PowerPointWorkspace() {
  const { theme: appTheme, toggleTheme } = useWorkspace();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [search] = useSearchParams();
  const templateId = search.get('template') || 'blank';
  const initialPrompt = search.get('prompt') || '';
  const tpl = templateSlides[templateId] || templateSlides.blank;

  const [docName, setDocName] = useState(tpl.name);
  const [editingName, setEditingName] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [activeTab, setActiveTab] = useState<PptRibbonTab>('home');
  const [zoom, setZoom] = useState(100);
  const [showAI, setShowAI] = useState(true);
  const [showFile, setShowFile] = useState(false);
  const [showSlideList, setShowSlideList] = useState(() => typeof window === 'undefined' ? true : window.innerWidth >= 768);
  const [showNotes, setShowNotes] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(initialPrompt);
  const [aiBusy, setAiBusy] = useState(false);
  const [voice, setVoice] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [presenting, setPresenting] = useState(false);
  const [presentIdx, setPresentIdx] = useState(0);

  const [slides, setSlides] = useState<SlideObj[]>(() =>
    tpl.slides.map(s => newSlide(tpl.theme, s.title || 'Untitled', s.body || '', s.layout || 'content'))
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [focused, setFocused] = useState<'title' | 'body' | 'notes' | null>(null);

  const titleRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const aiTaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = aiTaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [aiPrompt]);

  // Edge-swipe to open/close the slide list on mobile
  useEffect(() => {
    let startX = 0, startY = 0, tracking = false;
    const onStart = (e: TouchEvent) => {
      if (window.innerWidth >= 768) return;
      const t = e.touches[0];
      startX = t.clientX; startY = t.clientY;
      tracking = startX < 24 || showSlideList;
    };
    const onEnd = (e: TouchEvent) => {
      if (!tracking) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = Math.abs(t.clientY - startY);
      if (dy < 60 && Math.abs(dx) > 50) {
        if (dx > 0 && !showSlideList) setShowSlideList(true);
        else if (dx < 0 && showSlideList) setShowSlideList(false);
      }
      tracking = false;
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [showSlideList]);

  const current = slides[currentIdx];
  const theme = themes[current?.themeId || 'office'];

  const markUnsaved = useCallback(() => {
    setSaveStatus('unsaved');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSaveStatus('saving');
      setTimeout(() => setSaveStatus('saved'), 700);
    }, 1500);
  }, []);

  const updateSlide = (idx: number, patch: Partial<SlideObj>) => {
    setSlides(prev => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
    markUnsaved();
  };

  const exec = useCallback((cmd: string, value?: string) => {
    const target = focused === 'title' ? titleRef.current : bodyRef.current;
    target?.focus();
    document.execCommand(cmd, false, value);
    refreshFormats();
    markUnsaved();
  }, [focused, markUnsaved]);

  const refreshFormats = useCallback(() => {
    const fmts = new Set<string>();
    ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList',
      'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'].forEach(c => {
      try { if (document.queryCommandState(c)) fmts.add(c); } catch {}
    });
    setActiveFormats(fmts);
  }, []);

  const addSlide = () => {
    const s = newSlide(current?.themeId || 'office');
    setSlides(prev => {
      const next = [...prev]; next.splice(currentIdx + 1, 0, s); return next;
    });
    setCurrentIdx(currentIdx + 1);
    markUnsaved();
  };

  const duplicateSlide = () => {
    if (!current) return;
    setSlides(prev => {
      const next = [...prev]; next.splice(currentIdx + 1, 0, { ...current, id: `s-${Date.now()}` }); return next;
    });
    setCurrentIdx(currentIdx + 1);
    markUnsaved();
  };

  const deleteSlide = () => {
    if (slides.length <= 1) return;
    setSlides(prev => prev.filter((_, i) => i !== currentIdx));
    setCurrentIdx(i => Math.max(0, Math.min(i, slides.length - 2)));
    markUnsaved();
  };

  const applyTheme = (id: string) => {
    setSlides(prev => prev.map(s => ({ ...s, themeId: id })));
    markUnsaved();
  };

  const insertImage = () => {
    const i = document.createElement('input');
    i.type = 'file'; i.accept = 'image/*';
    i.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (f) {
        const r = new FileReader();
        r.onload = (ev) => {
          const url = ev.target?.result as string;
          updateSlide(currentIdx, { body: (current.body || '') + `\n[image:${url}]` });
          (bodyRef.current && bodyRef.current.focus());
          document.execCommand('insertImage', false, url);
        };
        r.readAsDataURL(f);
      }
    };
    i.click();
  };

  const insertText = () => { exec('insertHTML', '<span>New text</span>'); };
  const insertShape = (_shape: string) => {
    exec('insertHTML', '<span style="display:inline-block;width:60px;height:40px;background:hsl(var(--accent));margin:4px;border-radius:6px"></span>');
  };
  const insertTable = () => {
    const rows = parseInt(prompt('Rows:', '3') || '0');
    const cols = parseInt(prompt('Columns:', '3') || '0');
    if (rows > 0 && cols > 0) {
      let h = '<table style="border-collapse:collapse;margin:8px 0"><tbody>';
      for (let r = 0; r < rows; r++) { h += '<tr>'; for (let c = 0; c < cols; c++) h += `<td style="border:1px solid currentColor;padding:6px;min-width:60px">${r === 0 ? `H${c + 1}` : ''}</td>`; h += '</tr>'; }
      h += '</tbody></table>';
      exec('insertHTML', h);
    }
  };
  const insertChart = () => {
    exec('insertHTML', `<div style="display:inline-flex;align-items:flex-end;gap:6px;height:80px;padding:6px;border:1px dashed currentColor;border-radius:6px">
      ${[40,70,55,90,60].map(h => `<div style="width:18px;height:${h}%;background:hsl(var(--accent));border-radius:3px"></div>`).join('')}
    </div>`);
  };

  const applyTransition = (t: string) => updateSlide(currentIdx, { transition: t });
  const applyAnimation = (a: string) => updateSlide(currentIdx, { animation: a });

  const startShow = (fromBeginning: boolean) => {
    setPresentIdx(fromBeginning ? 0 : currentIdx);
    setPresenting(true);
  };

  const aiGenerate = () => {
    setShowAI(true);
    if (!aiPrompt) setAiPrompt('Generate a 5-slide outline about ');
  };

  const runAI = () => {
    if (!aiPrompt.trim()) return;
    setAiBusy(true);
    setTimeout(() => {
      const newSlides = [
        newSlide(current.themeId, `AI: ${aiPrompt.slice(0, 40)}`, 'Auto-generated overview', 'title'),
        newSlide(current.themeId, 'Key Point 1', 'AI generated detail goes here.'),
        newSlide(current.themeId, 'Key Point 2', 'AI generated detail goes here.'),
        newSlide(current.themeId, 'Conclusion', 'Wrap up with key takeaways.'),
      ];
      setSlides(prev => [...prev, ...newSlides]);
      setCurrentIdx(slides.length);
      setAiPrompt(''); setAiBusy(false); markUnsaved();
    }, 1200);
  };

  // Presentation keyboard
  useEffect(() => {
    if (!presenting) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPresenting(false);
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') setPresentIdx(i => Math.min(slides.length - 1, i + 1));
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') setPresentIdx(i => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [presenting, slides.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); setSaveStatus('saving'); setTimeout(() => setSaveStatus('saved'), 700); }
      if (e.key === 'F5' && !presenting) { e.preventDefault(); startShow(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presenting, currentIdx]);

  const downloadPDF = () => {
    const html = slides.map(s => `<section style="page-break-after:always;padding:40px"><h1>${s.title}</h1><div>${s.body}</div></section>`).join('');
    const blob = new Blob([html], { type: 'application/pdf' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${docName}.pdf`; a.click();
  };
  const downloadPptx = () => {
    const html = slides.map(s => `<section><h1>${s.title}</h1><div>${s.body}</div></section>`).join('');
    const blob = new Blob([html], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${docName}.pptx`; a.click();
  };

  const renderSlide = (s: SlideObj, opts?: { editable?: boolean; small?: boolean }) => {
    const t = themes[s.themeId];
    const isEditable = opts?.editable;
    return (
      <div className="w-full h-full relative overflow-hidden flex flex-col" style={{ background: t.bg, color: t.text }}>
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: t.accent }} />
        <div className={cn("flex-1 flex flex-col", opts?.small ? "p-3 gap-1" : "p-12 gap-6", s.layout === 'title' && "justify-center items-center text-center")}>
          {isEditable ? (
            <>
              <div
                ref={titleRef}
                contentEditable
                suppressContentEditableWarning
                onFocus={() => setFocused('title')}
                onInput={(e) => updateSlide(currentIdx, { title: (e.target as HTMLElement).innerText })}
                onKeyUp={refreshFormats}
                onMouseUp={refreshFormats}
                className={cn("outline-none", t.titleClass, s.layout === 'title' ? "text-5xl" : "text-4xl")}
                style={{ borderBottom: focused === 'title' ? `2px dashed ${t.accent}` : 'none' }}
                dangerouslySetInnerHTML={{ __html: s.title }}
              />
              <div
                ref={bodyRef}
                contentEditable
                suppressContentEditableWarning
                onFocus={() => setFocused('body')}
                onInput={(e) => updateSlide(currentIdx, { body: (e.target as HTMLElement).innerHTML })}
                onKeyUp={refreshFormats}
                onMouseUp={refreshFormats}
                className={cn("outline-none flex-1 text-xl leading-relaxed whitespace-pre-wrap",
                  "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6",
                  "[&_table]:border-collapse [&_td]:border [&_td]:border-current/30 [&_td]:p-1.5",
                  "[&_img]:max-w-full [&_img]:my-2")}
                style={{ borderTop: focused === 'body' ? `2px dashed ${t.accent}` : 'none' }}
                dangerouslySetInnerHTML={{ __html: s.body }}
              />
            </>
          ) : (
            <>
              <div className={cn(t.titleClass, opts?.small ? "text-[10px] truncate" : (s.layout === 'title' ? "text-5xl" : "text-4xl"))}>{s.title.replace(/<[^>]+>/g, '')}</div>
              {!opts?.small && (
                <div className="flex-1 text-xl leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: s.body }} />
              )}
              {opts?.small && (
                <div className="text-[7px] opacity-60 line-clamp-2">{(s.body || '').replace(/<[^>]+>/g, '').slice(0, 80)}</div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // Presentation overlay
  if (presenting) {
    const ps = slides[presentIdx];
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-full max-w-[100vw] max-h-[100vh] aspect-video" style={{ aspectRatio: '16/9' }}>
            {renderSlide(ps)}
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 text-white rounded-full px-4 py-2 backdrop-blur">
          <button onClick={() => setPresentIdx(i => Math.max(0, i - 1))} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs">{presentIdx + 1} / {slides.length}</span>
          <button onClick={() => setPresentIdx(i => Math.min(slides.length - 1, i + 1))} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={() => setPresenting(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* Title bar */}
      <div className="h-11 flex items-center justify-between px-2 sm:px-3 border-b border-border bg-background flex-shrink-0 gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <button onClick={() => navigate('/office/presentations')} className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-hover flex-shrink-0" title="Presentations Home">
            <PresentationIcon className="w-4 h-4 text-orange-500" />
          </button>
          <div className="hidden sm:flex items-center gap-0.5 border-r border-border pr-2 mr-1">
            <button onClick={() => { setSaveStatus('saving'); setTimeout(() => setSaveStatus('saved'), 700); }} title="Save" className="w-7 h-7 rounded hover:bg-surface-hover flex items-center justify-center"><Save className="w-3.5 h-3.5" /></button>
            <button onClick={() => exec('undo')} title="Undo" className="w-7 h-7 rounded hover:bg-surface-hover flex items-center justify-center"><Undo2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => exec('redo')} title="Redo" className="w-7 h-7 rounded hover:bg-surface-hover flex items-center justify-center"><Redo2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => startShow(true)} title="Start Show (F5)" className="w-7 h-7 rounded hover:bg-surface-hover flex items-center justify-center text-orange-500"><Play className="w-3.5 h-3.5" /></button>
          </div>

          {editingName ? (
            <input value={docName} onChange={(e) => setDocName(e.target.value)} autoFocus
              onBlur={() => setEditingName(false)} onKeyDown={(e) => { if (e.key === 'Enter') setEditingName(false); }}
              className="text-sm font-semibold bg-transparent border-b-2 border-accent outline-none px-1 min-w-[100px]" />
          ) : (
            <button onClick={() => setEditingName(true)} className="text-sm font-semibold hover:bg-surface-hover rounded px-1.5 py-0.5 truncate max-w-[140px] sm:max-w-[280px]">
              {docName}
            </button>
          )}

          <div className="flex items-center gap-1">
            {saveStatus === 'saved' && <Cloud className="w-3.5 h-3.5 text-green-500" />}
            {saveStatus === 'saving' && <Cloud className="w-3.5 h-3.5 text-accent animate-pulse" />}
            {saveStatus === 'unsaved' && <CloudOff className="w-3.5 h-3.5 text-muted-foreground" />}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-surface border border-border rounded-lg px-2.5 py-1 mx-2 w-60">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input placeholder="Search or ask AI..." className="bg-transparent text-xs outline-none flex-1" />
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => startShow(true)} className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-orange-500 text-white hover:bg-orange-600">
            <Play className="w-3.5 h-3.5" /> Present
          </button>
          <button onClick={() => setShowAI(!showAI)} className={cn("flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs", showAI ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-surface-hover")} title="Toggle AI">
            <Sparkles className="w-3.5 h-3.5" /> <span className="hidden sm:inline">AI</span>
          </button>
          <button onClick={toggleTheme} title="Toggle theme" className="w-8 h-8 rounded-lg hover:bg-surface-hover flex items-center justify-center text-muted-foreground">
            {appTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Backstage trigger */}
      <div className="flex items-center px-2 h-7 border-b border-border bg-surface/30 gap-2 flex-shrink-0">
        <button onClick={() => setShowFile(!showFile)}
          className={cn("px-2.5 h-6 rounded text-[11px] font-medium", showFile ? "bg-accent text-accent-foreground" : "bg-foreground text-background hover:opacity-90")}>
          File
        </button>
        <button onClick={() => setShowSlideList(!showSlideList)} className="md:hidden w-6 h-6 rounded hover:bg-surface-hover flex items-center justify-center" title="Toggle slides">
          <MenuIcon className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] text-muted-foreground hidden md:inline">{docName} · Slide {currentIdx + 1} of {slides.length}</span>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setShowNotes(!showNotes)} className={cn("px-2 h-6 rounded text-[10px] flex items-center gap-1", showNotes ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-surface-hover")}>
            <StickyNote className="w-3 h-3" /> Notes
          </button>
        </div>
      </div>

      {showFile && (
        <div className="absolute inset-0 z-50 bg-background flex">
          <div className="w-56 bg-foreground text-background p-3 flex flex-col gap-1">
            <button onClick={() => setShowFile(false)} className="self-start mb-3 w-8 h-8 rounded flex items-center justify-center hover:bg-white/10"><ArrowLeft className="w-4 h-4" /></button>
            {[
              { icon: Home, label: 'Home', action: () => navigate('/office/presentations') },
              { icon: FilePlus, label: 'New', action: () => navigate('/office/presentations/new') },
              { icon: FolderOpen, label: 'Open', action: () => {} },
              { icon: Save, label: 'Save', action: () => setShowFile(false) },
              { icon: FileDown, label: 'Save As', action: () => setShowFile(false) },
              { icon: Download, label: 'Export PDF', action: downloadPDF },
              { icon: FileDown, label: 'Export PPTX', action: downloadPptx },
              { icon: Printer, label: 'Print', action: () => window.print() },
              { icon: Share2, label: 'Share', action: () => {} },
            ].map((m, i) => (
              <button key={i} onClick={() => { m.action(); }} className="flex items-center gap-3 px-3 py-2 rounded text-xs hover:bg-white/10 text-left">
                <m.icon className="w-3.5 h-3.5" /> {m.label}
              </button>
            ))}
          </div>
          <div className="flex-1 p-8 overflow-auto">
            <h2 className="text-2xl font-bold mb-1">Good day</h2>
            <p className="text-sm text-muted-foreground mb-6">Recent presentations and templates</p>
            <button onClick={() => { setShowFile(false); navigate('/office/presentations/new'); }}
              className="px-4 py-2 rounded-lg bg-foreground text-background text-xs">New presentation</button>
          </div>
        </div>
      )}

      <PowerPointRibbon
        activeTab={activeTab}
        onTabChange={setActiveTab}
        exec={exec}
        activeFormats={activeFormats}
        onAddSlide={addSlide}
        onDuplicateSlide={duplicateSlide}
        onDeleteSlide={deleteSlide}
        onInsertImage={insertImage}
        onInsertText={insertText}
        onInsertShape={insertShape}
        onInsertTable={insertTable}
        onInsertChart={insertChart}
        onApplyTheme={applyTheme}
        onApplyTransition={applyTransition}
        onApplyAnimation={applyAnimation}
        onStartShow={startShow}
        onAIGenerate={aiGenerate}
        zoom={zoom}
        setZoom={setZoom}
      />

      {/* Body */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Slide sidebar - overlay on mobile, side panel on desktop */}
        {showSlideList && (
          <>
            <button aria-label="Close slides" onClick={() => setShowSlideList(false)} className="md:hidden fixed inset-0 z-30 bg-background/60 backdrop-blur-sm" />
          <aside className="fixed md:relative inset-y-0 left-0 z-40 w-44 sm:w-52 border-r border-border bg-card md:bg-surface/40 flex flex-col flex-shrink-0 shadow-2xl md:shadow-none animate-in slide-in-from-left md:animate-none">
            <div className="h-9 px-2 flex items-center justify-between border-b border-border flex-shrink-0">
              <span className="text-[11px] font-medium text-muted-foreground">Slides ({slides.length})</span>
              <div className="flex items-center gap-1">
                <button onClick={addSlide} title="New slide" className="w-6 h-6 rounded hover:bg-surface-hover flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
                <button onClick={() => setShowSlideList(false)} title="Hide" className="md:hidden w-6 h-6 rounded hover:bg-surface-hover flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2 space-y-2">
              {slides.map((s, i) => (
                <div key={s.id} className="relative group">
                  <button onClick={() => { setCurrentIdx(i); if (window.innerWidth < 768) setShowSlideList(false); }}
                    className={cn("w-full aspect-video rounded-md overflow-hidden border-2 transition-all relative",
                      i === currentIdx ? "border-accent shadow-md" : "border-border hover:border-accent/50")}>
                    {renderSlide(s, { small: true })}
                    <div className="absolute -left-5 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground font-medium">{i + 1}</div>
                  </button>
                  {slides.length > 1 && (
                    <button onClick={() => { setCurrentIdx(i); setTimeout(deleteSlide, 0); }}
                      className="absolute top-1 right-1 w-5 h-5 rounded bg-background/80 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-500 flex items-center justify-center transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </aside>
          </>
        )}

        {/* Canvas + notes */}
        <div className="flex-1 flex flex-col min-w-0 bg-muted/30 overflow-hidden">
          <div className="flex-1 overflow-auto p-3 sm:p-6 flex items-center justify-center">
            <div className="w-full max-w-[1200px] aspect-video bg-card rounded-lg shadow-2xl overflow-hidden border border-border" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}>
              {current && renderSlide(current, { editable: true })}
            </div>
          </div>

          {showNotes && (
            <div className="border-t border-border bg-card flex-shrink-0">
              <div className="px-3 py-1.5 text-[10px] text-muted-foreground border-b border-border flex items-center gap-1.5">
                <StickyNote className="w-3 h-3" /> Speaker Notes
              </div>
              <textarea
                ref={notesRef}
                value={current?.notes || ''}
                onChange={(e) => updateSlide(currentIdx, { notes: e.target.value })}
                placeholder="Click to add notes..."
                className="w-full h-20 p-3 bg-transparent outline-none text-xs resize-none"
              />
            </div>
          )}

          {/* Status bar */}
          <div className="h-6 border-t border-border flex items-center justify-between px-3 bg-surface/40 text-[10px] text-muted-foreground flex-shrink-0 gap-2">
            <div className="flex items-center gap-3">
              <span>Slide {currentIdx + 1} / {slides.length}</span>
              <span className="hidden sm:inline">{theme.id} theme</span>
              {current?.transition && <span className="hidden sm:inline text-accent">→ {current.transition}</span>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom(Math.max(40, zoom - 10))} className="w-5 h-5 rounded hover:bg-surface-hover flex items-center justify-center">−</button>
              <span className="w-10 text-center">{zoom}%</span>
              <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="w-5 h-5 rounded hover:bg-surface-hover flex items-center justify-center">+</button>
            </div>
          </div>
        </div>

        {/* AI panel - overlay on mobile */}
        {showAI && (
          <>
            <button aria-label="Close AI panel" onClick={() => setShowAI(false)} className="md:hidden fixed inset-0 z-30 bg-background/60 backdrop-blur-sm" />
          <aside className="fixed md:relative inset-y-0 right-0 z-40 w-[85vw] max-w-[20rem] md:w-72 lg:w-80 border-l border-border bg-card flex flex-col flex-shrink-0 shadow-2xl md:shadow-none">
            <div className="h-10 border-b border-border flex items-center justify-between px-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-xs font-semibold">AI Assistant</span>
              </div>
              <button onClick={() => setShowAI(false)} className="w-6 h-6 rounded hover:bg-surface-hover flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
            </div>
            <div className="flex-1 overflow-auto p-3 space-y-3">
              <div className="rounded-lg border border-border p-3 bg-surface/50">
                <div className="text-xs font-medium mb-1.5">Quick actions</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { icon: Wand2, label: 'Generate slides' },
                    { icon: BookOpen, label: 'Summarize' },
                    { icon: Languages, label: 'Translate' },
                    { icon: ListChecks, label: 'Outline' },
                    { icon: Sparkles, label: 'Designer' },
                  ].map((q, i) => (
                    <button key={i} onClick={() => setAiPrompt(`${q.label}: `)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] bg-card border border-border hover:border-accent">
                      <q.icon className="w-3 h-3" /> {q.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground">Tip: Press F5 to start the slideshow. Click any text on the slide to edit.</div>
            </div>
            <div className="border-t border-border p-2.5 flex-shrink-0">
              <div className="bg-surface border border-border rounded-xl p-2">
                <textarea
                  ref={aiTaRef}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask AI to design slides..."
                  rows={1}
                  className="w-full bg-transparent outline-none resize-none text-xs px-2 py-1 min-h-[36px] max-h-40 overflow-y-auto"
                />
                <div className="flex items-center justify-between px-1 pt-1">
                  <button onClick={() => setVoice(!voice)} className={cn("w-7 h-7 rounded-full flex items-center justify-center", voice ? "bg-accent text-white" : "hover:bg-surface-hover text-muted-foreground")} title="Voice input">
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={runAI} disabled={!aiPrompt.trim() || aiBusy}
                    className="px-3 py-1.5 rounded-lg bg-foreground text-background text-[11px] font-medium flex items-center gap-1.5 disabled:opacity-40">
                    {aiBusy ? <><Loader2 className="w-3 h-3 animate-spin" /> Working</> : <><Send className="w-3 h-3" /> Send</>}
                  </button>
                </div>
              </div>
            </div>
          </aside>
          </>
        )}
      </div>

      {/* Floating voice */}
      <button onClick={() => setVoice(!voice)}
        className={cn("fixed bottom-12 right-4 w-11 h-11 rounded-full shadow-xl flex items-center justify-center z-30 transition-all md:hidden",
          voice ? "bg-accent text-white scale-110" : "bg-foreground text-background hover:scale-105")}
        title="Voice"
      >
        <Mic className="w-5 h-5" />
      </button>
    </div>
  );
}
