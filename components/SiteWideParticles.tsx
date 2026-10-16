"use client";

import { useEffect, useRef } from "react";

const colors = ["#4285F4", "#3B82F6", "#60A5FA", "#8AB4F8", "#A142F4"];
const particleCount = 58;
const twoPi = Math.PI * 2;

type AmbientParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  size: number;
  color: string;
  capsule: boolean;
};

export function SiteWideParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });
    if (!canvas || !context) return;

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let width = 1;
    let height = 1;
    let pixelRatio = 1;
    let frameId = 0;
    let particles: AmbientParticle[] = [];

    const resize = () => {
      const previousWidth = width;
      const previousHeight = height;
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      if (particles.length === 0) {
        particles = Array.from({ length: particleCount }, (_, index) => ({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          phase: Math.random() * twoPi,
          size: 1 + Math.random() * 1.1,
          color: colors[index % colors.length],
          capsule: index % 4 !== 0,
        }));
      } else {
        for (const particle of particles) {
          particle.x *= width / Math.max(1, previousWidth);
          particle.y *= height / Math.max(1, previousHeight);
        }
      }

      if (motionPreference.matches) draw(performance.now());
      else schedule();
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const elapsed = time * 0.001;

      for (const particle of particles) {
        if (!motionPreference.matches) {
          particle.x +=
            particle.vx + Math.sin(elapsed * 0.45 + particle.phase) * 0.08;
          particle.y +=
            particle.vy + Math.cos(elapsed * 0.4 + particle.phase) * 0.08;
          if (particle.x < -12) particle.x = width + 12;
          if (particle.x > width + 12) particle.x = -12;
          if (particle.y < -12) particle.y = height + 12;
          if (particle.y > height + 12) particle.y = -12;
        }

        context.globalAlpha =
          0.08 + 0.09 * (0.5 + 0.5 * Math.sin(elapsed + particle.phase));
        context.fillStyle = particle.color;
        context.save();
        context.translate(particle.x, particle.y);
        if (particle.capsule) {
          context.rotate(Math.atan2(particle.vy, particle.vx));
          context.beginPath();
          context.roundRect(
            -particle.size * 2,
            -particle.size * 0.45,
            particle.size * 4,
            particle.size * 0.9,
            particle.size * 0.45,
          );
          context.fill();
        } else {
          context.beginPath();
          context.arc(0, 0, particle.size * 0.65, 0, twoPi);
          context.fill();
        }
        context.restore();
      }

      context.globalAlpha = 1;
    };

    const render = (time: number) => {
      frameId = 0;
      if (document.hidden) return;
      draw(time);
      if (!motionPreference.matches) frameId = window.requestAnimationFrame(render);
    };

    const schedule = () => {
      if (!document.hidden && frameId === 0 && !motionPreference.matches) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (frameId) window.cancelAnimationFrame(frameId);
        frameId = 0;
      } else {
        schedule();
      }
    };

    const onMotionPreferenceChange = () => {
      if (motionPreference.matches) {
        if (frameId) window.cancelAnimationFrame(frameId);
        frameId = 0;
        draw(performance.now());
      } else {
        schedule();
      }
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    motionPreference.addEventListener("change", onMotionPreferenceChange);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionPreference.removeEventListener("change", onMotionPreferenceChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 size-full"
    />
  );
}
