import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send, Loader2, File, FolderOpen, Smartphone,
  Check, Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const flutterCode = `import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('My App'),
        elevation: 0,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.rocket_launch, size: 64),
            SizedBox(height: 16),
            Text(
              'Welcome to My App',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            SizedBox(height: 8),
            Text('Built with Flutter & AI'),
          ],
        ),
      ),
    );
  }
}`;

const MobileBuilder = () => {
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('flutter');
  const [isBuilding, setIsBuilding] = useState(false);

  return (
    <div className="flex h-full">
      {/* Left Panel */}
      <div className="w-[320px] border-r border-border flex flex-col bg-background flex-shrink-0">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Mobile App</h2>
          <input
            className="mt-2 w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-foreground outline-none focus:ring-1 focus:ring-accent"
            placeholder="App name"
            defaultValue="My Mobile App"
          />
        </div>

        <div className="p-4 border-b border-border">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Platform</label>
          <div className="grid grid-cols-3 gap-1.5">
            {['Flutter', 'React Native', 'Expo'].map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p.toLowerCase().replace(' ', '-'))}
                className={cn(
                  "px-2 py-2 rounded-lg text-xs font-medium transition-all border",
                  platform === p.toLowerCase().replace(' ', '-')
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted-foreground hover:bg-surface-hover"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-4 flex flex-col">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 w-full rounded-lg bg-surface border border-border p-3 text-sm text-foreground outline-none resize-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground"
            placeholder="Describe the mobile app..."
          />
          <button
            onClick={() => setIsBuilding(true)}
            className="mt-3 w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Generate
          </button>
        </div>
      </div>

      {/* Center - Phone Preview */}
      <div className="flex-1 flex items-center justify-center bg-surface/30">
        <div className="relative">
          {/* Phone Frame */}
          <div className="w-[300px] h-[620px] bg-background rounded-[40px] border-[8px] border-foreground/10 shadow-2xl overflow-hidden relative">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-foreground/10 rounded-b-2xl z-10" />
            
            {/* Screen */}
            <div className="h-full pt-8 flex flex-col">
              {/* Status Bar */}
              <div className="px-6 py-2 flex justify-between text-[10px] text-muted-foreground">
                <span>9:41</span>
                <div className="flex gap-1">
                  <span>📶</span>
                  <span>🔋</span>
                </div>
              </div>
              
              {/* App Bar */}
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground text-center">My App</h3>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                  <Smartphone className="w-8 h-8 text-accent" />
                </div>
                <h4 className="text-lg font-semibold text-foreground">Welcome to My App</h4>
                <p className="text-xs text-muted-foreground mt-2">Built with Flutter & AI</p>
                <button className="mt-6 px-6 py-2.5 rounded-xl bg-foreground text-background text-xs font-medium">
                  Get Started
                </button>
              </div>

              {/* Bottom Nav */}
              <div className="px-2 py-2 border-t border-border flex justify-around">
                {['Home', 'Search', 'Profile'].map((item) => (
                  <div key={item} className="flex flex-col items-center gap-0.5">
                    <div className="w-5 h-5 rounded bg-muted" />
                    <span className="text-[9px] text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Code Panel */}
      <div className="w-[360px] border-l border-border flex flex-col bg-background flex-shrink-0">
        <div className="h-10 flex items-center border-b border-border px-4">
          <span className="text-xs font-medium text-foreground">Code</span>
        </div>
        <div className="px-4 py-2 border-b border-border flex items-center gap-2">
          <File className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-mono">home_screen.dart</span>
        </div>
        <div className="flex-1 overflow-auto">
          <SyntaxHighlighter
            language="dart"
            style={oneDark}
            customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '12px' }}
            showLineNumbers
            lineNumberStyle={{ color: 'hsl(var(--muted-foreground))', opacity: 0.3, fontSize: '11px' }}
          >
            {flutterCode}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default MobileBuilder;
