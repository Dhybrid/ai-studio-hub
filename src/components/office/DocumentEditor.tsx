import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo2, Redo2, List, ListOrdered, Link2, Image, Table, Minus, Type, PaintBucket,
  Heading1, Heading2, Heading3, Pilcrow, Quote, Code, Wand2, Loader2, Mic
} from 'lucide-react';
import { cn } from '@/lib/utils';

const formatCommands = [
  { cmd: 'undo', icon: Undo2, label: 'Undo', shortcut: 'Ctrl+Z' },
  { cmd: 'redo', icon: Redo2, label: 'Redo', shortcut: 'Ctrl+Y' },
  null,
  { cmd: 'bold', icon: Bold, label: 'Bold', shortcut: 'Ctrl+B' },
  { cmd: 'italic', icon: Italic, label: 'Italic', shortcut: 'Ctrl+I' },
  { cmd: 'underline', icon: Underline, label: 'Underline', shortcut: 'Ctrl+U' },
  { cmd: 'strikeThrough', icon: Strikethrough, label: 'Strikethrough' },
  null,
  { cmd: 'justifyLeft', icon: AlignLeft, label: 'Align Left' },
  { cmd: 'justifyCenter', icon: AlignCenter, label: 'Center' },
  { cmd: 'justifyRight', icon: AlignRight, label: 'Align Right' },
  { cmd: 'justifyFull', icon: AlignJustify, label: 'Justify' },
  null,
  { cmd: 'insertUnorderedList', icon: List, label: 'Bullet List' },
  { cmd: 'insertOrderedList', icon: ListOrdered, label: 'Numbered List' },
  null,
  { cmd: 'insertHorizontalRule', icon: Minus, label: 'Horizontal Rule' },
  { cmd: 'createLink', icon: Link2, label: 'Insert Link' },
] as const;

type FormatCmd = (typeof formatCommands)[number];

const fontFamilies = ['Arial', 'Calibri', 'Times New Roman', 'Georgia', 'Courier New', 'Verdana', 'Trebuchet MS', 'Comic Sans MS'];
const fontSizes = ['1', '2', '3', '4', '5', '6', '7'];
const fontSizeLabels = ['8', '10', '12', '14', '18', '24', '36'];

const DocumentEditor = ({ isMobile }: { isMobile: boolean }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [currentBlock, setCurrentBlock] = useState('p');
  const [currentFont, setCurrentFont] = useState('Arial');
  const [currentSize, setCurrentSize] = useState('3');
  const [showVoice, setShowVoice] = useState(false);

  const exec = useCallback((cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    updateActiveFormats();
  }, []);

  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    if (document.queryCommandState('strikeThrough')) formats.add('strikeThrough');
    if (document.queryCommandState('insertUnorderedList')) formats.add('insertUnorderedList');
    if (document.queryCommandState('insertOrderedList')) formats.add('insertOrderedList');
    if (document.queryCommandState('justifyLeft')) formats.add('justifyLeft');
    if (document.queryCommandState('justifyCenter')) formats.add('justifyCenter');
    if (document.queryCommandState('justifyRight')) formats.add('justifyRight');
    if (document.queryCommandState('justifyFull')) formats.add('justifyFull');

    const block = document.queryCommandValue('formatBlock');
    setCurrentBlock(block || 'p');
    setActiveFormats(formats);
  }, []);

  const handleBlockChange = (value: string) => {
    exec('formatBlock', value);
    setCurrentBlock(value);
  };

  const handleFontChange = (value: string) => {
    exec('fontName', value);
    setCurrentFont(value);
  };

  const handleSizeChange = (value: string) => {
    exec('fontSize', value);
    setCurrentSize(value);
  };

  const handleToolbarClick = (cmd: string) => {
    if (cmd === 'createLink') {
      const url = prompt('Enter URL:');
      if (url) exec('createLink', url);
    } else {
      exec(cmd);
    }
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const handler = () => updateActiveFormats();
    editor.addEventListener('keyup', handler);
    editor.addEventListener('mouseup', handler);
    document.addEventListener('selectionchange', handler);
    return () => {
      editor.removeEventListener('keyup', handler);
      editor.removeEventListener('mouseup', handler);
      document.removeEventListener('selectionchange', handler);
    };
  }, [updateActiveFormats]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar Row 1: Block, Font, Size */}
      <div className="border-b border-border flex items-center gap-1 px-2 sm:px-3 py-1 overflow-x-auto flex-shrink-0 bg-surface/50">
        <select
          value={currentBlock}
          onChange={(e) => handleBlockChange(e.target.value)}
          className="text-xs bg-transparent border border-border rounded px-1.5 py-1 text-foreground flex-shrink-0 w-24"
        >
          <option value="p">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="blockquote">Quote</option>
          <option value="pre">Code</option>
        </select>
        <div className="w-px h-5 bg-border mx-0.5" />
        <select
          value={currentFont}
          onChange={(e) => handleFontChange(e.target.value)}
          className="text-xs bg-transparent border border-border rounded px-1.5 py-1 text-foreground flex-shrink-0 w-28"
        >
          {fontFamilies.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select
          value={currentSize}
          onChange={(e) => handleSizeChange(e.target.value)}
          className="text-xs bg-transparent border border-border rounded px-1.5 py-1 text-foreground flex-shrink-0 w-14"
        >
          {fontSizes.map((s, i) => <option key={s} value={s}>{fontSizeLabels[i]}</option>)}
        </select>
      </div>

      {/* Toolbar Row 2: Format buttons */}
      <div className="border-b border-border flex items-center gap-0.5 px-2 sm:px-3 py-1 overflow-x-auto flex-shrink-0 bg-surface/50">
        {formatCommands.map((btn, i) =>
          btn === null
            ? <div key={i} className="w-px h-5 bg-border mx-0.5 flex-shrink-0" />
            : <button
                key={i}
                title={`${btn.label}${btn.shortcut ? ` (${btn.shortcut})` : ''}`}
                onClick={() => handleToolbarClick(btn.cmd)}
                className={cn(
                  "w-7 h-7 rounded flex items-center justify-center flex-shrink-0 transition-colors",
                  activeFormats.has(btn.cmd)
                    ? "bg-accent/15 text-accent"
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                )}
              >
                <btn.icon className="w-3.5 h-3.5" />
              </button>
        )}
        <div className="w-px h-5 bg-border mx-0.5 flex-shrink-0" />
        <button
          title="Text Color"
          onClick={() => {
            const c = prompt('Enter color (hex or name):');
            if (c) exec('foreColor', c);
          }}
          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:bg-surface-hover flex-shrink-0"
        >
          <Type className="w-3.5 h-3.5" />
        </button>
        <button
          title="Highlight"
          onClick={() => {
            const c = prompt('Enter highlight color:', 'yellow');
            if (c) exec('hiliteColor', c);
          }}
          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:bg-surface-hover flex-shrink-0"
        >
          <PaintBucket className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 overflow-auto bg-muted/30 flex justify-center p-4 sm:p-8 relative">
        <div
          className={cn(
            "bg-card border border-border shadow-sm rounded-sm",
            isMobile ? "w-full min-h-[500px]" : "w-[816px] min-h-[1056px]"
          )}
          style={{ padding: isMobile ? '24px' : '96px 72px' }}
        >
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="outline-none text-foreground text-sm leading-relaxed min-h-[200px] prose prose-sm max-w-none
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4
              [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3
              [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2
              [&_h4]:text-base [&_h4]:font-medium [&_h4]:mb-2
              [&_blockquote]:border-l-4 [&_blockquote]:border-accent/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
              [&_pre]:bg-muted/50 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:text-xs [&_pre]:font-mono
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-2
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-2
              [&_li]:mb-1
              [&_a]:text-accent [&_a]:underline
              [&_hr]:border-border [&_hr]:my-4"
            dangerouslySetInnerHTML={{ __html: `
              <h1>Untitled Document</h1>
              <p>Start typing here. Use the toolbar above to format your text — <b>bold</b>, <i>italic</i>, <u>underline</u>, headings, lists, and more.</p>
              <p></p>
            ` }}
          />
        </div>

        {/* Floating voice button */}
        <button
          onClick={() => setShowVoice(!showVoice)}
          className={cn(
            "fixed bottom-24 right-6 w-12 h-12 rounded-full shadow-lg flex items-center justify-center z-50 transition-all",
            showVoice ? "bg-accent text-white scale-110" : "bg-foreground text-background hover:scale-105"
          )}
          title="Voice input"
        >
          <Mic className="w-5 h-5" />
        </button>
        {showVoice && (
          <div className="fixed bottom-40 right-6 w-64 bg-card border border-border rounded-xl shadow-2xl p-4 z-50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-medium text-foreground">Listening...</span>
            </div>
            <div className="flex items-center justify-center gap-1 h-12">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-accent/60 rounded-full animate-pulse"
                  style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.05}s` }}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">Speak to dictate text into your document</p>
          </div>
        )}
      </div>

      {/* AI bar */}
      <div className="border-t border-border p-2 sm:p-3 bg-background flex-shrink-0">
        <AIPromptBox placeholder="Ask AI to write, edit, summarize, or format your document..." onGenerate={() => {}} />
      </div>
    </div>
  );
};

const AIPromptBox = ({ placeholder, onGenerate }: { placeholder: string; onGenerate: (p: string) => void }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'; }
  }, [prompt]);

  return (
    <div className="bg-surface border border-border rounded-xl p-2">
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full bg-transparent border-none outline-none resize-none text-sm py-2 px-3 text-foreground placeholder:text-muted-foreground min-h-[40px] max-h-[120px] overflow-y-auto"
        placeholder={placeholder}
        rows={1}
      />
      <div className="flex justify-end px-1">
        <button
          onClick={() => { setIsGenerating(true); setTimeout(() => { setIsGenerating(false); onGenerate(prompt); }, 2000); }}
          disabled={isGenerating || !prompt.trim()}
          className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium flex items-center gap-2 disabled:opacity-30"
        >
          {isGenerating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : <><Wand2 className="w-3.5 h-3.5" /> Generate</>}
        </button>
      </div>
    </div>
  );
};

export default DocumentEditor;
