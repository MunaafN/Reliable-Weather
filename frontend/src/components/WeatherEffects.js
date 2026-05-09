import React, { useEffect, useRef } from 'react';

const WeatherEffects = ({ condition, isDark }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let particles = [];
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    const text = condition?.toLowerCase() || '';
    const isRain = text.includes('rain') || text.includes('drizzle') || text.includes('shower');
    const isSnow = text.includes('snow') || text.includes('sleet') || text.includes('blizzard');
    const isFog = text.includes('mist') || text.includes('fog') || text.includes('haze');
    
    const isHeavy = text.includes('heavy') || text.includes('intense');
    const isLight = text.includes('light');

    if (!isRain && !isSnow && !isFog) {
      ctx.clearRect(0, 0, width, height);
      return;
    }

    // Initialize particles
    let count = 0;
    if (isRain) count = isHeavy ? 150 : isLight ? 40 : 80;
    else if (isSnow) count = isHeavy ? 200 : isLight ? 50 : 100;
    else if (isFog) count = 30; // Fewer particles for fog, but large

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: isRain ? Math.random() * 20 + 10 : 0,
        radius: isSnow ? Math.random() * 2.5 + 1 : isFog ? Math.random() * 100 + 50 : 1,
        speedX: isRain ? Math.random() * 2 - 1 : isSnow ? Math.random() * 1 - 0.5 : Math.random() * 0.5 - 0.25,
        speedY: isRain ? Math.random() * 10 + 15 : isSnow ? Math.random() * 2 + 1 : Math.random() * 0.5 - 0.25,
        opacity: isFog ? Math.random() * 0.1 + 0.05 : Math.random() * 0.5 + 0.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const particleColor = isDark ? '255, 255, 255' : '100, 116, 139'; // White in dark mode, slate-500 in light
      
      if (isRain) {
        ctx.strokeStyle = `rgba(${particleColor}, 0.4)`;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let p of particles) {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + p.length);
        }
        ctx.stroke();
      } else if (isSnow) {
        ctx.fillStyle = `rgba(${particleColor}, 0.8)`;
        ctx.beginPath();
        for (let p of particles) {
          ctx.moveTo(p.x, p.y);
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        }
        ctx.fill();
      } else if (isFog) {
        for (let p of particles) {
          ctx.beginPath();
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          gradient.addColorStop(0, `rgba(${particleColor}, ${p.opacity})`);
          gradient.addColorStop(1, `rgba(${particleColor}, 0)`);
          ctx.fillStyle = gradient;
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      update();
      animationFrameId = requestAnimationFrame(draw);
    };

    const update = () => {
      for (let p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y > height + 100) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 100) {
          p.x = -20;
        } else if (p.x < -100) {
          p.x = width + 20;
        }
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [condition, isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ opacity: 0.8 }}
    />
  );
};

export default WeatherEffects;
