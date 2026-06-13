import { useEffect, useRef } from 'react';

interface ThreeDGeometryProps {
  mode?: 'sphere' | 'grid';
  color?: string; // hex color code
  opacity?: number;
  interactive?: boolean;
}

export const ThreeDGeometry = ({
  mode = 'sphere',
  color = '#3b82f6', // default blue
  opacity = 0.35,
  interactive = true,
}: ThreeDGeometryProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;

    // Device Pixel Ratio for sharp rendering
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    // Mouse listener
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      // Calculate normalized mouse position relative to center (-1 to 1)
      const x = ((e.clientX - rect.left) / width) * 2 - 1;
      const y = ((e.clientY - rect.top) / height) * 2 - 1;
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }

    // Geometry data structures
    // 1. Sphere points setup
    const spherePoints: { x: number; y: number; z: number }[] = [];
    const sphereRings = 12;
    const pointsPerRing = 18;
    const sphereRadius = 140;

    for (let i = 0; i < sphereRings; i++) {
      const phi = (Math.PI * (i + 1)) / (sphereRings + 1);
      for (let j = 0; j < pointsPerRing; j++) {
        const theta = (2 * Math.PI * j) / pointsPerRing;
        spherePoints.push({
          x: sphereRadius * Math.sin(phi) * Math.cos(theta),
          y: sphereRadius * Math.cos(phi),
          z: sphereRadius * Math.sin(phi) * Math.sin(theta),
        });
      }
    }
    // Add poles
    const northPoleIndex = spherePoints.length;
    spherePoints.push({ x: 0, y: sphereRadius, z: 0 });
    const southPoleIndex = spherePoints.length;
    spherePoints.push({ x: 0, y: -sphereRadius, z: 0 });

    // Grid points setup
    const gridCols = 24;
    const gridRows = 24;
    const gridSpacing = 35;
    const gridPoints: { x: number; y: number; z: number }[] = [];

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        gridPoints.push({
          x: (c - gridCols / 2) * gridSpacing,
          y: 0,
          z: (r - gridRows / 2) * gridSpacing,
        });
      }
    }

    // 3D Math Helper Functions
    let angleX = 0.003;
    let angleY = 0.005;

    // Helper: Convert HEX to RGB
    const hexToRgb = (hex: string) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
      return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '59, 130, 246';
    };

    const rgbColor = hexToRgb(color);

    // Animation Loop
    const draw = () => {
      if (!ctx || width === 0 || height === 0) return;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      if (mode === 'sphere') {
        const time = Date.now() * 0.00015;
        // Dynamically adjust spin rates based on mouse movement
        const currentAngleX = angleX + my * 0.02;
        const currentAngleY = angleY + mx * 0.02;

        // Rotation matrix calculations
        const cosX = Math.cos(currentAngleX + time * 0.5);
        const sinX = Math.sin(currentAngleX + time * 0.5);
        const cosY = Math.cos(currentAngleY + time);
        const sinY = Math.sin(currentAngleY + time);

        // Project and sort points by Z-depth for 3D sorting
        const projectedPoints = spherePoints.map((p, index) => {
          // Rotate around Y
          let x1 = p.x * cosY - p.z * sinY;
          let z1 = p.x * sinY + p.z * cosY;

          // Rotate around X
          let y2 = p.y * cosX - z1 * sinX;
          let z2 = p.y * sinX + z1 * cosX;

          // Perspective Projection
          const focalLength = 320;
          const cameraZ = 350;
          const scale = focalLength / (focalLength + z2 + cameraZ);

          // Center coordinate offsets
          const sx = x1 * scale + width / 2;
          const sy = y2 * scale + height / 2;

          return { sx, sy, sz: z2, index };
        });

        // Draw connections / wireframe
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = `rgba(${rgbColor}, ${opacity * 0.15})`;

        for (let i = 0; i < sphereRings; i++) {
          const ringStart = i * pointsPerRing;

          // Draw horizontal ring lines
          ctx.beginPath();
          for (let j = 0; j < pointsPerRing; j++) {
            const curr = projectedPoints[ringStart + j];
            const next = projectedPoints[ringStart + ((j + 1) % pointsPerRing)];

            // Fade connections in the back
            const avgDepth = (curr.sz + next.sz) / (2 * sphereRadius); // -1 to 1
            const alphaFactor = Math.max(0.05, 1 - (avgDepth + 1) / 2);

            ctx.strokeStyle = `rgba(${rgbColor}, ${opacity * 0.25 * alphaFactor})`;
            ctx.beginPath();
            ctx.moveTo(curr.sx, curr.sy);
            ctx.lineTo(next.sx, next.sy);
            ctx.stroke();
          }

          // Draw vertical connections to the next ring
          if (i < sphereRings - 1) {
            const nextRingStart = (i + 1) * pointsPerRing;
            for (let j = 0; j < pointsPerRing; j++) {
              const curr = projectedPoints[ringStart + j];
              const next = projectedPoints[nextRingStart + j];

              const avgDepth = (curr.sz + next.sz) / (2 * sphereRadius);
              const alphaFactor = Math.max(0.05, 1 - (avgDepth + 1) / 2);

              ctx.strokeStyle = `rgba(${rgbColor}, ${opacity * 0.2 * alphaFactor})`;
              ctx.beginPath();
              ctx.moveTo(curr.sx, curr.sy);
              ctx.lineTo(next.sx, next.sy);
              ctx.stroke();
            }
          }

          // Connect to poles
          const northPole = projectedPoints[northPoleIndex];
          const southPole = projectedPoints[southPoleIndex];

          if (i === 0) {
            // Connect first ring to North Pole
            for (let j = 0; j < pointsPerRing; j++) {
              const curr = projectedPoints[ringStart + j];
              ctx.strokeStyle = `rgba(${rgbColor}, ${opacity * 0.15})`;
              ctx.beginPath();
              ctx.moveTo(curr.sx, curr.sy);
              ctx.lineTo(northPole.sx, northPole.sy);
              ctx.stroke();
            }
          }
          if (i === sphereRings - 1) {
            // Connect last ring to South Pole
            for (let j = 0; j < pointsPerRing; j++) {
              const curr = projectedPoints[ringStart + j];
              ctx.strokeStyle = `rgba(${rgbColor}, ${opacity * 0.15})`;
              ctx.beginPath();
              ctx.moveTo(curr.sx, curr.sy);
              ctx.lineTo(southPole.sx, southPole.sy);
              ctx.stroke();
            }
          }
        }

        // Draw node circles
        projectedPoints.forEach((p) => {
          // Normalize depth factor
          const depthFactor = (p.sz + sphereRadius) / (2 * sphereRadius); // 0 (front) to 1 (back)
          const size = Math.max(0.8, 2.5 * (1 - depthFactor));
          const alpha = Math.max(0.1, 1 - depthFactor) * opacity;

          ctx.fillStyle = `rgba(${rgbColor}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, size, 0, 2 * Math.PI);
          ctx.fill();

          // Subtly outline front-facing particles to give a metallic gleam
          if (depthFactor < 0.35) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, size + 1.2, 0, 2 * Math.PI);
            ctx.stroke();
          }
        });
      } else if (mode === 'grid') {
        const time = Date.now() * 0.0012;
        const cameraTilt = 0.6; // camera tilt down
        const cameraZ = 380;
        const focalLength = 350;

        // Dynamic mesh nodes calculation
        const projectedPoints = gridPoints.map((p) => {
          // Calculate grid elevation using double sine wave + mouse disruption
          const dx = p.x;
          const dz = p.z;
          const distFromCenter = Math.sqrt(dx * dx + dz * dz);
          
          // Mouse distance impact
          const mouseWorldX = mx * (gridCols * gridSpacing * 0.4);
          const mouseWorldZ = my * (gridRows * gridSpacing * 0.4);
          const distFromMouse = Math.sqrt((dx - mouseWorldX) ** 2 + (dz - mouseWorldZ) ** 2);
          const mouseDisruption = Math.max(0, 45 - distFromMouse * 0.25) * Math.sin(time * 2 - distFromMouse * 0.04);

          // Normal undulating waves
          const wave = Math.sin(time - distFromCenter * 0.015) * 12 + Math.cos(time * 0.8 + dx * 0.01) * 8;
          const y = wave + mouseDisruption;

          // Camera Projection Matrix: Rotate around X (Tilt)
          const rotatedY = y * Math.cos(cameraTilt) - p.z * Math.sin(cameraTilt);
          const rotatedZ = y * Math.sin(cameraTilt) + p.z * Math.cos(cameraTilt);

          // Rotate slightly around Y based on mouse X for parallax
          const rotatedX = p.x * Math.cos(mx * 0.08) - rotatedZ * Math.sin(mx * 0.08);
          const finalZ = p.x * Math.sin(mx * 0.08) + rotatedZ * Math.cos(mx * 0.08);

          const scale = focalLength / (focalLength + finalZ + cameraZ);
          const sx = rotatedX * scale + width / 2;
          const sy = (rotatedY + 140) * scale + height / 2; // Offset downward to form floor

          return { sx, sy, sz: finalZ };
        });

        // Render Grid Line Connections
        ctx.lineWidth = 0.45;
        
        for (let r = 0; r < gridRows; r++) {
          for (let c = 0; c < gridCols; c++) {
            const index = r * gridCols + c;
            const curr = projectedPoints[index];

            // Calculate depth fog (nodes in the back fade to transparent)
            // Z coordinate max is around 500
            const depthFactor = Math.max(0, Math.min(1, (curr.sz + 300) / 600)); // 0 (front) to 1 (back)
            const alphaFactor = Math.max(0, 1 - depthFactor);

            // Row line (connecting to right node)
            if (c < gridCols - 1) {
              const nextCol = projectedPoints[index + 1];
              ctx.strokeStyle = `rgba(${rgbColor}, ${opacity * 0.28 * alphaFactor})`;
              ctx.beginPath();
              ctx.moveTo(curr.sx, curr.sy);
              ctx.lineTo(nextCol.sx, nextCol.sy);
              ctx.stroke();
            }

            // Column line (connecting to bottom node)
            if (r < gridRows - 1) {
              const nextRow = projectedPoints[index + gridCols];
              ctx.strokeStyle = `rgba(${rgbColor}, ${opacity * 0.28 * alphaFactor})`;
              ctx.beginPath();
              ctx.moveTo(curr.sx, curr.sy);
              ctx.lineTo(nextRow.sx, nextRow.sy);
              ctx.stroke();
            }

            // Subtly draw nodes as tiny particles at vertices in the foreground
            if (depthFactor < 0.65 && (r % 2 === 0 && c % 2 === 0)) {
              ctx.fillStyle = `rgba(${rgbColor}, ${opacity * 0.8 * alphaFactor})`;
              ctx.beginPath();
              ctx.arc(curr.sx, curr.sy, 1, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (canvas) {
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [mode, color, opacity, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none block w-full h-full"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
