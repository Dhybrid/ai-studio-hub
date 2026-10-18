import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

export type WorkspaceMode = 'chat' | 'web-builder' | 'mobile-builder' | 'image-studio' | 'settings';

export interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: string; // ISO String
  pinned?: boolean;
  archived?: boolean;
  messages: any[];
}

export interface WorkspaceUser {
  name: string;
  email: string;
  isGuest: boolean;
  avatar?: string;
  initials: string;
}

interface WorkspaceState {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
  model: string;
  setModel: (model: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  themeMode: 'light' | 'dark' | 'system';
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  user: WorkspaceUser;
  setUser: (user: WorkspaceUser) => void;
  chatKey: number;
  startNewChat: () => void;
  chats: ChatHistoryItem[];
  pinChat: (id: string) => void;
  archiveChat: (id: string) => void;
  deleteChat: (id: string) => void;
  addChat: (title: string, messages?: any[]) => string;
  updateChatMessages: (id: string, messages: any[]) => void;
}

const WorkspaceContext = createContext<WorkspaceState | null>(null);

const DEFAULT_CHATS: ChatHistoryItem[] = [
  {
    id: 'c1',
    title: 'React Hooks & State Management',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    pinned: false,
    archived: false,
    messages: [
      { id: '1', role: 'user', content: 'Tell me about React Hooks' },
      { id: '2', role: 'assistant', content: 'React Hooks allow you to use state and other React features without writing a class. Examples include `useState` and `useEffect`.' }
    ]
  },
  {
    id: 'c2',
    title: 'Understanding TypeScript Generics',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5h ago
    pinned: false,
    archived: false,
    messages: [
      { id: '1', role: 'user', content: 'How do TS Generics work?' },
      { id: '2', role: 'assistant', content: 'Generics enable you to create reusable components that can work over a variety of types rather than a single one.' }
    ]
  },
  {
    id: 'c3',
    title: 'Building a REST API with Express',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1d ago (yesterday)
    pinned: false,
    archived: false,
    messages: []
  },
  {
    id: 'c4',
    title: 'Calculus derivatives tutorial',
    timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(), // ~2.5 days ago (3 days ago)
    pinned: false,
    archived: false,
    messages: []
  },
  {
    id: 'c5',
    title: 'Q4 Budget allocation review',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    pinned: false,
    archived: false,
    messages: []
  },
  {
    id: 'c6',
    title: 'Photosynthesis chloroplast diagrams',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago (1 week ago)
    pinned: false,
    archived: false,
    messages: []
  },
  {
    id: 'c7',
    title: 'Database schema normalization guide',
    timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago (30 days ago)
    pinned: false,
    archived: false,
    messages: []
  }
];

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

  // User state - defaults to guest user
  const [user, setUser] = useState<WorkspaceUser>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('eruwa_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return {
      name: 'Guest User',
      email: 'guest@eruwa.ai',
      isGuest: true,
      initials: 'GU'
    };
  });

  useEffect(() => {
    localStorage.setItem('eruwa_user', JSON.stringify(user));
  }, [user]);

  // Theme mode: light (DEFAULT), dark, or system
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('eruwa_theme_mode');
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    }
    // Default is light mode as requested!
    return 'light';
  });

  // Effective theme: 'light' or 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('eruwa_theme_mode');
      if (stored === 'dark') return 'dark';
      if (stored === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
    }
    return 'light';
  });

  // Apply theme to document root
  const applyTheme = useCallback((mode: 'light' | 'dark' | 'system') => {
    let resolved: 'light' | 'dark' = 'light';
    if (mode === 'dark') {
      resolved = 'dark';
    } else if (mode === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = 'light';
    }

    setTheme(resolved);
    if (typeof document !== 'undefined') {
      if (resolved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const setThemeMode = useCallback((mode: 'light' | 'dark' | 'system') => {
    setThemeModeState(mode);
    localStorage.setItem('eruwa_theme_mode', mode);
    applyTheme(mode);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
  }, [theme, setThemeMode]);

  // Listen for system theme changes if themeMode is system
  useEffect(() => {
    applyTheme(themeMode);

    if (themeMode === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [themeMode, applyTheme]);

  const [chats, setChats] = useState<ChatHistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('eruwa_chats');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return DEFAULT_CHATS;
  });

  useEffect(() => {
    localStorage.setItem('eruwa_chats', JSON.stringify(chats));
  }, [chats]);

  const startNewChat = useCallback(() => {
    setChatKey(k => k + 1);
  }, []);

  const pinChat = useCallback((id: string) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  }, []);

  const archiveChat = useCallback((id: string) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, archived: !c.archived } : c));
  }, []);

  const deleteChat = useCallback((id: string) => {
    setChats(prev => prev.filter(c => c.id !== id));
  }, []);

  const addChat = useCallback((title: string, initialMessages: any[] = []) => {
    const newId = `c-${Date.now()}`;
    const newChat: ChatHistoryItem = {
      id: newId,
      title,
      timestamp: new Date().toISOString(),
      pinned: false,
      archived: false,
      messages: initialMessages
    };
    setChats(prev => [newChat, ...prev]);
    return newId;
  }, []);

  const updateChatMessages = useCallback((id: string, updatedMessages: any[]) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, messages: updatedMessages, timestamp: new Date().toISOString() } : c));
  }, []);

  return (
    <WorkspaceContext.Provider value={{
      mode, setMode, model, setModel, sidebarOpen, setSidebarOpen,
      theme, themeMode, setThemeMode, toggleTheme, user, setUser,
      chatKey, startNewChat,
      chats, pinChat, archiveChat, deleteChat, addChat, updateChatMessages
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};
