export interface CodeSnippet {
  id: string;
  language: string;
  code: string;
  title: string;
}

export function extractCodeSnippets(markdown: string): CodeSnippet[] {
  const snippets: CodeSnippet[] = [];
  const pattern = /```([A-Za-z0-9_+#.-]*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(markdown)) !== null) {
    const language = match[1]?.trim() || 'text';
    const code = match[2].replace(/\n$/, '');
    snippets.push({
      id: `${match.index}-${snippets.length}`,
      language,
      code,
      title: `${language} snippet ${snippets.length + 1}`,
    });
  }

  return snippets;
}

export function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}
