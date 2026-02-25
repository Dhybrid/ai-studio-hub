import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type WorkspaceMode = 'chat' | 'web-builder' | 'mobile-builder' | 'image-studio' | 'settings';

interface WorkspaceState {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
  model: string;
  setModel: (model: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  chatKey: number;
  startNewChat: () => void;
}

const WorkspaceContext = createContext<WorkspaceState | null>(null);

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be inside WorkspaceProvider');
  return ctx;
};

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<WorkspaceMode>('chat');
  const [model, setModel] = useState('gpt-4');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatKey, setChatKey] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'dark';
    }
    return 'dark';
  });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const startNewChat = useCallback(() => {
    setChatKey(k => k + 1);
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <WorkspaceContext.Provider value={{ mode, setMode, model, setModel, sidebarOpen, setSidebarOpen, theme, toggleTheme, chatKey, startNewChat }}>
      {children}
    </WorkspaceContext.Provider>
  );
};
