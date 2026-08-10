import { useEffect, useRef } from 'react';

interface Satellite {
  name: string;
  lat: number;
  lon: number;
  alt: number;
  color: string;
}

interface RotatingEarthProps {
  satellites: Satellite[];
  width?: number;
  height?: number;
  onSatelliteClick?: (satellite: Satellite) => void;
}

export function RotatingEarth({ satellites, width = 400, height = 400, onSatelliteClick }: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const satellitePositionsRef = useRef<Map<string, { x: number; y: number; z: number }>>(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    let animationFrame: number;

    const draw3DAxes = () => {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const axisLength = Math.min(width, height) * 0.35;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 1.5;
        ctx.fillRect(x, y, size, size);
      }

      const rotY = rotationRef.current * 0.6; // Only Y rotation for satellites
      const rotX = Math.PI / 6; // Fixed tilt for better 3D view

      const rotate3D = (x: number, y: number, z: number) => {
        let newX = x * Math.cos(rotY) + z * Math.sin(rotY);
        let newZ = -x * Math.sin(rotY) + z * Math.cos(rotY);
        let newY = y;

        const tempY = newY * Math.cos(rotX) - newZ * Math.sin(rotX);
        newZ = newY * Math.sin(rotX) + newZ * Math.cos(rotX);
        newY = tempY;

        return { x: newX, y: newY, z: newZ };
      };

      const project = (x: number, y: number, z: number) => {
        const perspective = 300;
        const scale = perspective / (perspective + z);
        return {
          x: centerX + x * scale,
          y: centerY - y * scale,
          z: z
        };
      };

      const projectAxisStatic = (x: number, y: number, z: number) => {
        const tempY = y * Math.cos(rotX) - z * Math.sin(rotX);
        const newZ = y * Math.sin(rotX) + z * Math.cos(rotX);
        const newY = tempY;
        
        const perspective = 300;
        const scale = perspective / (perspective + newZ);
        return {
          x: centerX + x * scale,
          y: centerY - newY * scale,
          z: newZ
        };
      };
      
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      
      for (let radius = 50; radius <= axisLength; radius += 50) {
        ctx.beginPath();
        let firstPoint = true;
        for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
          const x = radius * Math.cos(angle);
          const z = radius * Math.sin(angle);
          const rotated = rotate3D(x, 0, z);
          const projected = project(rotated.x, rotated.y, rotated.z);
          
          if (firstPoint) {
            ctx.moveTo(projected.x, projected.y);
            firstPoint = false;
          } else {
            ctx.lineTo(projected.x, projected.y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }

      const centerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50);
      centerGlow.addColorStop(0, 'rgba(0, 255, 255, 0.4)');
      centerGlow.addColorStop(1, 'rgba(0, 255, 255, 0)');
      ctx.fillStyle = centerGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#00ffff';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00ffff';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      const axes = [
        { 
          start: { x: 0, y: 0, z: 0 }, 
          end: { x: axisLength, y: 0, z: 0 }, 
          color: '#ff0000', 
          label: 'X' 
        },
        { 
          start: { x: 0, y: 0, z: 0 }, 
          end: { x: 0, y: axisLength, z: 0 }, 
          color: '#00ff00', 
          label: 'Y' 
        },
        { 
          start: { x: 0, y: 0, z: 0 }, 
          end: { x: 0, y: 0, z: axisLength }, 
          color: '#0088ff', 
          label: 'Z' 
        }
      ];

      axes.forEach(axis => {
        const projectedStart = projectAxisStatic(axis.start.x, axis.start.y, axis.start.z);
        const projectedEnd = projectAxisStatic(axis.end.x, axis.end.y, axis.end.z);

        const gradient = ctx.createLinearGradient(
          projectedStart.x, projectedStart.y,
          projectedEnd.x, projectedEnd.y
        );
        gradient.addColorStop(0, axis.color + '88');
        gradient.addColorStop(1, axis.color);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = axis.color;
        
        ctx.beginPath();
        ctx.moveTo(projectedStart.x, projectedStart.y);
        ctx.lineTo(projectedEnd.x, projectedEnd.y);
        ctx.stroke();

        const angle = Math.atan2(
          projectedEnd.y - projectedStart.y,
          projectedEnd.x - projectedStart.x
        );
        const arrowSize = 12;

        ctx.fillStyle = axis.color;
        ctx.beginPath();
        ctx.moveTo(projectedEnd.x, projectedEnd.y);
        ctx.lineTo(
          projectedEnd.x - arrowSize * Math.cos(angle - Math.PI / 6),
          projectedEnd.y - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          projectedEnd.x - arrowSize * Math.cos(angle + Math.PI / 6),
          projectedEnd.y - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.fillStyle = axis.color;
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 10;
        ctx.shadowColor = axis.color;
        ctx.fillText(
          `${axis.label}-Axis`,
          projectedEnd.x + 20 * Math.cos(angle),
          projectedEnd.y + 20 * Math.sin(angle)
        );
        ctx.shadowBlur = 0;

        ctx.strokeStyle = axis.color + '60';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 3; i++) {
          const t = i / 3;
          const tickPos = {
            x: axis.start.x + (axis.end.x - axis.start.x) * t,
            y: axis.start.y + (axis.end.y - axis.start.y) * t,
            z: axis.start.z + (axis.end.z - axis.start.z) * t
          };
          const projectedTick = projectAxisStatic(tickPos.x, tickPos.y, tickPos.z);
          
          ctx.fillStyle = axis.color + '80';
          ctx.beginPath();
          ctx.arc(projectedTick.x, projectedTick.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      satellitePositionsRef.current.clear();

      satellites.forEach((sat, index) => {
        const lat = (sat.lat * Math.PI) / 180;
        const lon = ((sat.lon + rotationRef.current * 57.2958) * Math.PI) / 180;
        
        const orbitRadius = axisLength * 0.8 + (sat.alt / 1000) * 0.3;

        const satX = orbitRadius * Math.cos(lat) * Math.sin(lon);
        const satY = orbitRadius * Math.sin(lat);
        const satZ = orbitRadius * Math.cos(lat) * Math.cos(lon);

        const rotatedSat = rotate3D(satX, satY, satZ);
        const projectedSat = project(rotatedSat.x, rotatedSat.y, rotatedSat.z);

        satellitePositionsRef.current.set(sat.name, { 
          x: projectedSat.x, 
          y: projectedSat.y, 
          z: projectedSat.z 
        });

        ctx.strokeStyle = sat.color + '30';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        
        let firstOrbitPoint = true;
        for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
          const orbX = orbitRadius * Math.cos(lat) * Math.sin(angle);
          const orbY = orbitRadius * Math.sin(lat);
          const orbZ = orbitRadius * Math.cos(lat) * Math.cos(angle);
          
          const rotatedOrb = rotate3D(orbX, orbY, orbZ);
          const projectedOrb = project(rotatedOrb.x, rotatedOrb.y, rotatedOrb.z);
          
          if (rotatedOrb.z > -orbitRadius) {
            if (firstOrbitPoint) {
              ctx.moveTo(projectedOrb.x, projectedOrb.y);
              firstOrbitPoint = false;
            } else {
              ctx.lineTo(projectedOrb.x, projectedOrb.y);
            }
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);

        if (rotatedSat.z > -orbitRadius * 0.5) {
          ctx.strokeStyle = sat.color + '20';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(projectedSat.x, projectedSat.y);
          ctx.stroke();
          ctx.setLineDash([]);

          const satSize = 7 + (rotatedSat.z / orbitRadius) * 2;
          ctx.fillStyle = sat.color;
          ctx.shadowBlur = 20;
          ctx.shadowColor = sat.color;
          
          ctx.beginPath();
          ctx.arc(projectedSat.x, projectedSat.y, satSize, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = sat.color + '60';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(projectedSat.x, projectedSat.y, satSize + 5, 0, Math.PI * 2);
          ctx.stroke();
          
          ctx.shadowBlur = 0;

          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          const textWidth = ctx.measureText(sat.name).width;
          ctx.fillRect(projectedSat.x - textWidth / 2 - 4, projectedSat.y - 25, textWidth + 8, 16);
          
          ctx.fillStyle = sat.color;
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(sat.name, projectedSat.x, projectedSat.y - 14);

          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(projectedSat.x - 35, projectedSat.y + 10, 70, 14);
          
          ctx.fillStyle = '#00ffff';
          ctx.font = '9px monospace';
          ctx.fillText(`${sat.alt.toFixed(0)}km`, projectedSat.x, projectedSat.y + 20);
        }
      });

      rotationRef.current += 0.008;

      animationFrame = requestAnimationFrame(draw3DAxes);
    };

    draw3DAxes();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [satellites, width, height]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSatelliteClick) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    for (const sat of satellites) {
      const pos = satellitePositionsRef.current.get(sat.name);
      if (!pos) continue;

      const distance = Math.sqrt(
        Math.pow(clickX - pos.x, 2) + Math.pow(clickY - pos.y, 2)
      );

      if (distance < 20) {
        onSatelliteClick(sat);
        return;
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      className="w-full h-full cursor-pointer"
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
}