import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileSpreadsheet, Presentation, FileText, Download, Share2, Printer,
  MoreHorizontal, ChevronDown, Check, Cloud, CloudOff, Save, FileDown,
  FolderOpen, FilePlus, X
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
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileMenuRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const modeConfig: Record<OfficeMode, { icon: any; label: string; color: string }> = {
    document: { icon: FileText, label: 'Document', color: 'text-blue-500' },
    spreadsheet: { icon: FileSpreadsheet, label: 'Spreadsheet', color: 'text-green-500' },
    presentation: { icon: Presentation, label: 'Presentation', color: 'text-orange-500' },
  };

  const m = modeConfig[mode];

  // Mark as unsaved on any content change
  const markUnsaved = useCallback(() => {
    setSaveStatus('unsaved');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saving');
      setTimeout(() => setSaveStatus('saved'), 800);
    }, 2000);
  }, []);

  // Intercept Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setSaveStatus('saving');
        setTimeout(() => setSaveStatus('saved'), 800);
      }
      // Ctrl+P for print
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) {
        setShowFileMenu(false);
      }
      setShowEditMenu(false);
      setShowViewMenu(false);
      setShowInsertMenu(false);
      setShowFormatMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 800);
    setShowFileMenu(false);
  };

  const handleDownloadPDF = () => {
    // Create a dummy PDF download
    const blob = new Blob(['PDF Export - ' + docName], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docName.replace(/\s+/g, '_') + '.pdf';
    a.click();
    URL.revokeObjectURL(url);
    setShowFileMenu(false);
  };

  const handleDownloadNative = () => {
    const ext = modeExtensions[mode];
    const blob = new Blob([`${ext.label} Export - ${docName}`], { type: ext.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docName.replace(/\s+/g, '_') + ext.ext;
    a.click();
    URL.revokeObjectURL(url);
    setShowFileMenu(false);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.docx,.xlsx,.pptx,.pdf,.txt,.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setDocName(file.name.replace(/\.[^.]+$/, ''));
        markUnsaved();
      }
    };
    input.click();
    setShowFileMenu(false);
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 0);
  };

  const handleNameSubmit = () => {
    setIsEditingName(false);
    if (!docName.trim()) {
      setDocName(mode === 'document' ? 'Untitled Document' : mode === 'spreadsheet' ? 'Untitled Spreadsheet' : 'Untitled Presentation');
    }
    markUnsaved();
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header bar */}
      <div className="h-11 flex items-center justify-between px-3 sm:px-4 border-b border-border bg-background flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <m.icon className={cn("w-4 h-4 flex-shrink-0", m.color)} />

          {/* Editable document name */}
          {isEditingName ? (
            <input
              ref={nameInputRef}
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => { if (e.key === 'Enter') handleNameSubmit(); if (e.key === 'Escape') { setIsEditingName(false); } }}
              className="text-sm font-semibold text-foreground bg-transparent border-b-2 border-accent outline-none px-1 py-0.5 min-w-[120px] max-w-[300px]"
            />
          ) : (
            <button onClick={handleNameEdit} className="text-sm font-semibold text-foreground hover:bg-surface-hover rounded px-1.5 py-0.5 truncate max-w-[200px] sm:max-w-[300px]" title="Click to rename">
              {docName}
            </button>
          )}

          {/* Save status */}
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

          {/* Menu bar */}
          {!isMobile && (
            <>
              <div className="w-px h-5 bg-border ml-1" />
              <div className="flex items-center gap-0.5 ml-1 relative">
                {/* File Menu */}
                <div className="relative" ref={fileMenuRef}>
                  <button
                    onClick={() => { setShowFileMenu(!showFileMenu); setShowEditMenu(false); setShowViewMenu(false); }}
                    className={cn("px-2 py-1 rounded text-xs transition-colors", showFileMenu ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground")}
                  >File</button>
                  {showFileMenu && (
                    <div className="absolute top-7 left-0 bg-card border border-border rounded-lg shadow-xl z-50 py-1 w-56">
                      <button onClick={() => navigate('/office')} className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-surface-hover text-foreground">
                        <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" /> Open Office Home
                      </button>
                      <div className="h-px bg-border my-1" />
                      <button onClick={() => { navigate(`/office/new?mode=${mode}`); setShowFileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-surface-hover text-foreground">
                        <FilePlus className="w-3.5 h-3.5 text-muted-foreground" /> New {m.label}
                      </button>
                      <button onClick={handleImport} className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-surface-hover text-foreground">
                        <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" /> Import File...
                      </button>
                      <div className="h-px bg-border my-1" />
                      <button onClick={handleSave} className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-surface-hover text-foreground">
                        <Save className="w-3.5 h-3.5 text-muted-foreground" /> Save
                        <span className="ml-auto text-[10px] text-muted-foreground">Ctrl+S</span>
                      </button>
                      <div className="h-px bg-border my-1" />
                      <button onClick={handleDownloadPDF} className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-surface-hover text-foreground">
                        <FileDown className="w-3.5 h-3.5 text-muted-foreground" /> Download as PDF
                      </button>
                      <button onClick={handleDownloadNative} className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-surface-hover text-foreground">
                        <FileDown className="w-3.5 h-3.5 text-muted-foreground" /> Download as {modeExtensions[mode].label}
                      </button>
                      <div className="h-px bg-border my-1" />
                      <button onClick={() => { window.print(); setShowFileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-surface-hover text-foreground">
                        <Printer className="w-3.5 h-3.5 text-muted-foreground" /> Print
                        <span className="ml-auto text-[10px] text-muted-foreground">Ctrl+P</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Edit Menu */}
                <div className="relative">
                  <button
                    onClick={() => { setShowEditMenu(!showEditMenu); setShowFileMenu(false); setShowViewMenu(false); }}
                    className={cn("px-2 py-1 rounded text-xs transition-colors", showEditMenu ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-surface-hover hover:text-foreground")}
                  >Edit</button>
                  {showEditMenu && (
                    <div className="absolute top-7 left-0 bg-card border border-border rounded-lg shadow-xl z-50 py-1 w-48">
                      <button onClick={() => { document.execCommand('undo'); setShowEditMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-surface-hover text-foreground">
                        Undo <span className="ml-auto text-[10px] text-muted-foreground">Ctrl+Z</span>
                      </button>
                      <button onClick={() => { document.execCommand('redo'); setShowEditMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-surface-hover text-foreground">
                        Redo <span className="ml-auto text-[10px] text-muted-foreground">Ctrl+Y</span>
                      </button>
                      <div className="h-px bg-border my-1" />
                      <button onClick={() => { document.execCommand('cut'); setShowEditMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-surface-hover text-foreground">
                        Cut <span className="ml-auto text-[10px] text-muted-foreground">Ctrl+X</span>
                      </button>
                      <button onClick={() => { document.execCommand('copy'); setShowEditMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-surface-hover text-foreground">
                        Copy <span className="ml-auto text-[10px] text-muted-foreground">Ctrl+C</span>
                      </button>
                      <button onClick={() => { document.execCommand('paste'); setShowEditMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-surface-hover text-foreground">
                        Paste <span className="ml-auto text-[10px] text-muted-foreground">Ctrl+V</span>
                      </button>
                      <div className="h-px bg-border my-1" />
                      <button onClick={() => { document.execCommand('selectAll'); setShowEditMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-surface-hover text-foreground">
                        Select All <span className="ml-auto text-[10px] text-muted-foreground">Ctrl+A</span>
                      </button>
                    </div>
                  )}
                </div>

                {['View', 'Insert', 'Format', 'Tools', 'Help'].map(menu => (
                  <button key={menu} className="px-2 py-1 rounded text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors">{menu}</button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {!isMobile && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-surface-hover transition-colors">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          )}
          {isMobile && (
            <>
              <button onClick={handleSave} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-hover text-muted-foreground">
                <Save className="w-4 h-4" />
              </button>
              <button onClick={() => setShowFileMenu(!showFileMenu)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-hover text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {/* Mobile file menu */}
              {showFileMenu && (
                <div className="absolute top-11 right-2 bg-card border border-border rounded-lg shadow-xl z-50 py-1 w-52">
                  <button onClick={() => navigate('/office')} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs hover:bg-surface-hover text-foreground">
                    <FolderOpen className="w-3.5 h-3.5" /> Open Office Home
                  </button>
                  <button onClick={handleImport} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs hover:bg-surface-hover text-foreground">
                    <FolderOpen className="w-3.5 h-3.5" /> Import File
                  </button>
                  <div className="h-px bg-border my-1" />
                  <button onClick={handleDownloadPDF} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs hover:bg-surface-hover text-foreground">
                    <FileDown className="w-3.5 h-3.5" /> Download PDF
                  </button>
                  <button onClick={handleDownloadNative} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs hover:bg-surface-hover text-foreground">
                    <FileDown className="w-3.5 h-3.5" /> Download {modeExtensions[mode].ext}
                  </button>
                  <div className="h-px bg-border my-1" />
                  <button onClick={() => { window.print(); setShowFileMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs hover:bg-surface-hover text-foreground">
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {mode === 'document' && <DocumentEditor isMobile={isMobile} onContentChange={markUnsaved} />}
      {mode === 'spreadsheet' && <SpreadsheetEditor isMobile={isMobile} onContentChange={markUnsaved} />}
      {mode === 'presentation' && <PresentationEditor isMobile={isMobile} onContentChange={markUnsaved} />}
    </div>
  );
};

export default OfficeEditor;
