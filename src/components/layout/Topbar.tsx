import { Sun, Moon, Bell, ChevronDown, User } from 'lucide-react';
import { useWorkspace } from '@/hooks/useWorkspace';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Topbar = () => {
  const { theme, toggleTheme } = useWorkspace();

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0 z-10">
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-medium text-foreground">AI Chat</h1>
      </div>

      <div className="flex items-center" />

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-hover transition-colors text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-hover transition-colors text-muted-foreground hover:text-foreground relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 ml-2 px-2 py-1 rounded-lg hover:bg-surface-hover transition-colors">
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                II
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem><User className="w-4 h-4 mr-2" /> Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
