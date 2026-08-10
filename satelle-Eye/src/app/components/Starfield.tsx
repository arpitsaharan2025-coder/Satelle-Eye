import { useEffect, useRef, useState } from 'react';

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const stars: { x: number; y: number; z: number; size: number; baseX: number; baseY: number }[] = [];
    const numStars = 1200;

    const nebulas: { x: number; y: number; radius: number; alpha: number; speedX: number; speedY: number; hue: number }[] = [];
    const numNebulas = 30;

    for (let i = 0; i < numStars; i++) {
      const x = Math.random() * canvas.width - canvas.width / 2;
      const y = Math.random() * canvas.height - canvas.height / 2;
      stars.push({
        x,
        y,
        z: Math.random() * canvas.width,
        size: Math.random() * 2.5,
        baseX: x,
        baseY: y,
      });
    }

    for (let i = 0; i < numNebulas; i++) {
      nebulas.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 150 + 50,
        alpha: Math.random() * 0.05 + 0.02,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        hue: Math.random() * 60 + 200, // Blue to purple range
      });
    }

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      if (canvas.width === 0 || canvas.height === 0) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      time += 0.01;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      nebulas.forEach((nebula) => {
        nebula.x += nebula.speedX;
        nebula.y += nebula.speedY;

        if (nebula.x < -nebula.radius) nebula.x = canvas.width + nebula.radius;
        if (nebula.x > canvas.width + nebula.radius) nebula.x = -nebula.radius;
        if (nebula.y < -nebula.radius) nebula.y = canvas.height + nebula.radius;
        if (nebula.y > canvas.height + nebula.radius) nebula.y = -nebula.radius;

        const gradient = ctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.radius);
        gradient.addColorStop(0, `hsla(${nebula.hue}, 80%, 60%, ${nebula.alpha})`);
        gradient.addColorStop(0.5, `hsla(${nebula.hue + 20}, 70%, 50%, ${nebula.alpha * 0.5})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(nebula.x - nebula.radius, nebula.y - nebula.radius, nebula.radius * 2, nebula.radius * 2);
      });

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      stars.forEach((star, i) => {
        const parallaxX = mousePos.x * (star.size * 20);
        const parallaxY = mousePos.y * (star.size * 20);

        const floatX = Math.sin(time + i * 0.1) * 2;
        const floatY = Math.cos(time + i * 0.15) * 2;

        star.z -= 0.8 + Math.sin(time * 0.5) * 0.3;

        if (star.z <= 0) {
          star.z = canvas.width;
          star.baseX = Math.random() * canvas.width - canvas.width / 2;
          star.baseY = Math.random() * canvas.height - canvas.height / 2;
        }

        const k = 128 / star.z;
        const px = (star.baseX + floatX) * k + parallaxX;
        const py = (star.baseY + floatY) * k + parallaxY;

        const size = (1 - star.z / canvas.width) * star.size;
        const opacity = Math.min(1, (1 - star.z / canvas.width) * 1.5);

        if (!isFinite(px) || !isFinite(py) || !isFinite(size) || size <= 0) {
          return;
        }

        ctx.globalAlpha = opacity;
        
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, size * 3);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
        gradient.addColorStop(0.3, `rgba(150, 200, 255, ${opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(px - size * 3, py - size * 3, size * 6, size * 6);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px, py, size, size);

        if (i % 5 === 0) {
          const twinkle = Math.abs(Math.sin(time * 2 + i));
          ctx.globalAlpha = opacity * twinkle;
          ctx.fillRect(px - size, py - size, size * 3, size * 3);
        }
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: 'radial-gradient(ellipse at center, #0a0a2e 0%, #000000 100%)' }}
    />
  );
}