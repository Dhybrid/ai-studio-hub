import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileSpreadsheet, Presentation, FileText, Download, Share2, Printer,
  MoreHorizontal, ChevronDown, Check, Cloud, CloudOff, Save, FileDown,
  FolderOpen, FilePlus, X, Home, Undo2, Redo2, Scissors, Copy, ClipboardPaste,
  ZoomIn, ZoomOut, Maximize2, Grid3X3, Eye, EyeOff, Ruler, Type, Image,
  Table, Minus, Link2, ListOrdered, List, PaintBucket, Wand2, Mic,
  FileSearch, Replace, SpellCheck, Languages, Settings, HelpCircle, Info,
  BookOpen, Keyboard, MessageSquare, BarChart3, Shapes, StickyNote, Calendar,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Indent, Outdent, Strikethrough, Subscript, Superscript, LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import SpreadsheetEditor from '@/components/office/SpreadsheetEditor';
import DocumentEditor from '@/components/office/DocumentEditor';
import PresentationEditor from '@/components/office/PresentationEditor';

type OfficeMode = 'document' | 'spreadsheet' | 'presentation';

const modeExtensions: Record<OfficeMode, { ext: string; mime: string; label: string }> = {
  document: { ext: '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'Word Document (.docx)' },
  spreadsheet: { ext: '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', label: 'Excel Workbook (.xlsx)' },
  presentation: { ext: '.pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', label: 'PowerPoint (.pptx)' },
};

type MenuKey = 'file' | 'edit' | 'view' | 'insert' | 'format' | 'tools' | 'help' | null;

const OfficeEditor = () => {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode') as OfficeMode | null;
  const mode: OfficeMode = modeParam && ['document', 'spreadsheet', 'presentation'].includes(modeParam) ? modeParam : 'document';
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [docName, setDocName] = useState(() => {
    if (mode === 'document') return 'Untitled Document';
    if (mode === 'spreadsheet') return 'Untitled Spreadsheet';
    return 'Untitled Presentation';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [activeMenu, setActiveMenu] = useState<MenuKey>(null);
  const [zoom, setZoom] = useState(100);
  const [showRuler, setShowRuler] = useState(true);
  const [showGridlines, setShowGridlines] = useState(true);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const modeConfig: Record<OfficeMode, { icon: any; label: string; color: string; homePath: string }> = {
    document: { icon: FileText, label: 'Document', color: 'text-blue-500', homePath: '/office/documents' },
    spreadsheet: { icon: FileSpreadsheet, label: 'Spreadsheet', color: 'text-green-500', homePath: '/office/spreadsheets' },
    presentation: { icon: Presentation, label: 'Presentation', color: 'text-orange-500', homePath: '/office/presentations' },
  };

  const m = modeConfig[mode];

  const markUnsaved = useCallback(() => {
    setSaveStatus('unsaved');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saving');
      setTimeout(() => setSaveStatus('saved'), 800);
    }, 2000);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setSaveStatus('saving');
        setTimeout(() => setSaveStatus('saved'), 800);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleMenu = (menu: MenuKey) => setActiveMenu(prev => prev === menu ? null : menu);

  const handleSave = () => { setSaveStatus('saving'); setTimeout(() => setSaveStatus('saved'), 800); setActiveMenu(null); };

  const handleDownloadPDF = () => {
    const blob = new Blob(['PDF Export - ' + docName], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = docName.replace(/\s+/g, '_') + '.pdf'; a.click();
    URL.revokeObjectURL(url); setActiveMenu(null);
  };

  const handleDownloadNative = () => {
    const ext = modeExtensions[mode];
    const blob = new Blob([`${ext.label} Export - ${docName}`], { type: ext.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = docName.replace(/\s+/g, '_') + ext.ext; a.click();
    URL.revokeObjectURL(url); setActiveMenu(null);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.docx,.xlsx,.pptx,.pdf,.txt,.csv,.jpg,.png,.mp4,.mp3';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) { setDocName(file.name.replace(/\.[^.]+$/, '')); markUnsaved(); }
    };
    input.click(); setActiveMenu(null);
  };

  const handleNameEdit = () => { setIsEditingName(true); setTimeout(() => nameInputRef.current?.select(), 0); };
  const handleNameSubmit = () => {
    setIsEditingName(false);
    if (!docName.trim()) setDocName(mode === 'document' ? 'Untitled Document' : mode === 'spreadsheet' ? 'Untitled Spreadsheet' : 'Untitled Presentation');
    markUnsaved();
  };

  const MenuItem = ({ icon: Icon, label, shortcut, onClick, danger }: { icon?: any; label: string; shortcut?: string; onClick?: () => void; danger?: boolean }) => (
    <button onClick={onClick} className={cn("w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-surface-hover transition-colors", danger ? "text-red-500" : "text-foreground")}>
      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
      {!Icon && <span className="w-3.5" />}
      <span className="flex-1 text-left">{label}</span>
      {shortcut && <span className="text-[10px] text-muted-foreground">{shortcut}</span>}
    </button>
  );

  const MenuSep = () => <div className="h-px bg-border my-1" />;

  const MenuDropdown = ({ children }: { children: React.ReactNode }) => (
    <div className="absolute top-full left-0 mt-0.5 bg-card border border-border rounded-lg shadow-xl z-50 py-1 w-56 max-h-[70vh] overflow-y-auto">
      {children}
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top bar: icon + name + save status */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-border bg-background flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button onClick={() => navigate(m.homePath)} className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-hover" title={`${m.label} Home`}>
            <m.icon className={cn("w-4 h-4", m.color)} />
          </button>

          {isEditingName ? (
            <input ref={nameInputRef} value={docName} onChange={(e) => setDocName(e.target.value)}
              onBlur={handleNameSubmit} onKeyDown={(e) => { if (e.key === 'Enter') handleNameSubmit(); if (e.key === 'Escape') setIsEditingName(false); }}
              className="text-sm font-semibold text-foreground bg-transparent border-b-2 border-accent outline-none px-1 py-0.5 min-w-[120px] max-w-[300px]" />
          ) : (
            <button onClick={handleNameEdit} className="text-sm font-semibold text-foreground hover:bg-surface-hover rounded px-1.5 py-0.5 truncate max-w-[200px] sm:max-w-[300px]" title="Click to rename">
              {docName}
            </button>
          )}

          <div className="flex items-center gap-1 flex-shrink-0">
            {saveStatus === 'saved' && <Cloud className="w-3.5 h-3.5 text-green-500" />}
            {saveStatus === 'saving' && <Cloud className="w-3.5 h-3.5 text-accent animate-pulse" />}
            {saveStatus === 'unsaved' && <CloudOff className="w-3.5 h-3.5 text-muted-foreground" />}
            {!isMobile && (
              <span className={cn("text-[10px]", saveStatus === 'saved' ? "text-green-500" : saveStatus === 'saving' ? "text-accent" : "text-muted-foreground")}>
                {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {!isMobile && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-surface-hover transition-colors">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          )}
          {isMobile && (
            <>
              <button onClick={handleSave} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-hover text-muted-foreground"><Save className="w-4 h-4" /></button>
              <button onClick={() => toggleMenu(activeMenu === 'file' ? null : 'file')} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-hover text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></button>
            </>
          )}
        </div>
      </div>

      {/* Menu bar */}
      {!isMobile && (
        <div ref={menuBarRef} className="h-8 flex items-center px-3 border-b border-border bg-surface/30 flex-shrink-0">
          <div className="flex items-center gap-0">
            {/* File */}
            <div className="relative">
              <button onClick={() => toggleMenu('file')} className={cn("px-2.5 py-1 rounded text-xs transition-colors", activeMenu === 'file' ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground")}>File</button>
              {activeMenu === 'file' && (
                <MenuDropdown>
                  <MenuItem icon={Home} label={`${m.label} Home`} onClick={() => { navigate(m.homePath); setActiveMenu(null); }} />
                  <MenuItem icon={FolderOpen} label="Office Home" onClick={() => { navigate('/office'); setActiveMenu(null); }} />
                  <MenuSep />
                  <MenuItem icon={FilePlus} label={`New ${m.label}`} onClick={() => { navigate(mode === 'document' ? '/office/documents/new' : `/office/new?mode=${mode}`); setActiveMenu(null); }} />
                  <MenuItem icon={FolderOpen} label="Import File..." shortcut="Ctrl+O" onClick={handleImport} />
                  <MenuSep />
                  <MenuItem icon={Save} label="Save" shortcut="Ctrl+S" onClick={handleSave} />
                  <MenuItem icon={Save} label="Save As..." onClick={handleSave} />
                  <MenuSep />
                  <MenuItem icon={FileDown} label="Download as PDF" onClick={handleDownloadPDF} />
                  <MenuItem icon={FileDown} label={`Download as ${modeExtensions[mode].label}`} onClick={handleDownloadNative} />
                  <MenuItem icon={Download} label="Download as HTML" onClick={() => { setActiveMenu(null); }} />
                  <MenuSep />
                  <MenuItem icon={Printer} label="Print" shortcut="Ctrl+P" onClick={() => { window.print(); setActiveMenu(null); }} />
                </MenuDropdown>
              )}
            </div>

            {/* Edit */}
            <div className="relative">
              <button onClick={() => toggleMenu('edit')} className={cn("px-2.5 py-1 rounded text-xs transition-colors", activeMenu === 'edit' ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground")}>Edit</button>
              {activeMenu === 'edit' && (
                <MenuDropdown>
                  <MenuItem icon={Undo2} label="Undo" shortcut="Ctrl+Z" onClick={() => { document.execCommand('undo'); setActiveMenu(null); }} />
                  <MenuItem icon={Redo2} label="Redo" shortcut="Ctrl+Y" onClick={() => { document.execCommand('redo'); setActiveMenu(null); }} />
                  <MenuSep />
                  <MenuItem icon={Scissors} label="Cut" shortcut="Ctrl+X" onClick={() => { document.execCommand('cut'); setActiveMenu(null); }} />
                  <MenuItem icon={Copy} label="Copy" shortcut="Ctrl+C" onClick={() => { document.execCommand('copy'); setActiveMenu(null); }} />
                  <MenuItem icon={ClipboardPaste} label="Paste" shortcut="Ctrl+V" onClick={() => { document.execCommand('paste'); setActiveMenu(null); }} />
                  <MenuItem icon={ClipboardPaste} label="Paste without formatting" shortcut="Ctrl+Shift+V" onClick={() => { document.execCommand('insertText', false, ''); setActiveMenu(null); }} />
                  <MenuSep />
                  <MenuItem label="Select All" shortcut="Ctrl+A" onClick={() => { document.execCommand('selectAll'); setActiveMenu(null); }} />
                  <MenuSep />
                  <MenuItem icon={FileSearch} label="Find" shortcut="Ctrl+F" onClick={() => setActiveMenu(null)} />
                  <MenuItem icon={Replace} label="Find and Replace" shortcut="Ctrl+H" onClick={() => setActiveMenu(null)} />
                </MenuDropdown>
              )}
            </div>

            {/* View */}
            <div className="relative">
              <button onClick={() => toggleMenu('view')} className={cn("px-2.5 py-1 rounded text-xs transition-colors", activeMenu === 'view' ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground")}>View</button>
              {activeMenu === 'view' && (
                <MenuDropdown>
                  <MenuItem icon={ZoomIn} label="Zoom In" shortcut="Ctrl+=" onClick={() => { setZoom(z => Math.min(z + 10, 200)); setActiveMenu(null); }} />
                  <MenuItem icon={ZoomOut} label="Zoom Out" shortcut="Ctrl+-" onClick={() => { setZoom(z => Math.max(z - 10, 50)); setActiveMenu(null); }} />
                  <MenuItem label={`Zoom: ${zoom}%`} onClick={() => { setZoom(100); setActiveMenu(null); }} />
                  <MenuSep />
                  <MenuItem icon={Maximize2} label="Full Screen" shortcut="F11" onClick={() => { document.documentElement.requestFullscreen?.(); setActiveMenu(null); }} />
                  <MenuSep />
                  {mode === 'document' && <MenuItem icon={showRuler ? Eye : EyeOff} label={showRuler ? 'Hide Ruler' : 'Show Ruler'} onClick={() => { setShowRuler(!showRuler); setActiveMenu(null); }} />}
                  {mode === 'spreadsheet' && <MenuItem icon={Grid3X3} label={showGridlines ? 'Hide Gridlines' : 'Show Gridlines'} onClick={() => { setShowGridlines(!showGridlines); setActiveMenu(null); }} />}
                  {mode === 'spreadsheet' && <MenuItem icon={Minus} label="Freeze Panes" onClick={() => setActiveMenu(null)} />}
                  {mode === 'presentation' && <MenuItem icon={LayoutGrid} label="Slide Sorter" onClick={() => setActiveMenu(null)} />}
                  {mode === 'presentation' && <MenuItem icon={StickyNote} label="Speaker Notes" onClick={() => setActiveMenu(null)} />}
                </MenuDropdown>
              )}
            </div>

            {/* Insert */}
            <div className="relative">
              <button onClick={() => toggleMenu('insert')} className={cn("px-2.5 py-1 rounded text-xs transition-colors", activeMenu === 'insert' ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground")}>Insert</button>
              {activeMenu === 'insert' && (
                <MenuDropdown>
                  {mode === 'document' && (
                    <>
                      <MenuItem icon={Image} label="Image" onClick={() => setActiveMenu(null)} />
                      <MenuItem icon={Table} label="Table" onClick={() => setActiveMenu(null)} />
                      <MenuItem icon={Link2} label="Link" shortcut="Ctrl+K" onClick={() => setActiveMenu(null)} />
                      <MenuItem icon={Minus} label="Horizontal Line" onClick={() => { document.execCommand('insertHorizontalRule'); setActiveMenu(null); }} />
                      <MenuItem icon={BarChart3} label="Chart" onClick={() => setActiveMenu(null)} />
                      <MenuItem icon={Calendar} label="Date" onClick={() => { document.execCommand('insertText', false, new Date().toLocaleDateString()); setActiveMenu(null); }} />
                      <MenuSep />
                      <MenuItem label="Header" onClick={() => setActiveMenu(null)} />
                      <MenuItem label="Footer" onClick={() => setActiveMenu(null)} />
                      <MenuItem label="Page Number" onClick={() => setActiveMenu(null)} />
                      <MenuItem label="Page Break" onClick={() => setActiveMenu(null)} />
                      <MenuSep />
                      <MenuItem icon={MessageSquare} label="Comment" shortcut="Ctrl+Alt+M" onClick={() => setActiveMenu(null)} />
                      <MenuItem icon={StickyNote} label="Footnote" onClick={() => setActiveMenu(null)} />
                    </>
                  )}
                  {mode === 'spreadsheet' && (
                    <>
                      <MenuItem icon={BarChart3} label="Chart" onClick={() => setActiveMenu(null)} />
                      <MenuItem icon={Image} label="Image" onClick={() => setActiveMenu(null)} />
                      <MenuItem icon={Link2} label="Link" shortcut="Ctrl+K" onClick={() => setActiveMenu(null)} />
                      <MenuItem icon={MessageSquare} label="Comment" onClick={() => setActiveMenu(null)} />
                      <MenuSep />
                      <MenuItem label="Row Above" onClick={() => setActiveMenu(null)} />
                      <MenuItem label="Row Below" onClick={() => setActiveMenu(null)} />
                      <MenuItem label="Column Left" onClick={() => setActiveMenu(null)} />
                      <MenuItem label="Column Right" onClick={() => setActiveMenu(null)} />
                      <MenuSep />
                      <MenuItem label="Function" shortcut="Ctrl+Shift+F" onClick={() => setActiveMenu(null)} />
                    </>
                  )}
                  {mode === 'presentation' && (
                    <>
                      <MenuItem label="New Slide" shortcut="Ctrl+M" onClick={() => setActiveMenu(null)} />
                      <MenuItem label="Duplicate Slide" onClick={() => setActiveMenu(null)} />
                      <MenuSep />
                      <MenuItem icon={Type} label="Text Box" onClick={() => setActiveMenu(null)} />
                      <MenuItem icon={Image} label="Image" onClick={() => setActiveMenu(null)} />
                      <MenuItem icon={Shapes} label="Shape" onClick={() => setActiveMenu(null)} />
                      <MenuItem icon={BarChart3} label="Chart" onClick={() => setActiveMenu(null)} />
                      <MenuItem icon={Table} label="Table" onClick={() => setActiveMenu(null)} />
                      <MenuItem icon={Link2} label="Link" shortcut="Ctrl+K" onClick={() => setActiveMenu(null)} />
                      <MenuSep />
                      <MenuItem label="Video" onClick={() => setActiveMenu(null)} />
                      <MenuItem label="Audio" onClick={() => setActiveMenu(null)} />
                    </>
                  )}
                </MenuDropdown>
              )}
            </div>

            {/* Format */}
            <div className="relative">
              <button onClick={() => toggleMenu('format')} className={cn("px-2.5 py-1 rounded text-xs transition-colors", activeMenu === 'format' ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground")}>Format</button>
              {activeMenu === 'format' && (
                <MenuDropdown>
                  {(mode === 'document' || mode === 'presentation') && (
                    <>
                      <MenuItem icon={Bold} label="Bold" shortcut="Ctrl+B" onClick={() => { document.execCommand('bold'); setActiveMenu(null); }} />
                      <MenuItem icon={Italic} label="Italic" shortcut="Ctrl+I" onClick={() => { document.execCommand('italic'); setActiveMenu(null); }} />
                      <MenuItem icon={Underline} label="Underline" shortcut="Ctrl+U" onClick={() => { document.execCommand('underline'); setActiveMenu(null); }} />
                      <MenuItem icon={Strikethrough} label="Strikethrough" onClick={() => { document.execCommand('strikeThrough'); setActiveMenu(null); }} />
                      <MenuItem icon={Superscript} label="Superscript" onClick={() => { document.execCommand('superscript'); setActiveMenu(null); }} />
                      <MenuItem icon={Subscript} label="Subscript" onClick={() => { document.execCommand('subscript'); setActiveMenu(null); }} />
                      <MenuSep />
                      <MenuItem icon={AlignLeft} label="Align Left" onClick={() => { document.execCommand('justifyLeft'); setActiveMenu(null); }} />
                      <MenuItem icon={AlignCenter} label="Align Center" onClick={() => { document.execCommand('justifyCenter'); setActiveMenu(null); }} />
                      <MenuItem icon={AlignRight} label="Align Right" onClick={() => { document.execCommand('justifyRight'); setActiveMenu(null); }} />
                      <MenuItem icon={AlignJustify} label="Justify" onClick={() => { document.execCommand('justifyFull'); setActiveMenu(null); }} />
                      <MenuSep />
                      <MenuItem icon={List} label="Bulleted List" onClick={() => { document.execCommand('insertUnorderedList'); setActiveMenu(null); }} />
                      <MenuItem icon={ListOrdered} label="Numbered List" onClick={() => { document.execCommand('insertOrderedList'); setActiveMenu(null); }} />
                      <MenuItem icon={Indent} label="Increase Indent" onClick={() => { document.execCommand('indent'); setActiveMenu(null); }} />
                      <MenuItem icon={Outdent} label="Decrease Indent" onClick={() => { document.execCommand('outdent'); setActiveMenu(null); }} />
                      <MenuSep />
                      <MenuItem label="Clear Formatting" shortcut="Ctrl+\\" onClick={() => { document.execCommand('removeFormat'); setActiveMenu(null); }} />
                    </>
                  )}
                  {mode === 'spreadsheet' && (
                    <>
                      <MenuItem icon={Bold} label="Bold" shortcut="Ctrl+B" onClick={() => setActiveMenu(null)} />
                      <MenuItem icon={Italic} label="Italic" shortcut="Ctrl+I" onClick={() => setActiveMenu(null)} />
                      <MenuItem icon={Underline} label="Underline" shortcut="Ctrl+U" onClick={() => setActiveMenu(null)} />
                      <MenuSep />
                      <MenuItem label="Number" onClick={() => setActiveMenu(null)} />
                      <MenuItem label="Currency" onClick={() => setActiveMenu(null)} />
                      <MenuItem label="Percentage" onClick={() => setActiveMenu(null)} />
                      <MenuItem label="Date" onClick={() => setActiveMenu(null)} />
                      <MenuItem label="Time" onClick={() => setActiveMenu(null)} />
                      <MenuSep />
                      <MenuItem label="Conditional Formatting" onClick={() => setActiveMenu(null)} />
                      <MenuItem label="Cell Borders" onClick={() => setActiveMenu(null)} />
                      <MenuItem label="Merge Cells" onClick={() => setActiveMenu(null)} />
                    </>
                  )}
                </MenuDropdown>
              )}
            </div>

            {/* Tools */}
            <div className="relative">
              <button onClick={() => toggleMenu('tools')} className={cn("px-2.5 py-1 rounded text-xs transition-colors", activeMenu === 'tools' ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground")}>Tools</button>
              {activeMenu === 'tools' && (
                <MenuDropdown>
                  <MenuItem icon={SpellCheck} label="Spelling & Grammar" onClick={() => setActiveMenu(null)} />
                  <MenuItem icon={Languages} label="Translate" onClick={() => setActiveMenu(null)} />
                  <MenuItem icon={Type} label="Word Count" onClick={() => setActiveMenu(null)} />
                  <MenuSep />
                  <MenuItem icon={Wand2} label="AI Assistant" onClick={() => setActiveMenu(null)} />
                  <MenuItem icon={Mic} label="Voice Typing" onClick={() => setActiveMenu(null)} />
                  <MenuSep />
                  {mode === 'spreadsheet' && (
                    <>
                      <MenuItem label="Macros" onClick={() => setActiveMenu(null)} />
                      <MenuItem label="Data Validation" onClick={() => setActiveMenu(null)} />
                      <MenuItem label="Pivot Table" onClick={() => setActiveMenu(null)} />
                      <MenuSep />
                    </>
                  )}
                  <MenuItem icon={Settings} label="Preferences" onClick={() => setActiveMenu(null)} />
                </MenuDropdown>
              )}
            </div>

            {/* Help */}
            <div className="relative">
              <button onClick={() => toggleMenu('help')} className={cn("px-2.5 py-1 rounded text-xs transition-colors", activeMenu === 'help' ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground")}>Help</button>
              {activeMenu === 'help' && (
                <MenuDropdown>
                  <MenuItem icon={HelpCircle} label="Help Center" onClick={() => setActiveMenu(null)} />
                  <MenuItem icon={BookOpen} label="Documentation" onClick={() => setActiveMenu(null)} />
                  <MenuItem icon={Keyboard} label="Keyboard Shortcuts" onClick={() => setActiveMenu(null)} />
                  <MenuSep />
                  <MenuItem icon={MessageSquare} label="Send Feedback" onClick={() => setActiveMenu(null)} />
                  <MenuItem icon={Info} label="About Eruwa Office" onClick={() => setActiveMenu(null)} />
                </MenuDropdown>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile file menu overlay */}
      {isMobile && activeMenu === 'file' && (
        <div className="absolute top-11 right-2 bg-card border border-border rounded-lg shadow-xl z-50 py-1 w-52">
          <MenuItem icon={Home} label={`${m.label} Home`} onClick={() => { navigate(m.homePath); setActiveMenu(null); }} />
          <MenuItem icon={FolderOpen} label="Office Home" onClick={() => { navigate('/office'); setActiveMenu(null); }} />
          <MenuSep />
          <MenuItem icon={FilePlus} label={`New ${m.label}`} onClick={() => { navigate(mode === 'document' ? '/office/documents/new' : `/office/new?mode=${mode}`); setActiveMenu(null); }} />
          <MenuItem icon={FolderOpen} label="Import File" onClick={handleImport} />
          <MenuItem icon={FileDown} label="Download PDF" onClick={handleDownloadPDF} />
          <MenuItem icon={FileDown} label={`Download ${modeExtensions[mode].ext}`} onClick={handleDownloadNative} />
          <MenuSep />
          <MenuItem icon={Printer} label="Print" onClick={() => { window.print(); setActiveMenu(null); }} />
        </div>
      )}

      {mode === 'document' && <DocumentEditor isMobile={isMobile} onContentChange={markUnsaved} />}
      {mode === 'spreadsheet' && <SpreadsheetEditor isMobile={isMobile} onContentChange={markUnsaved} />}
      {mode === 'presentation' && <PresentationEditor isMobile={isMobile} onContentChange={markUnsaved} />}
    </div>
  );
};

export default OfficeEditor;
