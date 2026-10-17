"use client";

import { useEffect, useRef } from "react";

const particleColors = ["#4285F4", "#3B82F6", "#60A5FA", "#8AB4F8", "#A142F4"];
const bracketColor = "#F4B400";
const particleCount = 190;
const springStiffness = 0.07;
const springDamping = 0.84;
const twoPi = Math.PI * 2;

type Particle = {
  index: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  perimeterAngle: number;
  orbitAngle: number;
  phase: number;
  ring: number;
  depth: number;
  spread: number;
  color: string;
  capsule: boolean;
  baseLength: number;
  baseWidth: number;
};

type Cursor = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  hasPosition: boolean;
  lastMove: number;
};

type ParticleSprites = {
  capsule: HTMLCanvasElement;
  dot: HTMLCanvasElement;
};

type BracketTarget = {
  x: number;
  y: number;
  angle: number;
};

function smoothstep(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

function lerpAngle(from: number, to: number, amount: number) {
  const difference = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + difference * amount;
}

function createSprite(
  color: string,
  kind: "capsule" | "dot",
  pixelRatio: number,
) {
  const logicalWidth = kind === "capsule" ? 48 : 12;
  const logicalHeight = kind === "capsule" ? 16 : 12;
  const sprite = document.createElement("canvas");
  sprite.width = Math.round(logicalWidth * pixelRatio);
  sprite.height = Math.round(logicalHeight * pixelRatio);

  const spriteContext = sprite.getContext("2d");
  if (!spriteContext) {
    return sprite;
  }

  spriteContext.scale(pixelRatio, pixelRatio);
  spriteContext.fillStyle = color;
  if (kind === "capsule") {
    spriteContext.beginPath();
    spriteContext.roundRect(0, 3, logicalWidth, 10, 5);
    spriteContext.fill();
  } else {
    spriteContext.beginPath();
    spriteContext.arc(
      logicalWidth / 2,
      logicalHeight / 2,
      4,
      0,
      twoPi,
    );
    spriteContext.fill();
  }

  return sprite;
}

function createParticle(index: number, width: number, height: number): Particle {
  const ring = index % 4;
  const ringSlot = Math.floor(index / 4);
  const ringCount = Math.ceil((particleCount - ring) / 4);
  const perimeterAngle =
    (index / particleCount) * twoPi + (Math.random() - 0.5) * 0.04;
  const launchSpeed = 1.1 + Math.random() * 1.6;

  return {
    index,
    x: width * 0.5 + (Math.random() - 0.5) * width * 0.025,
    y: height * 0.5 + (Math.random() - 0.5) * height * 0.025,
    vx: Math.cos(perimeterAngle) * launchSpeed,
    vy: Math.sin(perimeterAngle) * launchSpeed,
    angle: Math.random() * twoPi,
    perimeterAngle,
    orbitAngle: (ringSlot / ringCount) * twoPi + (Math.random() - 0.5) * 0.08,
    phase: Math.random() * twoPi,
    ring,
    depth: 0.25 + Math.random() * 0.75,
    spread: 0.2 + Math.random() * 0.78,
    color: particleColors[index % particleColors.length],
    capsule: index % 4 !== 0,
    baseLength: 4 + Math.random() * 3.5,
    baseWidth: 1.2 + Math.random() * 1.1,
  };
}

function createBracketTargets(
  width: number,
  height: number,
  count: number,
): [BracketTarget[], BracketTarget[]] {
  const top = height * 0.12;
  const bottom = height * 0.88;
  const hookLength = width * 0.12;
  const radius = Math.min(width * 0.045, height * 0.045);

  const createPath = (left: boolean) => {
    const direction = left ? 1 : -1;
    const outerX = width * (left ? 0.1 : 0.9);
    const innerX = outerX + direction * hookLength;
    const path: Array<{ x: number; y: number }> = [{ x: innerX, y: top }];
    const appendCubic = (
      start: { x: number; y: number },
      control1: { x: number; y: number },
      control2: { x: number; y: number },
      end: { x: number; y: number },
    ) => {
      const steps = 32;
      for (let step = 1; step <= steps; step += 1) {
        const t = step / steps;
        const inverse = 1 - t;
        path.push({
          x:
            inverse ** 3 * start.x +
            3 * inverse ** 2 * t * control1.x +
            3 * inverse * t ** 2 * control2.x +
            t ** 3 * end.x,
          y:
            inverse ** 3 * start.y +
            3 * inverse ** 2 * t * control1.y +
            3 * inverse * t ** 2 * control2.y +
            t ** 3 * end.y,
        });
      }
    };
    const appendLine = (
      start: { x: number; y: number },
      end: { x: number; y: number },
    ) => {
      const steps = Math.max(
        1,
        Math.ceil(Math.hypot(end.x - start.x, end.y - start.y) / 4),
      );
      for (let step = 1; step <= steps; step += 1) {
        const t = step / steps;
        path.push({
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t,
        });
      }
    };

    const topHookEnd = { x: outerX, y: top + radius };
    const topShoulderStart = { x: outerX + direction * radius, y: top };
    path[0] = { x: innerX, y: top };
    appendLine(path[0], topShoulderStart);
    appendCubic(
      topShoulderStart,
      { x: outerX + direction * radius * 0.45, y: top },
      { x: outerX, y: top + radius * 0.45 },
      topHookEnd,
    );
    const bottomHookStart = { x: outerX, y: bottom - radius };
    appendLine(topHookEnd, bottomHookStart);
    const bottomHookEnd = { x: outerX + direction * radius, y: bottom };
    appendCubic(
      bottomHookStart,
      { x: outerX, y: bottom - radius * 0.45 },
      { x: outerX + direction * radius * 0.45, y: bottom },
      bottomHookEnd,
    );
    appendLine(bottomHookEnd, { x: innerX, y: bottom });

    const distances = [0];
    for (let index = 1; index < path.length; index += 1) {
      const previous = path[index - 1];
      const current = path[index];
      distances.push(
        distances[index - 1] +
          Math.hypot(current.x - previous.x, current.y - previous.y),
      );
    }

    return Array.from({ length: count }, (_, index) => {
      const distance = (distances[distances.length - 1] * index) / (count - 1);
      let segment = 1;
      while (segment < distances.length - 1 && distances[segment] < distance) {
        segment += 1;
      }
      const segmentStart = distances[segment - 1];
      const segmentLength = distances[segment] - segmentStart || 1;
      const t = (distance - segmentStart) / segmentLength;
      const start = path[segment - 1];
      const end = path[segment];
      const previous = path[Math.max(0, segment - 2)];
      const next = path[Math.min(path.length - 1, segment + 1)];

      return {
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
        angle: Math.atan2(next.y - previous.y, next.x - previous.x),
      };
    });
  };

  return [createPath(true), createPath(false)];
}

export function AntigravityVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollProgressRef = useRef(0);
  const pointerRef = useRef<Cursor>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    active: false,
    hasPosition: false,
    lastMove: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true, desynchronized: true });
    if (!canvas || !context) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = pointerRef.current;
    let particles: Particle[] = [];
    let sprites = new Map<string, ParticleSprites>();
    let width = 1;
    let height = 1;
    let pixelRatio = 1;
    let bracketTargets: [BracketTarget[], BracketTarget[]] = [[], []];
    let bracketMode = false;
    let bracketBlend = 0;
    let frameId = 0;
    let lastTime = 0;
    let inView = true;

    const updateScrollProgress = () => {
      const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgressRef.current =
        scrollRange > 0 ? window.scrollY / scrollRange : 0;
    };

    const buildSprites = () => {
      sprites = new Map<string, ParticleSprites>();
      for (const color of particleColors) {
        sprites.set(color, {
          capsule: createSprite(color, "capsule", pixelRatio),
          dot: createSprite(color, "dot", pixelRatio),
        });
      }
      sprites.set(bracketColor, {
        capsule: createSprite(bracketColor, "capsule", pixelRatio),
        dot: createSprite(bracketColor, "dot", pixelRatio),
      });
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const previousWidth = width;
      const previousHeight = height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      if (particles.length === 0) {
        particles = Array.from({ length: particleCount }, (_, index) =>
          createParticle(index, width, height),
        );
      } else {
        const scaleX = width / previousWidth;
        const scaleY = height / previousHeight;
        for (const particle of particles) {
          particle.x *= scaleX;
          particle.y *= scaleY;
        }
      }

      bracketTargets = createBracketTargets(
        width,
        height,
        Math.ceil(particleCount / 2),
      );
      buildSprites();
      scheduleRender();
    };

    const getTarget = (particle: Particle, time: number) => {
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const minDimension = Math.min(width, height);
      const elapsed = time * 0.001;
      const progress = Math.min(1, Math.max(0, scrollProgressRef.current));
      const formation = smoothstep((progress - 0.18) / 0.17);
      const warp = smoothstep((progress - 0.7) / 0.3);

      const ambientRadiusX = width * (0.05 + particle.spread * 0.5);
      const ambientRadiusY = height * (0.05 + particle.spread * 0.5);
      const ambientAngle = particle.perimeterAngle;
      const curlX =
        Math.sin(elapsed * (0.65 + particle.depth * 0.3) + particle.phase) *
        5 *
        particle.depth;
      const curlY =
        Math.cos(elapsed * (0.55 + particle.depth * 0.25) + particle.phase) *
        5 *
        particle.depth;
      const ambientX =
        centerX + Math.cos(ambientAngle) * ambientRadiusX + curlX;
      const ambientY =
        centerY + Math.sin(ambientAngle) * ambientRadiusY + curlY;
      const ambientTangent = Math.atan2(
        Math.cos(ambientAngle) * ambientRadiusY,
        -Math.sin(ambientAngle) * ambientRadiusX,
      );

      const ringDirection = particle.ring % 2 === 0 ? 1 : -1;
      const ringAngle =
        particle.orbitAngle +
        ringDirection * elapsed * (0.12 + particle.depth * 0.22);
      const ringRadius = minDimension * (0.145 + particle.ring * 0.067);
      const ringRadiusX = ringRadius * 1.16;
      const ringRadiusY = ringRadius * 0.78;
      const ringTilt = -0.14 + particle.ring * 0.075;
      const cosTilt = Math.cos(ringTilt);
      const sinTilt = Math.sin(ringTilt);
      const localRingX = ringRadiusX * Math.cos(ringAngle);
      const localRingY = ringRadiusY * Math.sin(ringAngle);
      const ringX =
        centerX +
        localRingX * cosTilt -
        localRingY * sinTilt +
        Math.sin(elapsed * 0.45 + particle.phase) * particle.depth * 3;
      const ringY =
        centerY +
        localRingX * sinTilt +
        localRingY * cosTilt +
        Math.cos(elapsed * 0.4 + particle.phase) * particle.depth * 3;
      const localTangentX =
        -ringRadiusX * Math.sin(ringAngle) * ringDirection;
      const localTangentY =
        ringRadiusY * Math.cos(ringAngle) * ringDirection;
      const ringTangent = Math.atan2(
        localTangentX * sinTilt + localTangentY * cosTilt,
        localTangentX * cosTilt - localTangentY * sinTilt,
      );

      const warpAngle =
        particle.perimeterAngle +
        Math.sin(elapsed * 0.7 + particle.phase) * 0.018;
      const warpRadius =
        minDimension *
        (0.18 +
          warp * (0.78 + particle.depth * 0.2) +
          Math.sin(elapsed * (0.8 + particle.depth * 0.2) + particle.phase) *
            0.018);
      const warpX = centerX + Math.cos(warpAngle) * warpRadius;
      const warpY = centerY + Math.sin(warpAngle) * warpRadius;
      const pointerParallaxX =
        pointer.active ? (pointer.x - centerX) * 0.018 * particle.depth : 0;
      const pointerParallaxY =
        pointer.active ? (pointer.y - centerY) * 0.018 * particle.depth : 0;
      const formationX = ambientX + (ringX - ambientX) * formation;
      const formationY = ambientY + (ringY - ambientY) * formation;
      const targetX =
        formationX + (warpX - formationX) * warp + pointerParallaxX;
      const targetY =
        formationY + (warpY - formationY) * warp + pointerParallaxY;
      const formationAngle = lerpAngle(
        ambientTangent,
        ringTangent,
        formation,
      );
      const targetAngle = lerpAngle(formationAngle, warpAngle, warp);
      const bracketTarget =
        bracketTargets[particle.index % 2][Math.floor(particle.index / 2)];

      return {
        x: targetX + (bracketTarget.x - targetX) * bracketBlend,
        y: targetY + (bracketTarget.y - targetY) * bracketBlend,
        angle: lerpAngle(targetAngle, bracketTarget.angle, bracketBlend),
        ambientWeight: (1 - formation) * (1 - warp) * (1 - bracketBlend),
      };
    };

    const drawScene = (time: number, frameScale: number) => {
      context.clearRect(0, 0, width, height);
      context.imageSmoothingEnabled = true;
      const bracketTarget = bracketMode ? 1 : 0;
      if (motionPreference.matches) {
        bracketBlend = bracketTarget;
      } else {
        bracketBlend +=
          (bracketTarget - bracketBlend) * (1 - Math.exp(-0.13 * frameScale));
      }
      for (const particle of particles) {
        const target = getTarget(particle, time);
        let speed = Math.hypot(particle.vx, particle.vy);

        if (motionPreference.matches) {
          particle.x = target.x;
          particle.y = target.y;
          particle.vx = 0;
          particle.vy = 0;
          particle.angle = target.angle;
        } else {
          particle.vx +=
            (target.x - particle.x) * springStiffness * frameScale;
          particle.vy +=
            (target.y - particle.y) * springStiffness * frameScale;
          particle.vy -= 0.016 * target.ambientWeight * frameScale;
          particle.vx +=
            Math.sin(time * 0.001 + particle.phase) *
            0.008 *
            target.ambientWeight *
            frameScale;

          if (pointer.active) {
            const dx = particle.x - pointer.x;
            const dy = particle.y - pointer.y;
            const distance = Math.max(1, Math.hypot(dx, dy));
            const proximity = Math.max(0, 1 - distance / 160);
            if (proximity > 0) {
              const radialForce = proximity * proximity * 1.25 * frameScale;
              const swirlForce = proximity * 0.42 * frameScale;
              particle.vx +=
                (dx / distance) * radialForce -
                (dy / distance) * swirlForce +
                pointer.vx * 0.04 * proximity;
              particle.vy +=
                (dy / distance) * radialForce +
                (dx / distance) * swirlForce +
                pointer.vy * 0.04 * proximity;
            }
          }

          const damping = Math.pow(springDamping, frameScale);
          particle.vx *= damping;
          particle.vy *= damping;
          const maxSpeed = 12;
          const velocity = Math.hypot(particle.vx, particle.vy);
          if (velocity > maxSpeed) {
            const velocityScale = maxSpeed / velocity;
            particle.vx *= velocityScale;
            particle.vy *= velocityScale;
          }
          particle.x += particle.vx * frameScale;
          particle.y += particle.vy * frameScale;
          speed = Math.hypot(particle.vx, particle.vy);

          const direction =
            speed > 0.25 ? Math.atan2(particle.vy, particle.vx) : target.angle;
          const orientationTarget =
            target.ambientWeight > 0.7
              ? lerpAngle(target.angle, direction, 0.65)
              : target.angle;
          particle.angle = lerpAngle(
            particle.angle,
            orientationTarget,
            1 - Math.exp(-0.24 * frameScale),
          );
        }

        const depthScale = 0.65 + particle.depth * 0.55;
        const opacity = 0.2 + ((particle.depth - 0.25) / 0.75) * 0.7;
        const bracketScale = 1 + bracketBlend * 1.4;
        const pulse = motionPreference.matches
          ? 1
          : 0.92 +
            0.08 * (0.5 + 0.5 * Math.sin(time * 0.002 + particle.phase));
        const sprite = sprites.get(particle.color);
        const bracketSprite = sprites.get(bracketColor);
        if (!sprite || !bracketSprite) continue;

        context.shadowColor =
          bracketBlend > 0.01 ? bracketColor : particle.color;
        context.shadowBlur = bracketBlend * 7;
        context.save();
        context.translate(particle.x, particle.y);
        if (particle.capsule) {
          const length = Math.min(
            24,
            (particle.baseLength + speed * 0.4) *
              depthScale *
              bracketScale,
          );
          const ambientThickness = particle.baseWidth * depthScale;
          const bracketThickness = 7.5 + particle.depth * 2.5;
          context.rotate(particle.angle);
          const drawCapsule = (
            capsuleSprite: HTMLCanvasElement,
            alpha: number,
            thickness: number,
          ) => {
            context.globalAlpha = alpha;
            context.drawImage(
              capsuleSprite,
              -length / 2,
              -thickness / 2,
              length,
              thickness,
            );
          };
          const particleOpacity = Math.min(
            0.96,
            Math.max(0.2, (opacity + (0.96 - opacity) * bracketBlend) * pulse),
          );
          drawCapsule(
            sprite.capsule,
            particleOpacity * (1 - bracketBlend),
            ambientThickness,
          );
          drawCapsule(
            bracketSprite.capsule,
            particleOpacity * bracketBlend,
            ambientThickness + (bracketThickness - ambientThickness) * bracketBlend,
          );
        } else {
          const diameter =
            (1.4 + particle.depth * 1.1) * depthScale * bracketScale;
          const particleOpacity = Math.min(
            0.96,
            Math.max(0.2, (opacity + (0.96 - opacity) * bracketBlend) * pulse),
          );
          context.globalAlpha = particleOpacity * (1 - bracketBlend);
          context.drawImage(
            sprite.dot,
            -diameter / 2,
            -diameter / 2,
            diameter,
            diameter,
          );
          context.globalAlpha = particleOpacity * bracketBlend;
          context.drawImage(
            bracketSprite.dot,
            -diameter / 2,
            -diameter / 2,
            diameter,
            diameter,
          );
        }
        context.restore();
      }

      context.globalAlpha = 1;
      context.shadowBlur = 0;
    };

    const render = (time: number) => {
      frameId = 0;
      if (!inView || document.hidden) return;
      bracketMode = bracketTrigger?.matches(":hover") ?? false;
      const delta = lastTime
        ? Math.min(32, Math.max(0, time - lastTime))
        : 16.667;
      const frameScale = Math.max(0.25, delta / 16.667);
      lastTime = time;
      drawScene(time, frameScale);
      pointer.vx *= Math.pow(springDamping, frameScale);
      pointer.vy *= Math.pow(springDamping, frameScale);
      if (!motionPreference.matches) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    const scheduleRender = () => {
      if (inView && !document.hidden && frameId === 0) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    const bracketTrigger = canvas.closest<HTMLElement>(
      "[data-antigravity-trigger]",
    );
    const onBracketEnter = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      bracketMode = true;
      scheduleRender();
    };
    const onBracketLeave = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      bracketMode = false;
      scheduleRender();
    };

    const onScroll = () => {
      updateScrollProgress();
      scheduleRender();
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const now = performance.now();
      if (pointer.hasPosition) {
        const elapsed = Math.max(1, now - pointer.lastMove);
        const velocityScale = 16.667 / elapsed;
        pointer.vx = Math.max(-24, Math.min(24, (x - pointer.x) * velocityScale));
        pointer.vy = Math.max(-24, Math.min(24, (y - pointer.y) * velocityScale));
      } else {
        pointer.hasPosition = true;
        pointer.vx = 0;
        pointer.vy = 0;
      }

      pointer.x = x;
      pointer.y = y;
      pointer.lastMove = now;
      pointer.active =
        event.pointerType !== "touch" &&
        x >= 0 &&
        y >= 0 &&
        x <= bounds.width &&
        y <= bounds.height;
      scheduleRender();
    };

    const onBlur = () => {
      pointer.active = false;
      pointer.hasPosition = false;
      scheduleRender();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (frameId) window.cancelAnimationFrame(frameId);
        frameId = 0;
      } else {
        lastTime = performance.now();
        scheduleRender();
      }
    };

    const onMotionPreferenceChange = () => {
      if (motionPreference.matches) {
        if (frameId) window.cancelAnimationFrame(frameId);
        frameId = 0;
        drawScene(performance.now(), 1);
      } else {
        lastTime = performance.now();
        scheduleRender();
      }
    };

    resize();
    updateScrollProgress();
    lastTime = performance.now();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) {
        lastTime = performance.now();
        scheduleRender();
      } else if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    });
    intersectionObserver.observe(canvas);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", onBlur);
    bracketTrigger?.addEventListener("pointerenter", onBracketEnter);
    bracketTrigger?.addEventListener("pointerleave", onBracketLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);
    motionPreference.addEventListener("change", onMotionPreferenceChange);
    scheduleRender();

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", onBlur);
      bracketTrigger?.removeEventListener("pointerenter", onBracketEnter);
      bracketTrigger?.removeEventListener("pointerleave", onBracketLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionPreference.removeEventListener("change", onMotionPreferenceChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 size-full"
    />
  );
}
