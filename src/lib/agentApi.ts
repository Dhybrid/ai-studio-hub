export type AgentRoute =
  | 'office-document'
  | 'office-spreadsheet'
  | 'office-presentation'
  | 'cereva'
  | 'chat';

export interface AgentResponse<T = any> {
  route: AgentRoute;
  title: string;
  generated_content: T;
  confidence?: number;
  agent?: string;
  used_fallback?: boolean;
  diagnostics?: Record<string, unknown>;
}

const AGENT_API_URL = (import.meta.env.VITE_AGENT_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export interface RouteAgentOptions {
  routeHint?: AgentRoute;
  context?: Record<string, unknown>;
  images?: Array<{ url: string; name?: string; type?: string; detail?: 'low' | 'high' | 'auto' }>;
}

export async function routeAgent(prompt: string, options: RouteAgentOptions = {}): Promise<AgentResponse> {
  const storedProvider = localStorage.getItem('coxmox_provider') || '';
  const provider = !storedProvider || storedProvider === 'huggingface-space' || storedProvider === 'grok'
    ? 'xai'
    : storedProvider;
  const apiKey = localStorage.getItem(`coxmox_api_key_${provider}`) || '';
  const storedModelName = localStorage.getItem('coxmox_model_name') || '';
  const modelName = provider === 'xai' && (!storedModelName || storedModelName.startsWith('gpt-') || storedModelName.startsWith('gemini') || storedModelName.startsWith('claude'))
    ? 'grok-4.3'
    : storedModelName;

  const response = await fetch(`${AGENT_API_URL}/api/agent/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      provider,
      api_key: apiKey || undefined,
      model_name: modelName || undefined,
      route_hint: options.routeHint,
      context: options.context || {},
      images: options.images || [],
    }),
  });

  if (!response.ok) {
    throw new Error(`Agent request failed with ${response.status}`);
  }

  return response.json();
}

export async function exportDocx(title: string, html: string): Promise<Blob> {
  const response = await fetch(`${AGENT_API_URL}/api/export/docx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, html }),
  });
  if (!response.ok) throw new Error('DOCX export failed');
  return response.blob();
}

export async function exportPptx(title: string, slides: any[], themeId: string): Promise<Blob> {
  const response = await fetch(`${AGENT_API_URL}/api/export/pptx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, slides, themeId }),
  });
  if (!response.ok) throw new Error('PPTX export failed');
  return response.blob();
}

export async function exportXlsx(title: string, sheets?: any[], cells?: any, sheetName?: string): Promise<Blob> {
  const response = await fetch(`${AGENT_API_URL}/api/export/xlsx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, sheets, cells, sheetName }),
  });
  if (!response.ok) throw new Error('XLSX export failed');
  return response.blob();
}

export async function exportPdf(title: string, type: 'document' | 'presentation' | 'spreadsheet', data: any): Promise<Blob> {
  const response = await fetch(`${AGENT_API_URL}/api/export/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, type, data }),
  });
  if (!response.ok) throw new Error('PDF export failed');
  return response.blob();
}
