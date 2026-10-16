"use client";

import { useEffect, useRef, type RefObject } from "react";

export type DashFieldPalette = "antigravity" | "gdg";

type DashFieldProps = {
  count?: number;
  palette?: DashFieldPalette;
  repelRadius?: number;
  clearZoneRef?: RefObject<HTMLElement | null>;
  wide?: boolean;
};

type Particle = {
  x: number;
  y: number;
  depth: number;
  phase: number;
  period: number;
  breathing: number;
  swirl: number;
  kind: "dash" | "micro";
  length: number;
  thickness: number;
  opacity: number;
  offsetX: number;
  offsetY: number;
  velocityX: number;
  velocityY: number;
};

type Pointer = {
  x: number;
  y: number;
  active: boolean;
};

const twoPi = Math.PI * 2;
const microCountRatio = 0.5;
const colorStops: Record<DashFieldPalette, Array<[number, string]>> = {
  antigravity: [
    [0, "#6C4BD6"],
    [0.25, "#4169E1"],
    [0.32, "#B04A9E"],
    [0.4, "#E0483E"],
    [0.45, "#F28B2B"],
    [0.5, "#FBBC04"],
    [0.75, "#E0483E"],
    [1, "#6C4BD6"],
  ],
  gdg: [
    [0, "#4285F4"],
    [0.25, "#EA4335"],
    [0.5, "#FBBC04"],
    [0.75, "#34A853"],
    [1, "#4285F4"],
  ],
};

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function mixColor(start: string, end: string, amount: number) {
  const from = Number.parseInt(start.slice(1), 16);
  const to = Number.parseInt(end.slice(1), 16);
  const channel = (shift: number) =>
    Math.round(
      ((from >> shift) & 255) +
        (((to >> shift) & 255) - ((from >> shift) & 255)) * amount,
    );
  return `rgb(${channel(16)} ${channel(8)} ${channel(0)})`;
}

function colorAt(angle: number, palette: DashFieldPalette) {
  const phase = ((angle + Math.PI / 2) / twoPi + 1) % 1;
  const stops = colorStops[palette];
  const stopIndex = stops.findIndex(([offset]) => offset >= phase);
  const index = stopIndex <= 0 ? 0 : stopIndex - 1;
  const [startOffset, startColor] = stops[index];
  const [endOffset, endColor] = stops[index + 1];
  return mixColor(
    startColor,
    endColor,
    (phase - startOffset) / (endOffset - startOffset),
  );
}

function poissonPoints(width: number, height: number, count: number) {
  const minimumDistance = 18;
  const cellSize = minimumDistance / Math.SQRT2;
  const columns = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  const grid = new Int32Array(columns * rows).fill(-1);
  const targetPerSide = [Math.ceil(count / 2), Math.floor(count / 2)];
  const sideCounts = [0, 0];
  const points: Array<{ x: number; y: number }> = [];
  const minimumDistanceSquared = minimumDistance ** 2;

  const canPlace = (x: number, y: number) => {
    const column = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    for (
      let nearbyRow = Math.max(0, row - 2);
      nearbyRow <= Math.min(rows - 1, row + 2);
      nearbyRow += 1
    ) {
      for (
        let nearbyColumn = Math.max(0, column - 2);
        nearbyColumn <= Math.min(columns - 1, column + 2);
        nearbyColumn += 1
      ) {
        const pointIndex = grid[nearbyRow * columns + nearbyColumn];
        if (pointIndex < 0) continue;
        const point = points[pointIndex];
        if (
          (point.x - x) ** 2 + (point.y - y) ** 2 <
          minimumDistanceSquared
        ) {
          return false;
        }
      }
    }
    return true;
  };

  let attempts = 0;
  const maximumAttempts = Math.max(10000, count * 1000);
  while (points.length < count && attempts < maximumAttempts) {
    attempts += 1;
    const side =
      sideCounts[0] >= targetPerSide[0]
        ? 1
        : sideCounts[1] >= targetPerSide[1]
          ? 0
          : Math.random() < 0.5
            ? 0
            : 1;
    const x = (side + Math.random()) * (width / 2);
    const y = Math.random() * height;
    if (!canPlace(x, y)) continue;
    const pointIndex = points.length;
    points.push({ x, y });
    grid[Math.floor(y / cellSize) * columns + Math.floor(x / cellSize)] =
      pointIndex;
    sideCounts[side] += 1;
  }
  if (points.length !== count) {
    throw new Error(
      `DashField could not place ${count - points.length} particles with 18px spacing.`,
    );
  }
  return points;
}

function createParticles(width: number, height: number, dashCount: number) {
  const microCount = Math.round(dashCount * microCountRatio);
  const totalCount = dashCount + microCount;
  const points = poissonPoints(width, height, totalCount);
  const particles: Particle[] = [];
  const dashTypes = [
    { weight: 0.35, length: 4, thickness: 2 },
    { weight: 0.45, length: 5.5, thickness: 2.3 },
    { weight: 0.15, length: 7, thickness: 3 },
    { weight: 0.05, length: 8.5, thickness: 3.2 },
  ] as const;
  const dashIndexes = new Set<number>();
  while (dashIndexes.size < dashCount) {
    dashIndexes.add(Math.floor(Math.random() * totalCount));
  }

  for (let index = 0; index < totalCount; index += 1) {
    const point = points[index];
    const dashType = dashIndexes.has(index);
    const roll = Math.random();
    let cumulativeWeight = 0;
    const type = dashType
      ? dashTypes.find((candidate) => {
          cumulativeWeight += candidate.weight;
          return roll < cumulativeWeight;
        }) ?? dashTypes[dashTypes.length - 1]
      : {
          length: 0.5 + Math.random() * 0.5,
          thickness: 0.5 + Math.random() * 0.3,
          weight: 0,
        };
    particles.push({
      x: point.x / width,
      y: point.y / height,
      depth: 0.25 + Math.random() * 0.75,
      phase: Math.random() * twoPi,
      period: 5 + Math.random() * 6,
      breathing: 6 + Math.random() * 6,
      swirl: (Math.random() - 0.5) * 0.01,
      kind: dashType ? "dash" : "micro",
      length: type.length,
      thickness: type.thickness,
      opacity: dashType ? 0.8 + Math.random() * 0.2 : 0.4,
      offsetX: 0,
      offsetY: 0,
      velocityX: 0,
      velocityY: 0,
    });
  }
  return particles;
}

export function DashField({
  count,
  palette = "antigravity",
  repelRadius = 140,
  clearZoneRef,
  wide = false,
}: DashFieldProps) {
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
    const pointer: Pointer = { x: 0, y: 0, active: false };
    let particles: Particle[] = [];
    let width = 1;
    let height = 1;
    let pixelRatio = 1;
    let frameId = 0;
    let resizeTimer = 0;
    let startTime = 0;
    let previousTime = 0;
    let inView = true;
    let cursorNudge = 0;
    let clearZones: HTMLElement[] = [];

    const desiredDashCount = () =>
      count ??
      Math.max(1, Math.round((700 * width * height) / (1900 * 850)));

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const oldWidth = width;
      const oldHeight = height;
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      pixelRatio = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const nextDashCount = Math.max(1, Math.floor(desiredDashCount()));
      const nextTotalCount =
        nextDashCount + Math.round(nextDashCount * microCountRatio);
      if (particles.length !== nextTotalCount) {
        particles = createParticles(width, height, nextDashCount);
        startTime = performance.now();
      } else {
        const scaleX = width / oldWidth;
        const scaleY = height / oldHeight;
        for (const particle of particles) {
          particle.offsetX *= scaleX;
          particle.offsetY *= scaleY;
        }
      }
      schedule();
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const elapsed = Math.max(0, (time - startTime) / 1000);
      const frameScale = previousTime
        ? Math.min(2, Math.max(0.25, (time - previousTime) / 16.667))
        : 1;
      previousTime = time;
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const maxRadius = Math.hypot(centerX, centerY);
      const rotationOffset = motionPreference.matches
        ? 0
        : (elapsed / 90) * twoPi;
      const pointerAngle = pointer.active
        ? Math.atan2(pointer.y - centerY, pointer.x - centerX)
        : 0;
      const targetNudge = pointer.active ? pointerAngle * 0.08 : 0;
      cursorNudge += (targetNudge - cursorNudge) * 0.035 * frameScale;
      const canvasBounds = canvas.getBoundingClientRect();
      const clearZoneBounds = clearZones.map((clearZone) => {
        const bounds = clearZone.getBoundingClientRect();
        return {
          left: bounds.left - canvasBounds.left - 24,
          right: bounds.right - canvasBounds.left + 24,
          top: bounds.top - canvasBounds.top - 24,
          bottom: bounds.bottom - canvasBounds.top + 24,
        };
      });

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        const baseOffsetX = (particle.x - 0.5) * width;
        const baseOffsetY = (particle.y - 0.5) * height;
        const baseRadius = Math.hypot(baseOffsetX, baseOffsetY);
        const baseAngle = Math.atan2(baseOffsetY, baseOffsetX);
        const normalizedRadius = baseRadius / maxRadius;
        const launchDelay = normalizedRadius * 0.25;
        const launchProgress = motionPreference.matches
          ? 1
          : Math.max(0, Math.min(1, (elapsed - launchDelay) / 1.6));
        const launchScale = motionPreference.matches
          ? 1
          : launchProgress === 0
            ? 0
            : 1 - 2 ** (-10 * launchProgress);
        const breathing = motionPreference.matches
          ? 0
          : Math.sin((elapsed / particle.period) * twoPi + particle.phase) *
            particle.breathing *
            launchScale;
        const angle =
          baseAngle +
          (motionPreference.matches ? 0 : elapsed * particle.swirl);
        const radius = Math.max(0, baseRadius * launchScale + breathing);
        const introOffset = 0.45 * (1 - launchScale);
        const naturalX =
          centerX + Math.cos(angle) * radius * (1 - introOffset);
        const naturalY =
          centerY + Math.sin(angle) * radius * (1 - introOffset);
        const pointerDistance = pointer.active
          ? Math.hypot(naturalX - pointer.x, naturalY - pointer.y)
          : repelRadius;
        let pushTargetX = 0;
        let pushTargetY = 0;
        if (pointer.active && pointerDistance < repelRadius) {
          const falloff = 1 - pointerDistance / repelRadius;
          const force = falloff * falloff * 36;
          const dx = naturalX - pointer.x;
          const dy = naturalY - pointer.y;
          const distance = Math.max(1, pointerDistance);
          pushTargetX = (dx / distance) * force;
          pushTargetY = (dy / distance) * force;
        }

        if (!motionPreference.matches) {
          particle.velocityX =
            (particle.velocityX +
              (pushTargetX - particle.offsetX) * 0.08 * frameScale) *
            0.85 ** frameScale;
          particle.velocityY =
            (particle.velocityY +
              (pushTargetY - particle.offsetY) * 0.08 * frameScale) *
            0.85 ** frameScale;
          particle.offsetX += particle.velocityX * frameScale;
          particle.offsetY += particle.velocityY * frameScale;
        }

        const x = naturalX + particle.offsetX;
        const y = naturalY + particle.offsetY;
        let clearOpacity = 1;
        for (const bounds of clearZoneBounds) {
          const outsideX = Math.max(bounds.left - x, 0, x - bounds.right);
          const outsideY = Math.max(bounds.top - y, 0, y - bounds.bottom);
          const distanceFromZone = Math.hypot(outsideX, outsideY);
          clearOpacity = Math.min(
            clearOpacity,
            smoothstep(0, 60, distanceFromZone),
          );
        }
        if (clearOpacity <= 0.005 || launchScale <= 0) continue;

        const distanceFromCenter = Math.hypot(x - centerX, y - centerY);
        const distanceRatio = distanceFromCenter / maxRadius;
        const becomesEdgeMicro = particle.kind === "dash" && distanceRatio > 0.9;
        const isMicro = particle.kind === "micro" || becomesEdgeMicro;
        const midBandScale =
          1 + 0.08 * (1 - Math.min(1, Math.abs(distanceRatio - 0.5) / 0.5));
        const gradientAngle =
          Math.atan2(y - centerY, x - centerX) - rotationOffset - cursorNudge;
        context.fillStyle = colorAt(gradientAngle, palette);
        context.globalAlpha =
          clearOpacity *
          launchScale *
          (isMicro ? (becomesEdgeMicro ? 0.4 : particle.opacity) : particle.opacity);
        context.save();
        context.translate(x, y);
        context.rotate(Math.atan2(y - centerY, x - centerX));
        const length = isMicro ? 1 : particle.length * midBandScale;
        const thickness = isMicro ? 1 : particle.thickness * midBandScale;
        context.beginPath();
        context.roundRect(
          -length / 2,
          -thickness / 2,
          length,
          thickness,
          thickness / 2,
        );
        context.fill();
        context.restore();
      }

      context.globalAlpha = 1;
    };

    const render = (time: number) => {
      frameId = 0;
      if (!inView || document.hidden) return;
      draw(time);
      if (!motionPreference.matches) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    const schedule = () => {
      if (inView && !document.hidden && frameId === 0) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.active =
        event.pointerType !== "touch" &&
        pointer.x >= 0 &&
        pointer.y >= 0 &&
        pointer.x <= bounds.width &&
        pointer.y <= bounds.height;
      schedule();
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 100);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (frameId) window.cancelAnimationFrame(frameId);
        frameId = 0;
      } else {
        previousTime = 0;
        schedule();
      }
    };

    const onMotionPreferenceChange = () => {
      if (motionPreference.matches) {
        if (frameId) window.cancelAnimationFrame(frameId);
        frameId = 0;
        draw(performance.now());
      } else {
        startTime = performance.now() - 1600;
        previousTime = 0;
        schedule();
      }
    };

    clearZones = Array.from(
      (canvas.parentElement ?? document).querySelectorAll<HTMLElement>(
        "[data-dashfield-clear-zone]",
      ),
    );
    if (clearZoneRef?.current && !clearZones.includes(clearZoneRef.current)) {
      clearZones.push(clearZoneRef.current);
    }
    startTime = performance.now();
    resize();
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(canvas);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) schedule();
      else if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    });
    intersectionObserver.observe(canvas);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    motionPreference.addEventListener("change", onMotionPreferenceChange);
    if (motionPreference.matches) draw(performance.now());
    else schedule();

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionPreference.removeEventListener("change", onMotionPreferenceChange);
    };
  }, [clearZoneRef, count, palette, repelRadius]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={
        wide
          ? "pointer-events-none absolute -inset-y-40 left-1/2 z-0 h-[calc(100%+20rem)] w-screen -translate-x-1/2"
          : "pointer-events-none absolute -inset-x-32 -inset-y-40 z-0 h-[calc(100%+20rem)] w-[calc(100%+16rem)]"
      }
    />
  );
}
