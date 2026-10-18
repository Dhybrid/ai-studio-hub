import React, { useEffect, useRef } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';

interface InteractiveCursorBackgroundProps {
  mode?: 'grid' | 'sphere' | 'ambient';
  intensity?: number;
  className?: string;
  showWaveGrid?: boolean;
}

export const InteractiveCursorBackground: React.FC<InteractiveCursorBackgroundProps> = ({
  mode = 'grid',
  intensity = 1,
  className = '',
  showWaveGrid = true,
}) => {
  const { theme } = useWorkspace();
  const isDark = theme === 'dark';
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  
  // Mouse coordinates with target interpolation for smooth 60fps tracking
  const mouseRef = useRef({
    currentX: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    currentY: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
    targetX: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    targetY: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
    normX: 0,
    normY: 0,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.normX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.normY = (e.clientY / window.innerHeight) * 2 - 1;

      // Direct transform for ultra-responsive cursor spotlight
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !showWaveGrid) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // 3D Grid parameters
    const cols = 28;
    const rows = 20;
    const spacing = 42;
    const gridPoints: { x: number; y: number; z: number }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        gridPoints.push({
          x: (c - cols / 2) * spacing,
          y: 0,
          z: (r - rows / 2) * spacing,
        });
      }
    }

    // Floating particles that react to cursor
    const particleCount = 28;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * (width || 1000),
        y: Math.random() * (height || 800),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    let time = 0;

    const draw = () => {
      if (!ctx || width === 0 || height === 0) return;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      const m = mouseRef.current;
      m.currentX += (m.targetX - m.currentX) * 0.08;
      m.currentY += (m.targetY - m.currentY) * 0.08;

      time += 0.015;

      // Colors based on theme
      const gridRgb = isDark ? '59, 130, 246' : '37, 99, 235';
      const baseOpacity = (isDark ? 0.22 : 0.16) * intensity;
      const particleRgb = isDark ? '147, 197, 253' : '59, 130, 246';

      // 1. Draw floating micro-particles with mouse repulsion/drift
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around bounds
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Subtle cursor attraction/interaction
        const dx = m.currentX - p.x;
        const dy = m.currentY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const force = (1 - dist / 180) * 0.8;
          p.x -= (dx / dist) * force;
          p.y -= (dy / dist) * force;
        }

        ctx.fillStyle = `rgba(${particleRgb}, ${p.alpha * (isDark ? 0.35 : 0.25) * intensity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. 3D undulating wave grid at bottom
      const cameraTilt = 0.65;
      const cameraZ = 340;
      const focalLength = 320;
      const mxNorm = m.normX;
      const myNorm = m.normY;

      const projected = gridPoints.map((p) => {
        const dx = p.x;
        const dz = p.z;
        const distCenter = Math.sqrt(dx * dx + dz * dz);

        // Realtime wave with cursor disturbance
        const mouseWorldX = mxNorm * (cols * spacing * 0.4);
        const mouseWorldZ = myNorm * (rows * spacing * 0.4);
        const distMouse = Math.sqrt((dx - mouseWorldX) ** 2 + (dz - mouseWorldZ) ** 2);
        const cursorImpact = Math.max(0, 48 - distMouse * 0.28) * Math.sin(time * 2.5 - distMouse * 0.05);

        const wave = Math.sin(time - distCenter * 0.016) * 14 + Math.cos(time * 0.9 + dx * 0.012) * 8;
        const y = wave + cursorImpact;

        // Rotation around X (camera tilt)
        const rotY = y * Math.cos(cameraTilt) - p.z * Math.sin(cameraTilt);
        const rotZ = y * Math.sin(cameraTilt) + p.z * Math.cos(cameraTilt);

        // Parallax rotation around Y from mouse X
        const rotX = p.x * Math.cos(mxNorm * 0.12) - rotZ * Math.sin(mxNorm * 0.12);
        const finalZ = p.x * Math.sin(mxNorm * 0.12) + rotZ * Math.cos(mxNorm * 0.12);

        const scale = focalLength / (focalLength + finalZ + cameraZ);
        const sx = rotX * scale + width / 2;
        const sy = (rotY + 130) * scale + (height - 90);

        return { sx, sy, sz: finalZ };
      });

      // Draw grid connections
      ctx.lineWidth = 0.6;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const curr = projected[idx];

          const depthFactor = Math.max(0, Math.min(1, (curr.sz + 280) / 560));
          const alpha = Math.max(0, 1 - depthFactor) * baseOpacity;

          if (c < cols - 1) {
            const next = projected[idx + 1];
            ctx.strokeStyle = `rgba(${gridRgb}, ${alpha * 0.9})`;
            ctx.beginPath();
            ctx.moveTo(curr.sx, curr.sy);
            ctx.lineTo(next.sx, next.sy);
            ctx.stroke();
          }

          if (r < rows - 1) {
            const down = projected[idx + cols];
            ctx.strokeStyle = `rgba(${gridRgb}, ${alpha * 0.8})`;
            ctx.beginPath();
            ctx.moveTo(curr.sx, curr.sy);
            ctx.lineTo(down.sx, down.sy);
            ctx.stroke();
          }

          // Vertex highlight near cursor
          if (depthFactor < 0.6 && r % 2 === 0 && c % 2 === 0) {
            ctx.fillStyle = `rgba(${gridRgb}, ${alpha * 1.5})`;
            ctx.beginPath();
            ctx.arc(curr.sx, curr.sy, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [isDark, intensity, showWaveGrid]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}>
      {/* 1. Geometric Grid Lines with Radial Vignette */}
      <div 
        className={
          isDark
            ? "absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_25%,#000_65%,transparent_100%)] opacity-80"
            : "absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.035)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_25%,#000_65%,transparent_100%)] opacity-70"
        }
      />

      {/* 2. Cursor Following Radial Spotlight Aura */}
      <div
        ref={glowRef}
        className="absolute top-0 left-0 -ml-[300px] -mt-[300px] w-[600px] h-[600px] rounded-full pointer-events-none transition-transform duration-75 ease-out will-change-transform"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.05) 45%, transparent 75%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.09) 0%, rgba(99, 102, 241, 0.04) 45%, transparent 70%)',
        }}
      />

      {/* 3. Ambient Static Corner Glows for Depth */}
      <div 
        className={
          isDark 
            ? "absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl"
            : "absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl"
        } 
      />
      <div 
        className={
          isDark 
            ? "absolute top-1/2 -left-32 w-96 h-96 rounded-full bg-purple-600/08 blur-3xl"
            : "absolute top-1/2 -left-32 w-96 h-96 rounded-full bg-indigo-300/10 blur-3xl"
        } 
      />

      {/* 4. Canvas for 3D Undulating Wave Grid and Reactive Micro-particles */}
      {showWaveGrid && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block w-full h-full pointer-events-none"
        />
      )}
    </div>
  );
};
