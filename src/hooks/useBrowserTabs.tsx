import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type TabType = 'home' | 'word' | 'excel' | 'powerpoint' | 'pdf' | 'chat' | 'cereva' | 'settings' | 'office';

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  type: TabType;
  iconType: 'eruwa' | 'word' | 'excel' | 'powerpoint' | 'pdf' | 'chat' | 'cereva' | 'settings' | 'globe' | 'office';
  groupId?: string;
  projectId?: string;
  template?: string;
  initialPrompt?: string;
}

export interface TabGroup {
  id: string;
  name: string;
  color: string;
  collapsed?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  workspace: string;
  email: string;
  avatar?: string;
  initials: string;
}

interface BrowserContextType {
  tabs: BrowserTab[];
  activeTabId: string;
  activeTab: BrowserTab | undefined;
  tabGroups: TabGroup[];
  profiles: UserProfile[];
  activeProfile: UserProfile;
  addProfile: (name: string, workspace: string, email?: string) => void;
  switchProfile: (id: string) => void;
  openTab: (options: {
    type?: TabType;
    title?: string;
    url?: string;
    groupId?: string;
    projectId?: string;
    template?: string;
    initialPrompt?: string;
  }) => string;
  closeTab: (id: string) => void;
  closeOtherTabs: (id: string) => void;
  setActiveTabId: (id: string) => void;
  fullscreenMode: boolean;
  toggleFullscreenMode: () => void;
  setFullscreenMode: (val: boolean) => void;
  updateTab: (id: string, updates: Partial<BrowserTab>) => void;
  duplicateTab: (id: string) => void;
  createGroup: (name: string, color?: string, tabIds?: string[]) => string;
  removeGroup: (groupId: string) => void;
  assignTabToGroup: (tabId: string, groupId?: string) => void;
  toggleGroupCollapse: (groupId: string) => void;
  // Toolbar navigation & undo/redo
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
  reloadTab: () => void;
  isReloading: boolean;
  reloadCounter: number;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  composerText: string;
  setComposerText: (text: string) => void;
}

const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'p-default',
    name: 'Ikiogha Riches',
    workspace: 'Personal workspace',
    email: 'ikioghariches09@gmail.com',
    initials: 'IR',
  },
  {
    id: 'p-work',
    name: 'Enterprise Workspace',
    workspace: 'Organization',
    email: 'work@eruwa.ai',
    initials: 'EW',
  },
];

const DEFAULT_GROUPS: TabGroup[] = [];

const DEFAULT_TABS: BrowserTab[] = [
  {
    id: 'tab-home-1',
    title: 'Eruwa AI',
    url: 'https://eruwa.ai',
    type: 'home',
    iconType: 'eruwa',
  },
];

const BrowserContext = createContext<BrowserContextType | null>(null);

export const BrowserProvider = ({ children }: { children: ReactNode }) => {
  const [tabs, setTabs] = useState<BrowserTab[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('eruwa_browser_tabs');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
    }
    return DEFAULT_TABS;
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('eruwa_active_tab_id');
      if (stored && tabs.some(t => t.id === stored)) return stored;
    }
    return tabs[0]?.id || 'tab-home-1';
  });

  const [tabGroups, setTabGroups] = useState<TabGroup[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('eruwa_tab_groups');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
    }
    return DEFAULT_GROUPS;
  });

  // User profiles
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('eruwa_profiles');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
    }
    return DEFAULT_PROFILES;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('eruwa_active_profile_id');
      if (stored && profiles.some(p => p.id === stored)) return stored;
    }
    return profiles[0]?.id || 'p-default';
  });

  // Navigation history stacks per tab
  const [historyIndex, setHistoryIndex] = useState(0);
  const [historyStack, setHistoryStack] = useState<string[]>(['tab-home-1']);
  const [isReloading, setIsReloading] = useState(false);

  // Undo/Redo history stack for AI Composer and text edits
  const [composerHistory, setComposerHistory] = useState<string[]>(['']);
  const [composerHistoryIdx, setComposerHistoryIdx] = useState(0);
  const composerText = composerHistory[composerHistoryIdx] || '';

  const setComposerText = useCallback((newText: string) => {
    setComposerHistory(prev => {
      const trimmed = prev.slice(0, composerHistoryIdx + 1);
      if (trimmed[trimmed.length - 1] === newText) return prev;
      return [...trimmed, newText];
    });
    setComposerHistoryIdx(prev => prev + 1);
  }, [composerHistoryIdx]);

  const canUndo = composerHistoryIdx > 0;
  const canRedo = composerHistoryIdx < composerHistory.length - 1;

  const undo = useCallback(() => {
    if (composerHistoryIdx > 0) {
      setComposerHistoryIdx(prev => prev - 1);
    }
  }, [composerHistoryIdx]);

  const redo = useCallback(() => {
    if (composerHistoryIdx < composerHistory.length - 1) {
      setComposerHistoryIdx(prev => prev + 1);
    }
  }, [composerHistoryIdx, composerHistory.length]);

  useEffect(() => {
    localStorage.setItem('eruwa_browser_tabs', JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem('eruwa_active_tab_id', activeTabId);
  }, [activeTabId]);

  useEffect(() => {
    localStorage.setItem('eruwa_tab_groups', JSON.stringify(tabGroups));
  }, [tabGroups]);

  useEffect(() => {
    localStorage.setItem('eruwa_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('eruwa_active_profile_id', activeProfileId);
  }, [activeProfileId]);

  // Sync direct URL route on initial page load (e.g. /office/presentations)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname.toLowerCase();
    
    if (path.includes('/office/presentations') || path.includes('/office/slides')) {
      setTabs(prev => {
        const found = prev.find(t => t.type === 'powerpoint');
        if (found) {
          setActiveTabId(found.id);
          return prev;
        }
        const newTab: BrowserTab = {
          id: `tab-powerpoint-${Date.now()}`,
          type: 'powerpoint',
          title: 'Slide — Eruwa',
          url: 'https://eruwa.ai/office/slides',
          iconType: 'powerpoint',
        };
        setActiveTabId(newTab.id);
        return [...prev, newTab];
      });
    } else if (path.includes('/office/documents')) {
      setTabs(prev => {
        const found = prev.find(t => t.type === 'word');
        if (found) {
          setActiveTabId(found.id);
          return prev;
        }
        const newTab: BrowserTab = {
          id: `tab-word-${Date.now()}`,
          type: 'word',
          title: 'Documents — Eruwa',
          url: 'https://eruwa.ai/office/documents',
          iconType: 'word',
        };
        setActiveTabId(newTab.id);
        return [...prev, newTab];
      });
    } else if (path.includes('/office/spreadsheets') || path.includes('/office/sheets')) {
      setTabs(prev => {
        const found = prev.find(t => t.type === 'excel');
        if (found) {
          setActiveTabId(found.id);
          return prev;
        }
        const newTab: BrowserTab = {
          id: `tab-excel-${Date.now()}`,
          type: 'excel',
          title: 'Sheet — Eruwa',
          url: 'https://eruwa.ai/office/sheets',
          iconType: 'excel',
        };
        setActiveTabId(newTab.id);
        return [...prev, newTab];
      });
    } else if (path.includes('/office/pdf')) {
      setTabs(prev => {
        const found = prev.find(t => t.type === 'pdf');
        if (found) {
          setActiveTabId(found.id);
          return prev;
        }
        const newTab: BrowserTab = {
          id: `tab-pdf-${Date.now()}`,
          type: 'pdf',
          title: 'PDF — Eruwa',
          url: 'https://eruwa.ai/office/pdf',
          iconType: 'pdf',
        };
        setActiveTabId(newTab.id);
        return [...prev, newTab];
      });
    } else if (path.startsWith('/office')) {
      setTabs(prev => {
        const found = prev.find(t => t.type === 'office');
        if (found) {
          setActiveTabId(found.id);
          return prev;
        }
        const newTab: BrowserTab = {
          id: `tab-office-${Date.now()}`,
          type: 'office',
          title: 'Office Studio',
          url: 'https://eruwa.ai/office',
          iconType: 'office',
        };
        setActiveTabId(newTab.id);
        return [...prev, newTab];
      });
    }
  }, []);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0] || DEFAULT_TABS[0];
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || DEFAULT_PROFILES[0];

  const addProfile = useCallback((name: string, workspace: string, email?: string) => {
    const id = `p-${Date.now()}`;
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';
    const newProf: UserProfile = {
      id,
      name,
      workspace: workspace || 'Personal workspace',
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@eruwa.ai`,
      initials,
    };
    setProfiles(prev => [...prev, newProf]);
    setActiveProfileId(id);
  }, []);

  const switchProfile = useCallback((id: string) => {
    setActiveProfileId(id);
  }, []);

  const getIconForType = (type: TabType): BrowserTab['iconType'] => {
    switch (type) {
      case 'word': return 'word';
      case 'excel': return 'excel';
      case 'powerpoint': return 'powerpoint';
      case 'pdf': return 'pdf';
      case 'chat': return 'chat';
      case 'cereva': return 'cereva';
      case 'settings': return 'settings';
      case 'office': return 'office';
      default: return 'eruwa';
    }
  };

  const getTitleForType = (type: TabType): string => {
    switch (type) {
      case 'word': return 'Documents';
      case 'excel': return 'Sheet';
      case 'powerpoint': return 'Slide';
      case 'pdf': return 'PDF';
      case 'chat': return 'Research';
      case 'cereva': return 'Cereva';
      case 'settings': return 'Settings';
      case 'office': return 'Office Studio';
      default: return 'Eruwa AI';
    }
  };

  const getUrlForType = (type: TabType): string => {
    switch (type) {
      case 'word': return 'https://eruwa.ai/office/documents';
      case 'excel': return 'https://eruwa.ai/office/sheets';
      case 'powerpoint': return 'https://eruwa.ai/office/slides';
      case 'pdf': return 'https://eruwa.ai/office/pdf';
      case 'chat': return 'https://eruwa.ai/chat';
      case 'cereva': return 'https://eruwa.ai/cereva';
      case 'settings': return 'https://eruwa.ai/settings';
      case 'office': return 'https://eruwa.ai/office';
      default: return 'https://eruwa.ai';
    }
  };

  const openTab = useCallback((options: {
    type?: TabType;
    title?: string;
    url?: string;
    groupId?: string;
    projectId?: string;
    template?: string;
    initialPrompt?: string;
  }) => {
    const type = options.type || 'home';
    const newId = `tab-${type}-${Date.now()}`;
    const newTab: BrowserTab = {
      id: newId,
      type,
      title: options.title || getTitleForType(type),
      url: options.url || getUrlForType(type),
      iconType: getIconForType(type),
      groupId: options.groupId,
      projectId: options.projectId,
      template: options.template,
      initialPrompt: options.initialPrompt,
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
    setHistoryStack(prev => [...prev.slice(0, historyIndex + 1), newId]);
    setHistoryIndex(prev => prev + 1);
    return newId;
  }, [historyIndex]);

  const closeTab = useCallback((id: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === id);
      const nextTabs = prev.filter(t => t.id !== id);

      if (nextTabs.length === 0) {
        const homeTab: BrowserTab = {
          id: `tab-home-${Date.now()}`,
          title: 'Eruwa AI',
          url: 'https://eruwa.ai',
          type: 'home',
          iconType: 'eruwa',
        };
        setActiveTabId(homeTab.id);
        return [homeTab];
      }

      if (activeTabId === id) {
        const nextActiveIdx = Math.max(0, Math.min(idx, nextTabs.length - 1));
        setActiveTabId(nextTabs[nextActiveIdx].id);
      }

      return nextTabs;
    });
  }, [activeTabId]);

  const closeOtherTabs = useCallback((id: string) => {
    setTabs(prev => {
      const remaining = prev.filter(t => t.id === id);
      return remaining.length > 0 ? remaining : prev;
    });
    setActiveTabId(id);
  }, []);

  const updateTab = useCallback((id: string, updates: Partial<BrowserTab>) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const duplicateTab = useCallback((id: string) => {
    setTabs(prev => {
      const tabToDup = prev.find(t => t.id === id);
      if (!tabToDup) return prev;
      const newId = `tab-dup-${Date.now()}`;
      const duplicated: BrowserTab = {
        ...tabToDup,
        id: newId,
        title: `${tabToDup.title} (Copy)`,
      };
      return [...prev, duplicated];
    });
  }, []);

  const createGroup = useCallback((name: string, color = '#3b82f6', tabIds: string[] = []) => {
    const groupId = `group-${Date.now()}`;
    const newGroup: TabGroup = { id: groupId, name, color, collapsed: false };
    setTabGroups(prev => [...prev, newGroup]);
    if (tabIds.length > 0) {
      setTabs(prev => prev.map(t => tabIds.includes(t.id) ? { ...t, groupId } : t));
    }
    return groupId;
  }, []);

  const removeGroup = useCallback((groupId: string) => {
    setTabGroups(prev => prev.filter(g => g.id !== groupId));
    setTabs(prev => prev.map(t => t.groupId === groupId ? { ...t, groupId: undefined } : t));
  }, []);

  const assignTabToGroup = useCallback((tabId: string, groupId?: string) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, groupId } : t));
  }, []);

  const toggleGroupCollapse = useCallback((groupId: string) => {
    setTabGroups(prev => prev.map(g => g.id === groupId ? { ...g, collapsed: !g.collapsed } : g));
  }, []);

  const [fullscreenMode, setFullscreenMode] = useState(false);
  const toggleFullscreenMode = useCallback(() => {
    if (!fullscreenMode && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (fullscreenMode && document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    setFullscreenMode(prev => !prev);
  }, [fullscreenMode]);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < historyStack.length - 1;

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      const targetId = historyStack[prevIdx];
      if (tabs.some(t => t.id === targetId)) {
        setActiveTabId(targetId);
      }
    }
  }, [historyIndex, historyStack, tabs]);

  const goForward = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      const targetId = historyStack[nextIdx];
      if (tabs.some(t => t.id === targetId)) {
        setActiveTabId(targetId);
      }
    }
  }, [historyIndex, historyStack, tabs]);

  const [reloadCounter, setReloadCounter] = useState(0);

  const reloadTab = useCallback(() => {
    setIsReloading(true);
    setReloadCounter(prev => prev + 1);
    setTimeout(() => setIsReloading(false), 400);
  }, []);

  return (
    <BrowserContext.Provider value={{
      tabs,
      activeTabId,
      activeTab,
      tabGroups,
      profiles,
      activeProfile,
      reloadCounter,
      addProfile,
      switchProfile,
      openTab,
      closeTab,
      closeOtherTabs,
      setActiveTabId,
      fullscreenMode,
      toggleFullscreenMode,
      setFullscreenMode,
      updateTab,
      duplicateTab,
      createGroup,
      removeGroup,
      assignTabToGroup,
      toggleGroupCollapse,
      canGoBack,
      canGoForward,
      goBack,
      goForward,
      reloadTab,
      isReloading,
      canUndo,
      canRedo,
      undo,
      redo,
      composerText,
      setComposerText,
    }}>
      {children}
    </BrowserContext.Provider>
  );
};

export const useBrowserTabs = () => {
  const ctx = useContext(BrowserContext);
  if (!ctx) throw new Error('useBrowserTabs must be used within a BrowserProvider');
  return ctx;
};
