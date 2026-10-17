"use client";

import { useEffect, useRef } from "react";

export type BraceFieldProps = {
  spacing?: number;
  ttlRange?: readonly [number, number];
  shapeRatio?: number;
  hitPadding?: number;
};

type Point = { x: number; y: number };
type Card = {
  element: HTMLElement;
  timer: number;
  dirty: boolean;
  targets: Target[];
  contours: Point[][];
};
type Target = Point & { group: number; slides: boolean };
type Lattice = {
  x: Float32Array;
  y: Float32Array;
  key: Float64Array;
  radius: Float32Array;
  length: number;
};
type ShapeDot = {
  sourceKey: number;
  sourceX: number;
  sourceY: number;
  targetIndex: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  delay: number;
  ttl: number;
  size: number;
  speck: boolean;
  releasing: boolean;
  releaseAt: number;
  releaseFromX: number;
  releaseFromY: number;
  releaseX: number;
  releaseY: number;
  releaseAngle: number;
};

const TAU = Math.PI * 2;
const BLUE = "#4169E1";
const RED = "#D93025";
const BLACK = "#1A1B1F";
const DEFAULT_TTL_RANGE = [800, 2500] as const;

function hash(row: number, column: number) {
  let value = Math.imul(row, 0x45d9f3b) ^ Math.imul(column, 0x119de1f3);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

function noise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(iy, ix) * 2 - 1;
  const b = hash(iy, ix + 1) * 2 - 1;
  const c = hash(iy + 1, ix) * 2 - 1;
  const d = hash(iy + 1, ix + 1) * 2 - 1;
  return (a + (b - a) * ux) * (1 - uy) + (c + (d - c) * ux) * uy;
}

function sampleBlueNoise(points: Point[], amount: number, initialGap: number) {
  for (let index = points.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [points[index], points[swap]] = [points[swap], points[index]];
  }
  for (let gap = initialGap; gap >= 3; gap -= 1) {
    const selected: Point[] = [];
    const gapSquared = gap * gap;
    for (const point of points) {
      if (
        selected.every(
          (other) =>
            (other.x - point.x) ** 2 + (other.y - point.y) ** 2 >= gapSquared,
        )
      ) {
        selected.push(point);
        if (selected.length === amount) return selected;
      }
    }
    if (selected.length >= amount) return selected.slice(0, amount);
  }
  return points.slice(0, amount);
}

function braceRaster(width: number, height: number, mirror: boolean) {
  if (width <= 0 || height <= 0) return { edge: [], body: [] };
  const lineWidth = height * 0.1;
  const padding = Math.ceil(lineWidth + 3);
  const raster = document.createElement("canvas");
  raster.width = Math.ceil(width + padding * 2);
  raster.height = Math.ceil(height + padding * 2);
  const context = raster.getContext("2d", { willReadFrequently: true });
  if (!context) return { edge: [], body: [] };

  context.translate(padding, padding);
  if (mirror) {
    context.translate(width, 0);
    context.scale(-1, 1);
  }
  context.beginPath();
  context.moveTo(width, 0);
  context.bezierCurveTo(width * 0.56, height * 0.1, width * 0.56, height * 0.34, 0, height * 0.5);
  context.bezierCurveTo(width * 0.56, height * 0.66, width * 0.56, height * 0.9, width, height);
  context.lineWidth = lineWidth;
  context.lineCap = "square";
  context.lineJoin = "round";
  context.strokeStyle = "#fff";
  context.stroke();

  const image = context.getImageData(0, 0, raster.width, raster.height);
  const occupied = (x: number, y: number) =>
    x >= 0 &&
    y >= 0 &&
    x < image.width &&
    y < image.height &&
    image.data[(y * image.width + x) * 4 + 3] !== 0;
  const body: Point[] = [];
  const edge: Point[] = [];
  for (let y = padding; y < padding + height; y += 1) {
    for (let x = padding; x < padding + width; x += 1) {
      if (!occupied(x, y)) continue;
      const point = { x: x - padding, y: y - padding };
      body.push(point);
      if (
        !occupied(x - 1, y) ||
        !occupied(x + 1, y) ||
        !occupied(x, y - 1) ||
        !occupied(x, y + 1)
      ) {
        edge.push(point);
      }
    }
  }
  return { edge, body };
}

function buildBraceTargets(element: HTMLElement, shapeRatio: number): {
  targets: Target[];
  contours: Point[][];
} {
  const bounds = element.getBoundingClientRect();
  const heading = element.querySelector<HTMLElement>("h1, h2, h3, h4");
  const range = document.createRange();
  if (heading) range.selectNodeContents(heading);
  const headingWidth = heading ? range.getBoundingClientRect().width : bounds.width;
  const textWidth = Math.max(headingWidth, 340);
  const blockHeight = Math.max(bounds.height, 200);
  const centerX = bounds.width / 2;
  const centerY = bounds.height / 2;
  const braceHeight = blockHeight * 2.27 * shapeRatio;
  const braceWidth = textWidth * 0.6;
  const top = centerY - braceHeight / 2;
  const targets: Target[] = [];
  const contours: Point[][] = [];

  for (const mirror of [false, true]) {
    const mask = braceRaster(braceWidth, braceHeight, mirror);
    const left =
      mirror
        ? centerX + textWidth * 0.82 - braceWidth
        : centerX - textWidth * 0.82;
    const sampled = sampleBlueNoise(mask.edge, 165, 8);
    const localCenter = {
      x: sampled.reduce((sum, point) => sum + point.x, 0) / sampled.length,
      y: sampled.reduce((sum, point) => sum + point.y, 0) / sampled.length,
    };
    sampled.sort(
      (a, b) =>
        Math.atan2(a.y - localCenter.y, a.x - localCenter.x) -
        Math.atan2(b.y - localCenter.y, b.x - localCenter.x),
    );
    const contour = sampled.map((point) => ({
      x: left + point.x,
      y: top + point.y,
    }));
    const group = contours.length;
    contours.push(contour);
    for (const point of contour) targets.push({ ...point, group, slides: true });

    const interior = sampleBlueNoise(mask.body, Math.ceil(165 * 0.1), 8);
    for (const point of interior) {
      targets.push({
        x: left + point.x,
        y: top + point.y,
        group: -1,
        slides: false,
      });
    }
  }
  return { targets, contours };
}

function hexMix(from: string, to: string, amount: number) {
  const a = Number.parseInt(from.slice(1), 16);
  const b = Number.parseInt(to.slice(1), 16);
  const channel = (shift: number) =>
    Math.round(
      ((a >> shift) & 255) + (((b >> shift) & 255) - ((a >> shift) & 255)) * amount,
    );
  return `rgb(${channel(16)} ${channel(8)} ${channel(0)})`;
}

export function BraceField({
  spacing = 20,
  ttlRange = DEFAULT_TTL_RANGE,
  shapeRatio = 1,
  hitPadding = 32,
}: BraceFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true, desynchronized: true });
    if (!canvas || !context) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cards: Card[] = Array.from(
      document.querySelectorAll<HTMLElement>('[data-dotshape="braces"]'),
      (element) => ({ element, timer: 0, dirty: true, targets: [], contours: [] }),
    );
    const occupied = new Set<number>();
    const dots: ShapeDot[] = [];
    const cardCleanups: Array<() => void> = [];
    let activeCard: Card | null = null;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(2, window.devicePixelRatio || 1);
    let frameId = 0;
    let inView = true;
    let scrollX = window.scrollX;
    let scrollY = window.scrollY;
    let activeStartedAt = 0;
    let pointerX = -1;
    let pointerY = -1;
    let slots: Lattice = {
      x: new Float32Array(0),
      y: new Float32Array(0),
      key: new Float64Array(0),
      radius: new Float32Array(0),
      length: 0,
    };

    const reduced = () => motionPreference.matches;
    const schedule = () => {
      if (!document.hidden && inView && frameId === 0) {
        frameId = window.requestAnimationFrame(render);
      }
    };
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      cards.forEach((card) => (card.dirty = true));
      schedule();
    };
    const gridKey = (row: number, column: number) =>
      row * 1000000 + column;

    const getSlots = (now: number): Lattice => {
      const cellSpacing = Math.max(1, spacing);
      const firstRow = Math.floor(scrollY / cellSpacing) - 1;
      const lastRow = Math.ceil((scrollY + height) / cellSpacing) + 1;
      const firstColumn = Math.floor(scrollX / cellSpacing) - 1;
      const lastColumn = Math.ceil((scrollX + width) / cellSpacing) + 1;
      const capacity =
        (lastRow - firstRow + 1) * (lastColumn - firstColumn + 1);
      if (slots.x.length < capacity) {
        slots = {
          x: new Float32Array(capacity),
          y: new Float32Array(capacity),
          key: new Float64Array(capacity),
          radius: new Float32Array(capacity),
          length: 0,
        };
      }
      const { x, y, key, radius } = slots;
      const t = now * 0.001;
      let length = 0;
      for (let row = firstRow; row <= lastRow; row += 1) {
        const documentY = row * cellSpacing;
        const stagger = (row & 1) * cellSpacing * 0.5;
        for (let column = firstColumn; column <= lastColumn; column += 1) {
          const documentX = column * cellSpacing + stagger;
          const px = documentX - scrollX;
          const py = documentY - scrollY;
          const warpedX = reduced()
            ? px
            : px + Math.sin(documentY / 340 + t * 0.008) * 5;
          const warpedY = reduced()
            ? py
            : py + Math.sin((documentX + documentY) / 340 + t * 0.008) * 5;
          if (warpedX < -2 || warpedX > width + 2 || warpedY < -2 || warpedY > height + 2) {
            continue;
          }
          x[length] = warpedX;
          y[length] = warpedY;
          key[length] = gridKey(row, column);
          radius[length] = hash(row, column) < 0.8 ? 0.65 : 0.875;
          length += 1;
        }
      }
      slots.length = length;
      return slots;
    };

    const buildTargets = (card: Card) => {
      const definition = buildBraceTargets(card.element, shapeRatio);
      card.targets = definition.targets;
      card.contours = definition.contours;
      card.dirty = false;
    };
    const targetPoint = (dot: ShapeDot, now: number) => {
      if (!activeCard) return { x: dot.x, y: dot.y };
      const target = activeCard.targets[dot.targetIndex];
      const bounds = activeCard.element.getBoundingClientRect();
      if (!target) return { x: dot.x, y: dot.y };
      let x = target.x;
      let y = target.y;
      if (!reduced() && target.slides && target.group >= 0) {
        const contour = activeCard.contours[target.group];
        const advance = ((now - activeStartedAt) * 0.0004) % contour.length;
        const position = (dot.targetIndex + advance + contour.length) % contour.length;
        const before = Math.floor(position);
        const after = (before + 1) % contour.length;
        const blend = position - before;
        x = contour[before].x + (contour[after].x - contour[before].x) * blend;
        y = contour[before].y + (contour[after].y - contour[before].y) * blend;
        x += noise(now * 0.00015, dot.targetIndex * 0.17) * 1.5;
        y += noise(now * 0.00015 + 13, dot.targetIndex * 0.17) * 1.5;
      }
      return { x: bounds.left + x, y: bounds.top + y };
    };
    const removeDot = (dot: ShapeDot) => {
      occupied.delete(dot.sourceKey);
      const index = dots.indexOf(dot);
      if (index >= 0) dots.splice(index, 1);
    };
    const startRelease = (dot: ShapeDot, now: number) => {
      if (dot.releasing) return;
      dot.releasing = true;
      dot.releaseAt = now + Math.random() * (reduced() ? 0 : 150);
      dot.releaseFromX = dot.x;
      dot.releaseFromY = dot.y;
      dot.releaseAngle = Math.random() * TAU;
      const slotIndex = findSlot(dot.sourceKey);
      dot.releaseX = slotIndex >= 0 ? slots.x[slotIndex] : dot.sourceX;
      dot.releaseY = slotIndex >= 0 ? slots.y[slotIndex] : dot.sourceY;
      dot.vx = 0;
      dot.vy = 0;
    };
    const releaseAll = (now: number) => {
      for (const dot of dots) startRelease(dot, now);
      activeCard = null;
    };
    const findSlot = (key: number) => {
      for (let index = 0; index < slots.length; index += 1) {
        if (slots.key[index] === key) return index;
      }
      return -1;
    };
    const findNearestSlot = (targetX: number, targetY: number) => {
      let nearestIndex = -1;
      let nearestDistance = 120 * 120;
      for (let index = 0; index < slots.length; index += 1) {
        const key = slots.key[index];
        if (occupied.has(key)) continue;
        const distance =
          (slots.x[index] - targetX) ** 2 + (slots.y[index] - targetY) ** 2;
        if (distance < nearestDistance) {
          nearestIndex = index;
          nearestDistance = distance;
        }
      }
      return nearestIndex;
    };
    const createDot = (slotIndex: number, targetIndex: number, now: number) => {
      const card = activeCard;
      if (!card) return null;
      const target = card.targets[targetIndex];
      const bounds = card.element.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const pointX = bounds.left + target.x;
      const pointY = bounds.top + target.y;
      const slotKey = slots.key[slotIndex];
      const lifetimeRandom = Math.random() ** 2;
      const lower = Math.max(1, Math.min(ttlRange[0], ttlRange[1]));
      const upper = Math.max(lower, Math.max(ttlRange[0], ttlRange[1]));
      const dot: ShapeDot = {
        sourceKey: slotKey,
        sourceX: slots.x[slotIndex],
        sourceY: slots.y[slotIndex],
        targetIndex,
        x: slots.x[slotIndex],
        y: slots.y[slotIndex],
        vx: 0,
        vy: 0,
        born: now,
        delay:
          250 +
          (Math.hypot(pointX - centerX, pointY - centerY) /
            Math.max(
              1,
              ...card.targets.map((candidate) =>
                Math.hypot(
                  bounds.left + candidate.x - centerX,
                  bounds.top + candidate.y - centerY,
                ),
              ),
            )) *
            450,
        ttl: reduced()
          ? Number.POSITIVE_INFINITY
          : lower + lifetimeRandom * (upper - lower),
        size: (() => {
          const roll = Math.random();
          if (roll < 0.1) return 1.25 + Math.random() * 0.25;
          if (roll < 0.5) return 1.5 + Math.random() * 0.5;
          if (roll < 0.9) return 2 + Math.random() * 1.2;
          return 3.2 + Math.random() * 0.3;
        })(),
        speck: Math.random() < 0.05,
        releasing: false,
        releaseAt: 0,
        releaseFromX: 0,
        releaseFromY: 0,
        releaseX: 0,
        releaseY: 0,
        releaseAngle: 0,
      };
      occupied.add(slotKey);
      if (reduced()) {
        dot.x = pointX;
        dot.y = pointY;
      }
      dots.push(dot);
      return dot;
    };

    const recruit = (now: number, limit: number) => {
      const card = activeCard;
      if (!card) return;
      const assigned = new Set(
        dots.filter((dot) => !dot.releasing).map((dot) => dot.targetIndex),
      );
      if (assigned.size >= card.targets.length) return;
      const bounds = card.element.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const nextTargets = card.targets
        .map((target, index) => ({ target, index }))
        .filter(({ index }) => !assigned.has(index))
        .sort(
          (a, b) =>
            Math.hypot(bounds.left + a.target.x - centerX, bounds.top + a.target.y - centerY) -
            Math.hypot(bounds.left + b.target.x - centerX, bounds.top + b.target.y - centerY),
        );
      for (const { target, index } of nextTargets.slice(0, limit)) {
        const slotIndex = findNearestSlot(bounds.left + target.x, bounds.top + target.y);
        if (slotIndex < 0) continue;
        createDot(slotIndex, index, now);
      }
    };

    const hitTest = (card: Card, x: number, y: number) => {
      const bounds = card.element.getBoundingClientRect();
      return (
        x >= bounds.left - hitPadding &&
        x <= bounds.right + hitPadding &&
        y >= bounds.top - hitPadding &&
        y <= bounds.bottom + hitPadding
      );
    };
    const activate = (card: Card | null) => {
      if (activeCard === card) {
        if (card) window.clearTimeout(card.timer);
        return;
      }
      if (activeCard) releaseAll(performance.now());
      activeCard = card;
      if (card) {
        activeStartedAt = performance.now();
        window.clearTimeout(card.timer);
        if (card.dirty) buildTargets(card);
      }
      schedule();
    };
    const releaseSoon = (card: Card) => {
      window.clearTimeout(card.timer);
      card.timer = window.setTimeout(() => {
        card.timer = 0;
        const focused = card.element.contains(document.activeElement);
        if (activeCard === card && !focused && !hitTest(card, pointerX, pointerY)) {
          releaseAll(performance.now());
        }
      }, 100);
    };
    for (const card of cards) {
      const enter = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        pointerX = event.clientX;
        pointerY = event.clientY;
        activate(card);
      };
      const leave = (event: PointerEvent) => {
        if (event.pointerType !== "touch") releaseSoon(card);
      };
      const focusIn = () => activate(card);
      const focusOut = (event: FocusEvent) => {
        if (!event.relatedTarget || !card.element.contains(event.relatedTarget as Node)) {
          releaseSoon(card);
        }
      };
      const touchToggle = (event: PointerEvent) => {
        if (event.pointerType === "touch") activate(activeCard === card ? null : card);
      };
      card.element.addEventListener("pointerenter", enter);
      card.element.addEventListener("pointerleave", leave);
      card.element.addEventListener("focusin", focusIn);
      card.element.addEventListener("focusout", focusOut);
      card.element.addEventListener("pointerdown", touchToggle);
      cardCleanups.push(() => {
        card.element.removeEventListener("pointerenter", enter);
        card.element.removeEventListener("pointerleave", leave);
        card.element.removeEventListener("focusin", focusIn);
        card.element.removeEventListener("focusout", focusOut);
        card.element.removeEventListener("pointerdown", touchToggle);
        window.clearTimeout(card.timer);
      });
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      const hovered = cards.find((card) => hitTest(card, pointerX, pointerY));
      if (hovered) activate(hovered);
      else if (activeCard && !activeCard.element.contains(document.activeElement)) {
        releaseSoon(activeCard);
      }
    };
    const onOutsideTouch = (event: PointerEvent) => {
      if (
        event.pointerType === "touch" &&
        !cards.some((card) => card.element.contains(event.target as Node))
      ) {
        activate(null);
      }
    };
    const onScroll = () => {
      scrollX = window.scrollX;
      scrollY = window.scrollY;
      cards.forEach((card) => (card.dirty = true));
      schedule();
    };
    const onVisibility = () => {
      if (document.hidden) {
        if (frameId) cancelAnimationFrame(frameId);
        frameId = 0;
      } else {
        schedule();
      }
    };
    const onMotionChange = () => {
      if (reduced()) {
        if (frameId) cancelAnimationFrame(frameId);
        frameId = 0;
      }
      schedule();
    };
    const onResize = () => resize();

    const draw = (now: number) => {
      context.clearRect(0, 0, width, height);
      slots = getSlots(now);
      if (activeCard?.dirty) buildTargets(activeCard);
      if (activeCard) recruit(now, reduced() ? activeCard.targets.length : 14);

      for (let index = 0; index < slots.length; index += 1) {
        if (occupied.has(slots.key[index])) continue;
        context.fillStyle = "rgba(26,27,31,0.9)";
        context.beginPath();
        context.arc(slots.x[index], slots.y[index], slots.radius[index], 0, TAU);
        context.fill();
      }

      for (let index = dots.length - 1; index >= 0; index -= 1) {
        const dot = dots[index];
        if (dot.releasing) {
          if (now < dot.releaseAt) continue;
          const progress = reduced()
            ? 1
            : Math.min(1, (now - dot.releaseAt) / 330);
          const eased = 1 - (1 - progress) ** 2;
          const drift = 12 * (1 - eased);
          dot.x =
            dot.releaseFromX +
            (dot.releaseX - dot.releaseFromX) * eased +
            Math.cos(dot.releaseAngle) * drift;
          dot.y =
            dot.releaseFromY +
            (dot.releaseY - dot.releaseFromY) * eased +
            Math.sin(dot.releaseAngle) * drift;
          const redPhase = Math.max(0, 1 - Math.abs(progress - 0.25) / 0.25);
          context.globalAlpha = 1 - progress;
          context.fillStyle = redPhase > 0.05
            ? hexMix(BLUE, RED, redPhase)
            : hexMix(BLUE, BLACK, progress);
          if (progress >= 1) {
            removeDot(dot);
            continue;
          }
        } else {
          const gatherProgress = reduced()
            ? 1
            : Math.max(0, Math.min(1, (now - dot.born - dot.delay) / 450));
          const target = targetPoint(dot, now);
          if (reduced()) {
            dot.x = target.x;
            dot.y = target.y;
          } else if (now >= dot.born + dot.delay) {
            dot.vx = (dot.vx + (target.x - dot.x) * 0.06) * 0.82;
            dot.vy = (dot.vy + (target.y - dot.y) * 0.06) * 0.82;
            dot.x += dot.vx;
            dot.y += dot.vy;
          }
          if (
            activeCard &&
            !reduced() &&
            now - dot.born - dot.delay >= dot.ttl &&
            activeCard.targets[dot.targetIndex]
          ) {
            const targetIndex = dot.targetIndex;
            startRelease(dot, now);
            const nearest = findNearestSlot(target.x, target.y);
            if (nearest >= 0) createDot(nearest, targetIndex, now);
          }
          context.globalAlpha = 1;
          context.fillStyle = dot.speck
            ? RED
            : hexMix(BLACK, BLUE, gatherProgress);
        }
        context.beginPath();
        context.arc(dot.x, dot.y, dot.speck ? 0.5 : Math.min(1.75, dot.size / 2), 0, TAU);
        context.fill();
      }
      context.globalAlpha = 1;
    };
    function render(now: number) {
      frameId = 0;
      if (document.hidden || !inView) return;
      draw(now);
      if (!reduced() || dots.some((dot) => dot.releasing)) {
        frameId = requestAnimationFrame(render);
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      cards.forEach((card) => (card.dirty = true));
      resize();
    });
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) schedule();
      else if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
    });
    intersectionObserver.observe(canvas);
    cards.forEach((card) => resizeObserver.observe(card.element));
    const fontsReady = document.fonts.ready.then(() => {
      if (!canvas.isConnected) return;
      cards.forEach((card) => (card.dirty = true));
      schedule();
    });

    resize();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onOutsideTouch, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    motionPreference.addEventListener("change", onMotionChange);

    return () => {
      void fontsReady;
      if (frameId) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      cardCleanups.forEach((cleanup) => cleanup());
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onOutsideTouch, true);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      motionPreference.removeEventListener("change", onMotionChange);
    };
  }, [hitPadding, shapeRatio, spacing, ttlRange]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 size-full"
      data-bracefield-canvas
    />
  );
}
