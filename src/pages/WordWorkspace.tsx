import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, FileText, Cloud, CloudOff, Save, Share2, ChevronDown, Search, MoreHorizontal,
  Undo2, Redo2, Printer, Download, FilePlus, FolderOpen, FileDown, Home, X,
  Mic, Sparkles, Wand2, Loader2, ChevronRight, MessageSquare, Send, Bold, Italic, Underline,
  Type, PaintBucket, Languages, BookOpen, ListChecks
} from 'lucide-react';
import { cn } from '@/lib/utils';
import WordRibbon, { RibbonTab } from '@/components/office/WordRibbon';

const templateContent: Record<string, { name: string; html: string }> = {
  blank: { name: 'Untitled Document', html: '<p><br></p>' },
  'business-report': {
    name: 'Q4 Business Report',
    html: `<h1 style="text-align:center">Quarterly Business Report</h1>
<p style="text-align:center"><i>Q4 — Prepared by [Your Name]</i></p>
<h2>Executive Summary</h2>
<p>This quarter has shown strong year-over-year growth across our core product lines. Revenue is up 18% and customer retention improved to 94%.</p>
<h2>Financial Highlights</h2>
<ul><li>Revenue: $4.2M (+18%)</li><li>Operating Margin: 22%</li><li>New Customers: 1,240</li></ul>
<h2>Outlook</h2>
<p>We anticipate continued momentum into Q1 supported by new enterprise contracts.</p>`
  },
  resume: {
    name: 'Modern Résumé',
    html: `<h1>Your Name</h1>
<p><i>Email · Phone · LinkedIn · City</i></p>
<hr>
<h2>Summary</h2>
<p>Concise summary of your background and key strengths.</p>
<h2>Experience</h2>
<h3>Senior Role — Company</h3>
<p><i>2022 – Present</i></p>
<ul><li>Drove a 40% increase in pipeline through new outbound strategy.</li><li>Led a cross-functional team of 8.</li></ul>
<h2>Education</h2>
<p>BSc in Computer Science — University, Year</p>
<h2>Skills</h2>
<p>JavaScript, TypeScript, Product Strategy, Public Speaking</p>`
  },
  'cover-letter': {
    name: 'Cover Letter',
    html: `<p>Your Name<br>Your Address<br>City, ZIP</p><p>${new Date().toLocaleDateString()}</p>
<p>Hiring Manager<br>Company Name<br>Company Address</p>
<p>Dear Hiring Manager,</p>
<p>I am writing to express my interest in the [Position] role at [Company]. With [X] years of experience in [field], I am confident I would be a great fit for your team.</p>
<p>Sincerely,<br>Your Name</p>`
  },
  'meeting-notes': {
    name: 'Meeting Notes',
    html: `<h1>Meeting Notes</h1>
<p><b>Date:</b> ${new Date().toLocaleDateString()} &nbsp; <b>Time:</b> 10:00 AM</p>
<p><b>Attendees:</b> </p>
<h2>Agenda</h2>
<ol><li>Project status</li><li>Risks & blockers</li><li>Next steps</li></ol>
<h2>Notes</h2>
<p>...</p>
<h2>Action Items</h2>
<ul><li>[ ] Owner — Task — Due</li></ul>`
  },
  newsletter: {
    name: 'Newsletter',
    html: `<h1 style="text-align:center">Monthly Newsletter</h1>
<p style="text-align:center"><i>Issue #1</i></p>
<h2>What's New</h2><p>Highlights from this month...</p>
<h2>Featured Story</h2><p>...</p>
<h2>Upcoming Events</h2><ul><li>Event 1</li><li>Event 2</li></ul>`
  },
  thesis: {
    name: 'Academic Paper',
    html: `<h1 style="text-align:center">Title of Paper</h1>
<p style="text-align:center">Author Name</p>
<p style="text-align:center"><i>Institution</i></p>
<h2>Abstract</h2><p>Brief summary of the paper.</p>
<h2>1. Introduction</h2><p>...</p>
<h2>2. Methods</h2><p>...</p>
<h2>3. Results</h2><p>...</p>
<h2>4. Discussion</h2><p>...</p>
<h2>References</h2><ol><li>Author, A. (Year). Title. Journal.</li></ol>`
  },
  ebook: {
    name: 'eBook',
    html: `<h1 style="text-align:center">Book Title</h1><p style="text-align:center"><i>by Author</i></p>
<h2>Chapter 1</h2><p>Once upon a time...</p>
<h2>Chapter 2</h2><p>...</p>`
  },
  invoice: {
    name: 'Invoice',
    html: `<h1>INVOICE</h1>
<p><b>Invoice #:</b> 0001 &nbsp; <b>Date:</b> ${new Date().toLocaleDateString()}</p>
<p><b>Bill To:</b><br>Client Name<br>Client Address</p>
<table style="width:100%;border-collapse:collapse"><tr style="background:#f3f4f6"><th style="border:1px solid #ddd;padding:6px;text-align:left">Description</th><th style="border:1px solid #ddd;padding:6px">Qty</th><th style="border:1px solid #ddd;padding:6px">Rate</th><th style="border:1px solid #ddd;padding:6px">Amount</th></tr>
<tr><td style="border:1px solid #ddd;padding:6px">Service A</td><td style="border:1px solid #ddd;padding:6px;text-align:center">1</td><td style="border:1px solid #ddd;padding:6px;text-align:right">$500</td><td style="border:1px solid #ddd;padding:6px;text-align:right">$500</td></tr></table>
<p style="text-align:right"><b>Total: $500</b></p>`
  },
  letter: {
    name: 'Personal Letter',
    html: `<p>${new Date().toLocaleDateString()}</p><p>Dear Friend,</p><p>I hope this letter finds you well...</p><p>Warmly,<br>Your Name</p>`
  },
  proposal: {
    name: 'Project Proposal',
    html: `<h1>Project Proposal</h1>
<h2>Overview</h2><p>...</p>
<h2>Goals</h2><ul><li>Goal 1</li><li>Goal 2</li></ul>
<h2>Timeline</h2><p>...</p>
<h2>Budget</h2><p>...</p>`
  },
  wedding: {
    name: 'Event Program',
    html: `<h1 style="text-align:center">Event Program</h1><p style="text-align:center"><i>Date · Venue</i></p>
<h2 style="text-align:center">Schedule</h2>
<ul><li>5:00 PM — Welcome</li><li>6:00 PM — Dinner</li><li>8:00 PM — Toasts</li></ul>`
  },
};

export default function WordWorkspace() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [search] = useSearchParams();
  const templateId = search.get('template') || 'blank';
  const initialPrompt = search.get('prompt') || '';
  const tpl = templateContent[templateId] || templateContent.blank;

  const [docName, setDocName] = useState(tpl.name);
  const [editingName, setEditingName] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [activeTab, setActiveTab] = useState<RibbonTab>('home');
  const [zoom, setZoom] = useState(100);
  const [showRuler, setShowRuler] = useState(true);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [wordCount, setWordCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [showAI, setShowAI] = useState(true);
  const [showFile, setShowFile] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(initialPrompt);
  const [aiBusy, setAiBusy] = useState(false);
  const [voice, setVoice] = useState(false);
  const [showMini, setShowMini] = useState(false);
  const [miniPos, setMiniPos] = useState({ x: 0, y: 0 });

  // Multi-page state — each page has its own HTML
  const [pages, setPages] = useState<string[]>([tpl.html]);
  const [activePage, setActivePage] = useState(0);
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Backwards-compat: editorRef points to the currently focused page
  const editorRef = { get current() { return pageRefs.current[activePage] || null; } } as React.MutableRefObject<HTMLDivElement | null>;

  const markUnsaved = useCallback(() => {
    setSaveStatus('unsaved');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSaveStatus('saving');
      setTimeout(() => setSaveStatus('saved'), 700);
    }, 1500);
  }, []);

  const exec = useCallback((cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    refreshFormats();
    markUnsaved();
  }, [markUnsaved]);

  const refreshFormats = useCallback(() => {
    const fmts = new Set<string>();
    ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList',
      'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'].forEach(c => {
      try { if (document.queryCommandState(c)) fmts.add(c); } catch {}
    });
    setActiveFormats(fmts);
  }, []);

  const updateCounts = useCallback(() => {
    const text = pageRefs.current.map(p => p?.innerText || '').join('\n');
    setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
    setPageCount(pages.length);
  }, [pages.length]);

  // Reset pages when template changes
  useEffect(() => {
    setPages([tpl.html]);
    setActivePage(0);
    setDocName(tpl.name);
    // Defer count update until refs are populated
    setTimeout(updateCounts, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  const addPage = useCallback((after = activePage) => {
    setPages(prev => {
      const next = [...prev];
      next.splice(after + 1, 0, '<p><br></p>');
      return next;
    });
    setActivePage(after + 1);
    markUnsaved();
    setTimeout(() => { pageRefs.current[after + 1]?.focus(); updateCounts(); }, 30);
  }, [activePage, markUnsaved, updateCounts]);

  const removePage = useCallback((idx: number) => {
    if (pages.length <= 1) return;
    setPages(prev => prev.filter((_, i) => i !== idx));
    setActivePage(i => Math.max(0, Math.min(i, pages.length - 2)));
    markUnsaved();
    setTimeout(updateCounts, 0);
  }, [pages.length, markUnsaved, updateCounts]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); setSaveStatus('saving'); setTimeout(() => setSaveStatus('saved'), 700); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') { e.preventDefault(); window.print(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Selection mini toolbar
  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection();
      const inAnyPage = sel && !sel.isCollapsed && pageRefs.current.some(p => p?.contains(sel.anchorNode));
      if (!inAnyPage) {
        setShowMini(false);
        return;
      }
      const r = sel.getRangeAt(0).getBoundingClientRect();
      setMiniPos({ x: r.left + r.width / 2, y: r.top - 8 });
      setShowMini(true);
      refreshFormats();
    };
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, [refreshFormats]);

  const handleInsertImage = () => {
    const i = document.createElement('input');
    i.type = 'file'; i.accept = 'image/*';
    i.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (f) { const r = new FileReader(); r.onload = (ev) => exec('insertImage', ev.target?.result as string); r.readAsDataURL(f); }
    };
    i.click();
  };

  const handleInsertTable = () => {
    const rows = parseInt(prompt('Rows:', '3') || '0');
    const cols = parseInt(prompt('Columns:', '3') || '0');
    if (rows > 0 && cols > 0) {
      let h = '<table style="border-collapse:collapse;width:100%;margin:8px 0"><tbody>';
      for (let r = 0; r < rows; r++) { h += '<tr>'; for (let c = 0; c < cols; c++) h += `<td style="border:1px solid #ddd;padding:6px;min-width:60px">${r === 0 ? `Header ${c + 1}` : ''}</td>`; h += '</tr>'; }
      h += '</tbody></table><p><br></p>';
      exec('insertHTML', h);
    }
  };

  const handleInsertLink = () => { const u = prompt('URL:'); if (u) exec('createLink', u); };

  const handleAIRewrite = () => { setShowAI(true); setAiPrompt('Rewrite the selection more clearly.'); };

  const runAI = () => {
    if (!aiPrompt.trim()) return;
    setAiBusy(true);
    setTimeout(() => {
      exec('insertHTML', `<p><i>[AI generated based on: "${aiPrompt}"]</i></p>`);
      setAiPrompt(''); setAiBusy(false);
    }, 1200);
  };

  const allHTML = () => pageRefs.current.map((p, i) => `<section data-page="${i + 1}" style="page-break-after:always">${p?.innerHTML || ''}</section>`).join('\n');
  const downloadPDF = () => {
    const blob = new Blob([allHTML()], { type: 'application/pdf' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${docName}.pdf`; a.click();
  };
  const downloadDocx = () => {
    const blob = new Blob([allHTML()], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${docName}.docx`; a.click();
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* Title bar */}
      <div className="h-11 flex items-center justify-between px-3 border-b border-border bg-background flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button onClick={() => navigate('/office/documents')} className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-hover" title="Documents Home">
            <FileText className="w-4 h-4 text-blue-500" />
          </button>
          {/* Quick access */}
          <div className="flex items-center gap-0.5 border-r border-border pr-2 mr-1">
            <button onClick={() => { setSaveStatus('saving'); setTimeout(() => setSaveStatus('saved'), 700); }} title="Save (Ctrl+S)" className="w-7 h-7 rounded hover:bg-surface-hover flex items-center justify-center"><Save className="w-3.5 h-3.5" /></button>
            <button onClick={() => exec('undo')} title="Undo" className="w-7 h-7 rounded hover:bg-surface-hover flex items-center justify-center"><Undo2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => exec('redo')} title="Redo" className="w-7 h-7 rounded hover:bg-surface-hover flex items-center justify-center"><Redo2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => window.print()} title="Print" className="w-7 h-7 rounded hover:bg-surface-hover flex items-center justify-center"><Printer className="w-3.5 h-3.5" /></button>
          </div>

          {editingName ? (
            <input ref={nameRef} value={docName} onChange={(e) => setDocName(e.target.value)} autoFocus
              onBlur={() => setEditingName(false)} onKeyDown={(e) => { if (e.key === 'Enter') setEditingName(false); }}
              className="text-sm font-semibold bg-transparent border-b-2 border-accent outline-none px-1 min-w-[140px]" />
          ) : (
            <button onClick={() => setEditingName(true)} className="text-sm font-semibold hover:bg-surface-hover rounded px-1.5 py-0.5 truncate max-w-[200px] sm:max-w-[300px]">
              {docName}
            </button>
          )}

          <div className="flex items-center gap-1">
            {saveStatus === 'saved' && <Cloud className="w-3.5 h-3.5 text-green-500" />}
            {saveStatus === 'saving' && <Cloud className="w-3.5 h-3.5 text-accent animate-pulse" />}
            {saveStatus === 'unsaved' && <CloudOff className="w-3.5 h-3.5 text-muted-foreground" />}
            <span className="hidden sm:inline text-[10px] text-muted-foreground">
              {saveStatus === 'saved' ? 'Saved to Cloud' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved changes'}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-surface border border-border rounded-lg px-2.5 py-1 mx-3 w-72">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input placeholder="Search or ask AI..." className="bg-transparent text-xs outline-none flex-1" />
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setShowAI(!showAI)} className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs", showAI ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-surface-hover")}>
            <Sparkles className="w-3.5 h-3.5" /> <span className="hidden sm:inline">AI</span>
          </button>
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:bg-surface-hover">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </div>

      {/* Backstage menu (File button) */}
      <div className="flex items-center px-2 h-7 border-b border-border bg-surface/30 gap-2 flex-shrink-0">
        <button onClick={() => setShowFile(!showFile)}
          className={cn("px-2.5 h-6 rounded text-[11px] font-medium", showFile ? "bg-accent text-accent-foreground" : "bg-foreground text-background hover:opacity-90")}>
          File
        </button>
        <span className="text-[10px] text-muted-foreground hidden md:inline">{docName} · Page {pageCount}</span>
      </div>

      {showFile && (
        <div className="absolute inset-0 z-50 bg-background flex">
          <div className="w-56 bg-foreground text-background p-3 flex flex-col gap-1">
            <button onClick={() => setShowFile(false)} className="self-start mb-3 w-8 h-8 rounded flex items-center justify-center hover:bg-white/10"><ArrowLeft className="w-4 h-4" /></button>
            {[
              { icon: Home, label: 'Home', action: () => navigate('/office/documents') },
              { icon: FilePlus, label: 'New', action: () => navigate('/office/documents/new') },
              { icon: FolderOpen, label: 'Open', action: () => {} },
              { icon: Save, label: 'Save', action: () => setShowFile(false) },
              { icon: FileDown, label: 'Save As', action: () => setShowFile(false) },
              { icon: Download, label: 'Export PDF', action: downloadPDF },
              { icon: FileDown, label: 'Export DOCX', action: downloadDocx },
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
            <p className="text-sm text-muted-foreground mb-6">Recent documents and templates</p>
            <button onClick={() => { setShowFile(false); navigate('/office/documents/new'); }}
              className="px-4 py-2 rounded-lg bg-foreground text-background text-xs">New document</button>
          </div>
        </div>
      )}

      {/* Ribbon */}
      <WordRibbon
        activeTab={activeTab}
        onTabChange={setActiveTab}
        exec={exec}
        activeFormats={activeFormats}
        onInsertImage={handleInsertImage}
        onInsertTable={handleInsertTable}
        onInsertLink={handleInsertLink}
        onAIRewrite={handleAIRewrite}
        onAddPage={() => addPage(activePage)}
        zoom={zoom}
        setZoom={setZoom}
        showRuler={showRuler}
        setShowRuler={setShowRuler}
      />

      {/* Body: editor + AI panel */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Editor area */}
        <div className="flex-1 flex flex-col min-w-0 bg-muted/30 overflow-hidden">
          {/* Ruler */}
          {showRuler && (
            <div className="h-5 bg-surface/40 border-b border-border flex-shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 flex items-end px-[10%]">
                {Array.from({ length: 80 }).map((_, i) => (
                  <div key={i} className="flex-1 border-l border-border/40" style={{ height: i % 5 === 0 ? '8px' : '4px' }} />
                ))}
              </div>
            </div>
          )}

          {/* Doc canvas — multi-page with gaps */}
          <div className="flex-1 overflow-auto py-6 px-4">
            <div className="flex flex-col items-center gap-6">
              {pages.map((html, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-12 top-2 hidden lg:flex flex-col items-center gap-1 text-[10px] text-muted-foreground select-none">
                    <span>Pg {idx + 1}</span>
                    {pages.length > 1 && (
                      <button onClick={() => removePage(idx)} title="Delete page"
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className={cn("bg-card border shadow-sm rounded-sm transition-all",
                    activePage === idx ? "border-accent/40" : "border-border")}
                    style={{ width: `${(816 * zoom) / 100}px`, minHeight: `${(1056 * zoom) / 100}px`, padding: `${(96 * zoom) / 100}px ${(72 * zoom) / 100}px` }}>
                    <div
                      ref={(el) => { pageRefs.current[idx] = el; }}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setActivePage(idx)}
                      onInput={() => { markUnsaved(); updateCounts(); }}
                      onKeyUp={refreshFormats}
                      onMouseUp={refreshFormats}
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); addPage(idx); }
                      }}
                      style={{ fontSize: `${(11 * zoom) / 100}pt`, fontFamily: 'Calibri, sans-serif', lineHeight: 1.5 }}
                      className="outline-none text-foreground min-h-[200px]
                        [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-4
                        [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4
                        [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3
                        [&_blockquote]:border-l-4 [&_blockquote]:border-accent/40 [&_blockquote]:pl-4 [&_blockquote]:italic
                        [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6
                        [&_a]:text-accent [&_a]:underline
                        [&_table]:border-collapse [&_table]:w-full
                        [&_td]:border [&_td]:border-border [&_td]:p-1.5
                        [&_img]:max-w-full [&_img]:my-2"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  </div>
                  {idx < pages.length - 1 && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border/60 select-none">
                      Page Break
                    </div>
                  )}
                </div>
              ))}

              <button onClick={() => addPage(pages.length - 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border hover:border-accent hover:bg-accent/5 text-xs text-muted-foreground hover:text-accent transition-all"
                style={{ width: `${(816 * zoom) / 100}px` }}>
                <FilePlus className="w-3.5 h-3.5" /> Add a new page
              </button>
            </div>
          </div>

          {/* Status bar */}
          <div className="h-6 border-t border-border flex items-center justify-between px-3 bg-surface/40 text-[10px] text-muted-foreground flex-shrink-0 flex-wrap gap-x-4">
            <div className="flex items-center gap-3">
              <span>Page {pageCount} of {pageCount}</span>
              <span>{wordCount} words</span>
              <span className="hidden sm:inline">English (US)</span>
              <span className="hidden md:inline text-green-600">● Spell check</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="w-5 h-5 rounded hover:bg-surface-hover flex items-center justify-center">−</button>
              <span className="w-10 text-center">{zoom}%</span>
              <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="w-5 h-5 rounded hover:bg-surface-hover flex items-center justify-center">+</button>
            </div>
          </div>
        </div>

        {/* AI Right panel - overlay on mobile, side panel on desktop */}
        {showAI && (
          <>
            <button aria-label="Close AI panel" onClick={() => setShowAI(false)} className="md:hidden fixed inset-0 z-30 bg-background/60 backdrop-blur-sm" />
          <aside className="fixed md:relative inset-y-0 right-0 z-40 w-[85vw] max-w-[20rem] md:w-72 lg:w-80 border-l border-border bg-card flex flex-col flex-shrink-0 shadow-2xl md:shadow-none animate-in slide-in-from-right md:animate-none">
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
                    { icon: Wand2, label: 'Rewrite' },
                    { icon: BookOpen, label: 'Summarize' },
                    { icon: Languages, label: 'Translate' },
                    { icon: ListChecks, label: 'Outline' },
                  ].map((q, i) => (
                    <button key={i} onClick={() => setAiPrompt(`${q.label} the selected text`)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] bg-card border border-border hover:border-accent">
                      <q.icon className="w-3 h-3" /> {q.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground">Tip: highlight text and choose an action, or describe what to write.</div>
            </div>

            {/* AI prompt - on the RIGHT (mirrored from Lovable) */}
            <div className="border-t border-border p-2.5 flex-shrink-0">
              <div className="bg-surface border border-border rounded-xl p-2">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask AI to write or edit..."
                  rows={2}
                  className="w-full bg-transparent outline-none resize-none text-xs px-2 py-1 max-h-32"
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

      {/* Floating mini toolbar */}
      {showMini && (
        <div
          className="fixed z-40 bg-card border border-border rounded-lg shadow-xl flex items-center gap-0.5 p-1 -translate-x-1/2 -translate-y-full"
          style={{ left: miniPos.x, top: miniPos.y }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {[
            { icon: Bold, cmd: 'bold' },
            { icon: Italic, cmd: 'italic' },
            { icon: Underline, cmd: 'underline' },
          ].map(b => (
            <button key={b.cmd} onClick={() => exec(b.cmd)} className={cn("w-6 h-6 rounded flex items-center justify-center hover:bg-surface-hover", activeFormats.has(b.cmd) && "bg-accent/15 text-accent")}>
              <b.icon className="w-3 h-3" />
            </button>
          ))}
          <button onClick={() => { const i = document.createElement('input'); i.type='color'; i.onchange=()=>exec('foreColor', i.value); i.click(); }} className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-hover"><Type className="w-3 h-3" /></button>
          <button onClick={() => { const i = document.createElement('input'); i.type='color'; i.value='#ffff00'; i.onchange=()=>exec('hiliteColor', i.value); i.click(); }} className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-hover"><PaintBucket className="w-3 h-3" /></button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button onClick={handleAIRewrite} className="px-2 h-6 rounded text-[10px] font-medium bg-accent/10 text-accent hover:bg-accent/15 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI
          </button>
        </div>
      )}

      {/* Floating voice button */}
      <button onClick={() => setVoice(!voice)}
        className={cn("fixed bottom-16 right-6 w-12 h-12 rounded-full shadow-xl flex items-center justify-center z-30 transition-all",
          voice ? "bg-accent text-white scale-110" : "bg-foreground text-background hover:scale-105")}
        title="Voice dictation"
      >
        <Mic className="w-5 h-5" />
      </button>
    </div>
  );
}
