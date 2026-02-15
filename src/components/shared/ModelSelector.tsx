import { ChevronDown } from 'lucide-react';
import { useWorkspace } from '@/hooks/useWorkspace';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const models = [
  { id: 'gpt-4', label: 'GPT-4', badge: 'Latest' },
  { id: 'gpt-4-turbo', label: 'GPT-4 Turbo', badge: 'Fast' },
  { id: 'claude-3', label: 'Claude 3', badge: null },
  { id: 'custom', label: 'Custom Model', badge: null },
  { id: 'ollama', label: 'Local (Ollama)', badge: 'Local' },
];

export const ModelSelector = () => {
  const { model, setModel } = useWorkspace();
  const current = models.find((m) => m.id === model) || models[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-surface-hover transition-colors text-sm">
          <span className="text-foreground font-medium">{current.label}</span>
          {current.badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
              {current.badge}
            </span>
          )}
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-52">
        {models.map((m) => (
          <DropdownMenuItem
            key={m.id}
            onClick={() => setModel(m.id)}
            className={cn(model === m.id && "bg-surface-active")}
          >
            <span className="flex-1">{m.label}</span>
            {m.badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                {m.badge}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
