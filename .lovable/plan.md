This is a large multi-area upgrade. Here's the plan before I start changing files.

## 1. PowerPoint mobile slide canvas
File: `src/pages/PowerPointWorkspace.tsx`
- Make the main slide canvas truly responsive: replace fixed slide width with `width: min(960px, 100vw - 2rem)` and scale text/elements via a `--slide-scale` CSS var (`clamp(0.45, 100vw/960, 1)`).
- Use `aspect-ratio: 16/9` so the slide shrinks proportionally instead of cropping.
- Apply the scale to slide element font sizes and absolute-positioned overlays so text, shapes, images all shrink together.
- Slide thumbnail list already overlays on mobile — keep, but ensure backdrop closes and main area uses `w-full` on mobile.

## 2. Unified RichTable component (Word + Excel + PowerPoint)
New file: `src/components/office/RichTable.tsx`
- Insert via grid picker (hover N×M cells) shown as a popover from ribbon "Table" button. Replaces `prompt()` alerts.
- Secondary "Insert Table…" button opens a centered dialog (shadcn Dialog) with rows/cols/header/style inputs.
- Renders an HTML `<table>` with:
  - per-cell editing (contentEditable)
  - column resize (drag right border)
  - row resize (drag bottom border)
  - add/delete row/column via floating + handles on hover
  - right-click context menu (insert row above/below, insert col left/right, delete row/col, merge/split, cell bg color)
- Replace `handleInsertTable` in `src/components/office/DocumentEditor.tsx` (Word) with grid picker + dialog.
- Wire same component into PowerPoint slide insert and Excel "insert table" action.

## 3. Office-wide right-click context menu
New file: `src/components/office/CanvasContextMenu.tsx`
- Wrapper that suppresses browser context menu and shows a shadcn ContextMenu with options based on target type:
  - `text` selection → Cut/Copy/Paste, Bold/Italic/Underline, Link, Comment
  - `image` → Replace, Resize, Align, Bring forward/back, Delete, Alt text
  - `table` / `cell` → row/col insert/delete, merge, cell color, table props
  - default → Paste, Select all, Undo/Redo
- Detect target via `e.target.closest('table,img,[contenteditable]')`.
- Mount in Word editor canvas, PowerPoint slide canvas, Excel grid (cell-aware variant already partly exists — extend).

## 4. Drag-and-drop across Office
- Word `DocumentEditor`: enable drop of image files into the contentEditable (read as DataURL → `insertImage`). Make inserted images and tables draggable (`draggable=true`) with free positioning via CSS `position:absolute` when user picks "Move freely" from context menu.
- PowerPoint slides: already has drag for elements — extend to accept dropped image files onto the slide canvas (create new image element at drop coordinates). Shapes get a "Edit text" inline editor and a color picker in the right-click menu; ensure shapes are draggable and resizable (8 handles).
- Excel: accept dropped CSV/XLSX files onto grid → parse and load.

## 5. Responsiveness pass
- PowerPoint top bar / ribbon: collapse to icon-only on `<md` (already partly), ensure no horizontal page overflow.
- Slide canvas centered with `overflow:hidden` parent, no horizontal scroll on mobile.

## Technical notes
- Use shadcn `Popover`, `Dialog`, `ContextMenu` primitives (already installed).
- RichTable persists size via inline styles on `<td>` so saved HTML preserves layout.
- Free-positioning images/shapes wrap them in `<span style="position:absolute;left/top/width/height">` inside a relatively positioned page; toggle between inline and floating via context menu.
- Slide scaling: compute `scale = containerWidth / 960` in a ResizeObserver; apply `transform: scale(var(--scale))` on inner slide while outer keeps aspect-ratio for layout height. This keeps text and absolute children proportional automatically.

## Out of scope (will note, not build)
- Full collaborative cursor / co-editing
- Real .docx/.pptx export of free-positioned elements (stays HTML)

If you approve I'll implement in this order: RichTable + Word integration → Context menu + drag/drop → PowerPoint mobile scaling + drop → Excel drop/context extensions.