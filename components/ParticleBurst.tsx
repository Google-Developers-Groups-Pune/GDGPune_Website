"use client";

import { useEffect, useRef } from "react";

const ENABLE_EFFECTS = true;
const PARTICLE_COUNT = 260;
const SIZES = [
  { weight: 0.35, length: 5, thickness: 2 },
  { weight: 0.45, length: 8, thickness: 3 },
  { weight: 0.2, length: 12, thickness: 3 },
] as const;
const COLORS = [
  { weight: 0.5, value: "#3B63E8" },
  { weight: 0.15, value: "#5B3FA8" },
  { weight: 0.15, value: "#D93035" },
  { weight: 0.12, value: "#F5C518" },
  { weight: 0.08, value: "#A3285A" },
] as const;
const TYPE_SPEED = 40;
const HALO_RADIUS_X = 0.32;
const HALO_RADIUS_Y = 0.24;
const LERP = 0.06;

type Particle = {
  angle: number;
  radius: number;
  phaseX: number;
  phaseY: number;
  periodX: number;
  periodY: number;
  length: number;
  thickness: number;
  color: string;
  opacity: number;
  angleNow: number;
  delay: number;
};

type TextRun = {
  node: Text;
  parent: Node;
  characters: HTMLSpanElement[];
};

const twoPi = Math.PI * 2;
const easeOutCubic = (value: number) => 1 - (1 - value) ** 3;

function lerpAngle(current: number, target: number, amount: number) {
  const difference =
    ((target - current + Math.PI * 3) % twoPi) - Math.PI;
  return current + difference * amount;
}

function weightedValue<T extends { weight: number }>(items: readonly T[]) {
  const sample = Math.random();
  let total = 0;
  for (const item of items) {
    total += item.weight;
    if (sample <= total) return item;
  }
  return items[items.length - 1];
}

function makeParticles(): Particle[] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
    const size = weightedValue(SIZES);
    const color = weightedValue(COLORS);
    return {
      angle: index * goldenAngle + (Math.random() - 0.5) * 0.16,
      radius: Math.sqrt((index + 0.5) / PARTICLE_COUNT),
      phaseX: Math.random() * twoPi,
      phaseY: Math.random() * twoPi,
      periodX: 6 + Math.random() * 4,
      periodY: 6 + Math.random() * 4,
      length: size.length,
      thickness: size.thickness,
      color: color.value,
      opacity: 0.85 + Math.random() * 0.15,
      angleNow: index * goldenAngle,
      delay: Math.random() * 250,
    };
  });
}

function initializeParticleBurst(
  canvas: HTMLCanvasElement,
  headline: HTMLElement,
  showBurst: boolean,
) {
  const context = canvas.getContext("2d", { alpha: true, desynchronized: true });
  const hero = canvas.parentElement;
  if (!context || !hero) return () => {};

  const motionPreference = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  const originalNodes = Array.from(headline.childNodes);
  const textRuns: TextRun[] = [];
  const caret = document.createElement("span");
  caret.className = "pb-caret pb-caret-blink";
  caret.setAttribute("aria-hidden", "true");
  hero.append(caret);
  const walker = document.createTreeWalker(headline, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node instanceof Text && node.data.length > 0) textNodes.push(node);
  }

  let particles: Particle[] = [];
  let pixelRatio = 1;
  let width = 1;
  let height = 1;
  let frameId = 0;
  let typeTimer = 0;
  let caretHoldTimer = 0;
  let caretRemoveTimer = 0;
  let burstStartedAt = 0;
  let typedCount = 0;
  let cursorIndex = 0;
  let pointerActive = false;
  let pointerX = 0;
  let pointerY = 0;
  let lastPointerAt = 0;
  let lastPointerWasTouch = false;
  let centerX = 0;
  let centerY = 0;
  let disposed = false;

  const restoreText = () => {
    for (const run of textRuns) {
      const firstCharacter = run.characters[0];
      if (!firstCharacter.parentNode) continue;
      run.parent.insertBefore(run.node, firstCharacter);
      for (const character of run.characters) character.remove();
    }
    if (!textRuns.length && originalNodes.length) {
      headline.replaceChildren(
        ...originalNodes.map((node) => node.cloneNode(true)),
      );
    }
  };

  const updateCaret = (character?: HTMLSpanElement) => {
    const lastCharacter = character ?? textRuns
      .flatMap((run) => run.characters)
      .slice(0, typedCount)
      .at(-1);
    if (!lastCharacter) return;
    const characterBounds = lastCharacter.getBoundingClientRect();
    const heroBounds = hero.getBoundingClientRect();
    const headlineStyle = window.getComputedStyle(headline);
    const computedLineHeight = Number.parseFloat(headlineStyle.lineHeight);
    const lineHeight = Number.isFinite(computedLineHeight)
      ? computedLineHeight
      : Number.parseFloat(headlineStyle.fontSize) * 1.2;
    caret.style.left = `${characterBounds.right - heroBounds.left}px`;
    caret.style.top = `${
      characterBounds.top - heroBounds.top +
      (characterBounds.height - lineHeight) / 2
    }px`;
    caret.style.height = `${lineHeight}px`;
  };

  const beginBurst = () => {
    if (disposed || burstStartedAt || !showBurst) return;
    burstStartedAt = performance.now();
    if (motionPreference.matches) burstStartedAt -= 1200;
    particles = makeParticles();
    const heroBounds = hero.getBoundingClientRect();
    centerX = heroBounds.width / 2;
    centerY = heroBounds.height / 2;
    draw(performance.now());
    if (!motionPreference.matches) {
      frameId = window.requestAnimationFrame(render);
    }
  };

  const finishTyping = () => {
    caret.classList.remove("pb-caret-blink");
    caretHoldTimer = window.setTimeout(() => {
      if (disposed) return;
      caret.style.opacity = "0";
    }, 600);
    caretRemoveTimer = window.setTimeout(() => caret.remove(), 920);
    beginBurst();
  };

  const typeNext = () => {
    if (disposed) return;
    const characters = textRuns.flatMap((run) => run.characters);
    if (cursorIndex >= characters.length) {
      finishTyping();
      return;
    }
    const character = characters[cursorIndex];
    character.style.opacity = "1";
    typedCount += 1;
    cursorIndex += 1;
    updateCaret(character);
    typeTimer = window.setTimeout(typeNext, TYPE_SPEED - 15 + Math.random() * 30);
  };

  const resize = () => {
    const bounds = hero.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    if (burstStartedAt) draw(performance.now());
  };

  const draw = (time: number) => {
    context.clearRect(0, 0, width, height);
    if (!burstStartedAt || !particles.length) return;
    const heroBounds = hero.getBoundingClientRect();
    const heroCenterX = width / 2;
    const heroCenterY = height / 2;
    const idle = !pointerActive || time - lastPointerAt >= 2000;
    const targetX = idle ? heroCenterX : pointerX - heroBounds.left;
    const targetY = idle ? heroCenterY : pointerY - heroBounds.top;
    centerX += (targetX - centerX) * LERP;
    centerY += (targetY - centerY) * LERP;
    const elapsed = Math.max(0, time - burstStartedAt);
    const haloRadiusX = window.innerWidth * HALO_RADIUS_X;
    const haloRadiusY = window.innerHeight * HALO_RADIUS_Y;

    for (const particle of particles) {
      const progress = Math.min(
        1,
        Math.max(0, (elapsed - particle.delay) / 900),
      );
      if (progress <= 0) continue;
      const launch = easeOutCubic(progress);
      const localTime = time / 1000;
      const driftX = Math.sin((localTime / particle.periodX) * twoPi + particle.phaseX) * 4;
      const driftY = Math.sin((localTime / particle.periodY) * twoPi + particle.phaseY) * 4;
      const targetX =
        centerX +
        Math.cos(particle.angle) * particle.radius * haloRadiusX;
      const targetY =
        centerY +
        Math.sin(particle.angle) * particle.radius * haloRadiusY;
      const x = centerX + (targetX - centerX) * launch + driftX * launch;
      const y = centerY + (targetY - centerY) * launch + driftY * launch;
      const normalizedRadius = Math.hypot(
        (x - centerX) / haloRadiusX,
        (y - centerY) / haloRadiusY,
      );
      const fadeProgress = Math.max(
        0,
        Math.min(1, (normalizedRadius - 0.75) / 0.25),
      );
      const edgeFade = 1 - fadeProgress ** 2 * (3 - 2 * fadeProgress);
      const targetAngle = Math.atan2(y - centerY, x - centerX);
      particle.angleNow = lerpAngle(particle.angleNow, targetAngle, 0.12);
      context.globalAlpha = particle.opacity * edgeFade * launch;
      context.strokeStyle = particle.color;
      context.lineWidth = particle.thickness;
      context.lineCap = "round";
      context.save();
      context.translate(x, y);
      context.rotate(particle.angleNow);
      context.beginPath();
      context.moveTo(-particle.length / 2, 0);
      context.lineTo(particle.length / 2, 0);
      context.stroke();
      context.restore();
    }
    context.globalAlpha = 1;
  };

  const render = (time: number) => {
    frameId = 0;
    if (disposed || document.hidden || !burstStartedAt) return;
    draw(time);
    if (!motionPreference.matches) {
      frameId = window.requestAnimationFrame(render);
    }
  };

  const updatePointer = (event: PointerEvent) => {
    const bounds = hero.getBoundingClientRect();
    pointerX = event.clientX;
    pointerY = event.clientY;
    lastPointerWasTouch = event.pointerType === "touch";
    pointerActive =
      pointerX >= bounds.left &&
      pointerX <= bounds.right &&
      pointerY >= bounds.top &&
      pointerY <= bounds.bottom;
    lastPointerAt = performance.now();
  };
  const onPointerMove = (event: PointerEvent) => updatePointer(event);
  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === "touch") updatePointer(event);
  };
  const onPointerLeave = () => {
    if (!lastPointerWasTouch) pointerActive = false;
  };
  const onVisibilityChange = () => {
    if (document.hidden) {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
    } else if (burstStartedAt && !motionPreference.matches) {
      frameId = window.requestAnimationFrame(render);
    }
  };

  try {
    for (const node of textNodes) {
      const parent = node.parentNode;
      if (!parent) continue;
      const characters = Array.from(node.data, (value) => {
        const span = document.createElement("span");
        span.className = "pb-char";
        span.textContent = value;
        span.style.opacity = motionPreference.matches ? "1" : "0";
        return span;
      });
      const fragment = document.createDocumentFragment();
      for (const character of characters) fragment.append(character);
      node.replaceWith(fragment);
      textRuns.push({ node, parent, characters });
    }
    resize();
    if (motionPreference.matches) {
      caret.remove();
      beginBurst();
    } else {
      updateCaret(textRuns[0]?.characters[0]);
      typeTimer = window.setTimeout(typeNext, 0);
    }
  } catch (error) {
    window.clearTimeout(typeTimer);
    restoreText();
    caret.remove();
    console.error("Particle burst enhancement failed:", error);
    return () => {};
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(hero);
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("pointerleave", onPointerLeave);
  document.addEventListener("visibilitychange", onVisibilityChange);

  return () => {
    disposed = true;
    window.clearTimeout(typeTimer);
    window.clearTimeout(caretHoldTimer);
    window.clearTimeout(caretRemoveTimer);
    if (frameId) window.cancelAnimationFrame(frameId);
    resizeObserver.disconnect();
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointerleave", onPointerLeave);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    caret.remove();
    restoreText();
  };
}

type ParticleBurstProps = {
  showBurst?: boolean;
  headlineSelector?: string;
};

export function ParticleBurst({
  showBurst = true,
  headlineSelector = "[data-pb-type]",
}: ParticleBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ENABLE_EFFECTS) return;
    const canvas = canvasRef.current;
    const headline = document.querySelector<HTMLElement>(headlineSelector);
    if (!canvas || !headline) return;
    return initializeParticleBurst(canvas, headline, showBurst);
  }, [headlineSelector, showBurst]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pb-canvas"
    />
  );
}
