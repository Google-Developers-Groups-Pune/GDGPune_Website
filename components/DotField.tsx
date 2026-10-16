"use client";

import { useEffect, useRef } from "react";

type DotShape = "braces" | "rings";
type DotFieldProps = {
  spacing?: number;
  shape?: DotShape;
  color?: string;
  hitPadding?: number;
  maxDots?: number;
  ttlRange?: readonly [number, number];
};

type Point = { x: number; y: number };
type ShapeTarget = Point & {
  group: number;
  slides: boolean;
  ring: number;
};
type ShapeDefinition = {
  targets: ShapeTarget[];
  contours: Point[][];
  rings: Array<{ x: number; y: number; period: number; phase: number }>;
};
type Card = {
  element: HTMLElement;
  shape: DotShape;
  dirty: boolean;
  definition: ShapeDefinition | null;
  timer: number;
};
type ShapeDot = {
  sourceKey: number;
  destinationKey: number | null;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetIndex: number;
  born: number;
  ttl: number;
  state: "gather" | "formed" | "release";
  releaseAt: number;
  releaseStarted: number;
  releaseToX: number;
  releaseToY: number;
  releaseFromX: number;
  releaseFromY: number;
};
type GridSlots = {
  x: Float32Array;
  y: Float32Array;
  key: Float64Array;
  kind: Uint8Array;
  length: number;
};

const twoPi = Math.PI * 2;
const blue = "#4169E1";
const red = "#D93025";
const defaultColor = "rgba(26,27,31,0.85)";

function hash(row: number, column: number) {
  let value = Math.imul(row, 0x45d9f3b) ^ Math.imul(column, 0x119de1f3);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

function smoothNoise(x: number, y: number) {
  const left = Math.floor(x);
  const top = Math.floor(y);
  const fractionX = x - left;
  const fractionY = y - top;
  const blendX = fractionX * fractionX * (3 - 2 * fractionX);
  const blendY = fractionY * fractionY * (3 - 2 * fractionY);
  const topLeft = hash(top, left) * 2 - 1;
  const topRight = hash(top, left + 1) * 2 - 1;
  const bottomLeft = hash(top + 1, left) * 2 - 1;
  const bottomRight = hash(top + 1, left + 1) * 2 - 1;
  const topValue = topLeft + (topRight - topLeft) * blendX;
  const bottomValue = bottomLeft + (bottomRight - bottomLeft) * blendX;
  return topValue + (bottomValue - topValue) * blendY;
}

function mixHex(from: string, to: string, progress: number) {
  const start = Number.parseInt(from.slice(1), 16);
  const end = Number.parseInt(to.slice(1), 16);
  const channel = (shift: number) =>
    Math.round(
      ((start >> shift) & 255) +
        (((end >> shift) & 255) - ((start >> shift) & 255)) * progress,
    );
  return `rgb(${channel(16)} ${channel(8)} ${channel(0)})`;
}

function createDotSprite(radius: number, color: string, ratio: number) {
  const diameter = radius * 2 + 2;
  const sprite = document.createElement("canvas");
  sprite.width = Math.ceil(diameter * ratio);
  sprite.height = Math.ceil(diameter * ratio);
  const context = sprite.getContext("2d");
  if (!context) return sprite;
  context.scale(ratio, ratio);
  context.fillStyle = color;
  context.beginPath();
  context.arc(diameter / 2, diameter / 2, radius, 0, twoPi);
  context.fill();
  return sprite;
}

function blueNoiseSample(
  candidates: Point[],
  amount: number,
  minimumDistance: number,
) {
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [candidates[index], candidates[swap]] = [candidates[swap], candidates[index]];
  }
  const selected: Point[] = [];
  if (!candidates.length || amount <= 0) return selected;
  let distance = minimumDistance;
  while (selected.length < amount && distance >= 4) {
    const distanceSquared = distance * distance;
    for (const point of candidates) {
      if (
        selected.every(
          (existing) =>
            (point.x - existing.x) ** 2 + (point.y - existing.y) ** 2 >=
            distanceSquared,
        )
      ) {
        selected.push(point);
        if (selected.length === amount) break;
      }
    }
    distance -= 2;
  }
  if (selected.length < amount && candidates.length) {
    for (let index = 0; selected.length < amount; index += 1) {
      selected.push(candidates[index % candidates.length]);
    }
  }
  const centerX = selected.reduce((sum, point) => sum + point.x, 0) / selected.length;
  const centerY = selected.reduce((sum, point) => sum + point.y, 0) / selected.length;
  selected.sort(
    (a, b) =>
      Math.atan2(a.y - centerY, a.x - centerX) -
      Math.atan2(b.y - centerY, b.x - centerX),
  );
  return selected;
}

function contourFromBrace(glyph: "{" | "}", width: number, height: number) {
  const strokeWidth = height * 0.1;
  const padding = Math.ceil(strokeWidth + 4);
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width + padding * 2);
  canvas.height = Math.ceil(height + padding * 2);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return { contour: [] as Point[], body: [] as Point[] };

  context.font = `300 ${height}px Arial, sans-serif`;
  context.textBaseline = "top";
  const naturalWidth = context.measureText(glyph).width;
  context.scale(width / naturalWidth, 1);
  context.lineWidth = strokeWidth;
  context.lineJoin = "round";
  context.lineCap = "square";
  context.strokeStyle = "#fff";
  context.strokeText(glyph, padding / (width / naturalWidth), padding);

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const body: Point[] = [];
  const boundary: Point[] = [];
  const alphaAt = (x: number, y: number) =>
    x < 0 ||
    y < 0 ||
    x >= pixels.width ||
    y >= pixels.height ||
    pixels.data[(y * pixels.width + x) * 4 + 3] === 0;
  for (let y = 1; y < pixels.height - 1; y += 1) {
    for (let x = 1; x < pixels.width - 1; x += 1) {
      if (alphaAt(x, y)) continue;
      const point = { x: x - padding, y: y - padding };
      body.push(point);
      if (
        alphaAt(x - 1, y) ||
        alphaAt(x + 1, y) ||
        alphaAt(x, y - 1) ||
        alphaAt(x, y + 1)
      ) {
        boundary.push(point);
      }
    }
  }
  return { contour: blueNoiseSample(boundary, 260, 10), body };
}

function buildShapeDefinition(
  card: HTMLElement,
  shape: DotShape,
  viewportHeight: number,
): ShapeDefinition {
  const bounds = card.getBoundingClientRect();
  const heading = card.querySelector<HTMLElement>("h1, h2, h3, h4");
  const textRange = document.createRange();
  if (heading) textRange.selectNodeContents(heading);
  const width = Math.max(
    1,
    heading ? textRange.getBoundingClientRect().width : bounds.width,
  );
  const centerX = bounds.width / 2;
  const centerY = bounds.height / 2;
  const targets: ShapeTarget[] = [];
  const contours: Point[][] = [];
  const rings: ShapeDefinition["rings"] = [];

  if (shape === "braces") {
    const braceHeight = Math.min(
      Math.max(280, bounds.height * 2.27),
      viewportHeight * 0.9,
    );
    const braceWidth = width * 0.615;
    const top = centerY - braceHeight / 2;
    for (const [side, glyph] of [-1, 1].map((side) => [
      side,
      side < 0 ? "{" : "}",
    ] as const)) {
      const glyphData = contourFromBrace(glyph, braceWidth, braceHeight);
      const left =
        side < 0
          ? centerX - width * 0.85
          : centerX + width * 0.235;
      const contour = glyphData.contour.map((point) => ({
        x: left + point.x,
        y: top + point.y,
      }));
      const groupIndex = contours.length;
      contours.push(contour);
      for (const point of contour) {
        targets.push({
          ...point,
          group: groupIndex,
          slides: true,
          ring: -1,
        });
      }
      const strayPoints = blueNoiseSample(
        glyphData.body,
        Math.ceil(contour.length * 0.1),
        8,
      );
      for (const point of strayPoints) {
        targets.push({
          x: left + point.x,
          y: top + point.y,
          group: -1,
          slides: false,
          ring: -1,
        });
      }
    }
  } else {
    const ringRadius = width * 0.2;
    const hexagonRadius = width * 0.53;
    const angles = [90, 30, -30, -90, -150, 150];
    for (const degrees of angles) {
      const angle = (degrees * Math.PI) / 180;
      const ringCenter = {
        x: centerX + Math.cos(angle) * hexagonRadius,
        y: centerY + Math.sin(angle) * hexagonRadius,
      };
      const ringIndex = rings.length;
      const period = 4 + Math.random() * 3;
      rings.push({
        ...ringCenter,
        period,
        phase: Math.random() * twoPi,
      });
      const contour = Array.from({ length: 110 }, (_, index) => {
        const theta = (index / 110) * twoPi;
        const radius = ringRadius + (Math.random() - 0.5) * 6;
        return {
          x: ringCenter.x + Math.cos(theta) * radius,
          y: ringCenter.y + Math.sin(theta) * radius,
        };
      });
      const groupIndex = contours.length;
      contours.push(contour);
      for (const point of contour) {
        targets.push({
          ...point,
          group: groupIndex,
          slides: true,
          ring: ringIndex,
        });
      }

      const interior: Point[] = [];
      let tries = 0;
      while (interior.length < 40 && tries < 4000) {
        tries += 1;
        const theta = Math.random() * twoPi;
        const radius = Math.sqrt(Math.random()) * ringRadius;
        const point = {
          x: ringCenter.x + Math.cos(theta) * radius,
          y: ringCenter.y + Math.sin(theta) * radius,
        };
        if (
          interior.every(
            (existing) =>
              (point.x - existing.x) ** 2 + (point.y - existing.y) ** 2 >=
              14 ** 2,
          )
        ) {
          interior.push(point);
        }
      }
      for (const point of interior) {
        targets.push({
          ...point,
          group: -1,
          slides: false,
          ring: ringIndex,
        });
      }
    }
  }

  return { targets, contours, rings };
}

function clampTtlRange(range: readonly [number, number]) {
  return [
    Math.max(2500, Math.min(range[0], range[1])),
    Math.max(2500, Math.max(range[0], range[1])),
  ] as const;
}

export function DotField({
  spacing,
  shape = "braces",
  color = defaultColor,
  hitPadding = 24,
  maxDots = 1000,
  ttlRange = [2500, 5000],
}: DotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true, desynchronized: true });
    if (!canvas || !context) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cards: Card[] = Array.from(
      document.querySelectorAll<HTMLElement>("[data-dotshape]"),
      (element): Card => {
        const candidate = element.dataset.dotshape;
        const cardShape =
          candidate === "braces" || candidate === "rings" ? candidate : shape;
        return { element, shape: cardShape, dirty: true, definition: null, timer: 0 };
      },
    );
    const occupiedSlots = new Set<number>();
    const dots: ShapeDot[] = [];
    let activeCard: Card | null = null;
    let width = 1;
    let height = 1;
    let ratio = 1;
    let frameId = 0;
    let previousFrame = 0;
    let slowFrames = 0;
    const baseSpacing = spacing ?? (window.innerWidth < 768 ? 20 : 16);
    let currentSpacing = baseSpacing;
    let gridX = new Float32Array(0);
    let gridY = new Float32Array(0);
    let gridKey = new Float64Array(0);
    let gridKind = new Uint8Array(0);
    let cardBounds = new Map<HTMLElement, DOMRect>();
    let currentCardBounds: DOMRect | null = null;
    let lastSlots: GridSlots = {
      x: new Float32Array(0),
      y: new Float32Array(0),
      key: new Float64Array(0),
      kind: new Uint8Array(0),
      length: 0,
    };
    let instantGather = false;
    let pointerX = -1;
    let pointerY = -1;
    const replacementTargets = new Set<number>();
    let sprites: HTMLCanvasElement[] = [];
    let pulseAt = 0;
    let activeStartedAt = 0;
    let pulseUntil = 0;
    let pulseTargets: ShapeTarget[] = [];
    let scrollX = window.scrollX;
    let scrollY = window.scrollY;
    let disposed = false;

    const reduced = () => motionPreference.matches;
    const schedule = () => {
      if (!document.hidden && frameId === 0) {
        frameId = window.requestAnimationFrame(render);
      }
    };
    const makeSprites = () => {
      sprites = [0.9, 1.2, 1.6].map((radius) =>
        createDotSprite(radius, color, ratio),
      );
    };
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      currentSpacing = spacing ?? (width < 768 ? 20 : 16);
      makeSprites();
      for (const card of cards) card.dirty = true;
      schedule();
    };
    const gridCapacity = () =>
      (Math.ceil(width / currentSpacing) + 4) *
      (Math.ceil(height / currentSpacing) + 4);
    const getGridSlots = (time: number): GridSlots => {
      const capacity = gridCapacity();
      if (gridX.length < capacity) {
        gridX = new Float32Array(capacity);
        gridY = new Float32Array(capacity);
        gridKey = new Float64Array(capacity);
        gridKind = new Uint8Array(capacity);
      }
      const firstRow = Math.floor(scrollY / currentSpacing) - 1;
      const lastRow = Math.ceil((scrollY + height) / currentSpacing) + 1;
      const firstColumn = Math.floor(scrollX / currentSpacing) - 1;
      const lastColumn = Math.ceil((scrollX + width) / currentSpacing) + 1;
      const cardCenters = cards.map((card) => {
        const rect = cardBounds.get(card.element) ?? card.element.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      });
      const t = time * 0.001;
      let count = 0;
      for (let row = firstRow; row <= lastRow; row += 1) {
        const documentY = row * currentSpacing;
        const rowOffset = (row & 1) * currentSpacing * 0.5;
        for (let column = firstColumn; column <= lastColumn; column += 1) {
          const documentX = column * currentSpacing + rowOffset;
          let x = documentX - scrollX;
          let y = documentY - scrollY;
          if (!reduced()) {
            x += Math.sin(documentY / 340 + t * 0.05) * 8;
            y += Math.sin((documentX + documentY) / 340 + t * 0.05) * 8;
            for (const center of cardCenters) {
              const dx = x - center.x;
              const dy = y - center.y;
              const distance = Math.hypot(dx, dy);
              if (distance > 0 && distance < 400) {
                const force = 6 * (1 - distance / 400) ** 2;
                x += (dx / distance) * force;
                y += (dy / distance) * force;
              }
            }
          }
          if (x < 0 || x > width || y < 0 || y > height) continue;
          gridX[count] = x;
          gridY[count] = y;
          gridKey[count] = row * 1000000 + column;
          const value = hash(row, column);
          gridKind[count] = value < 0.8 ? 0 : value < 0.97 ? 1 : 2;
          count += 1;
        }
      }
      return {
        x: gridX,
        y: gridY,
        key: gridKey,
        kind: gridKind,
        length: count,
      };
    };
    const addRelease = (dot: ShapeDot, releaseAt: number) => {
      if (dot.state === "release") return;
      dot.state = "release";
      dot.releaseAt = releaseAt;
      dot.releaseStarted = 0;
      dot.releaseFromX = dot.x;
      dot.releaseFromY = dot.y;
      dot.targetIndex = -1;

      let nearestIndex = -1;
      let nearestDistance = Number.POSITIVE_INFINITY;
      for (let index = 0; index < lastSlots.length; index += 1) {
        const key = lastSlots.key[index];
        if (occupiedSlots.has(key)) continue;
        const distance =
          (lastSlots.x[index] - dot.x) ** 2 +
          (lastSlots.y[index] - dot.y) ** 2;
        if (distance < nearestDistance) {
          nearestIndex = index;
          nearestDistance = distance;
        }
      }
      if (nearestIndex >= 0) {
        dot.destinationKey = lastSlots.key[nearestIndex];
        dot.releaseToX = lastSlots.x[nearestIndex];
        dot.releaseToY = lastSlots.y[nearestIndex];
        occupiedSlots.add(dot.destinationKey);
      } else {
        dot.destinationKey = null;
        dot.releaseToX = dot.x;
        dot.releaseToY = dot.y;
      }
    };
    const releaseCard = (now: number) => {
      if (!activeCard) return;
      const assignedDots = dots.filter((dot) => dot.state !== "release");
      const rect = activeCard.element.getBoundingClientRect();
      const farthest = Math.max(
        1,
        ...assignedDots.map((dot) =>
          Math.hypot(dot.x - (rect.left + rect.width / 2), dot.y - (rect.top + rect.height / 2)),
        ),
      );
      for (const dot of assignedDots) {
        const distance = Math.hypot(
          dot.x - (rect.left + rect.width / 2),
          dot.y - (rect.top + rect.height / 2),
        );
        const stagger = reduced() ? 0 : ((farthest - distance) / farthest) * 700;
        addRelease(dot, now + stagger);
      }
      activeCard = null;
      pulseTargets = [];
      pulseUntil = 0;
    };
    const buildTargets = (card: Card) => {
      card.definition = buildShapeDefinition(card.element, card.shape ?? shape, height);
      card.dirty = false;
    };
    const setActiveCard = (next: Card | null) => {
      if (activeCard === next) return;
      releaseCard(performance.now());
      activeCard = next;
      pulseAt = performance.now();
      activeStartedAt = pulseAt;
      if (activeCard) {
        if (activeCard.dirty || !activeCard.definition) buildTargets(activeCard);
        instantGather = reduced();
      }
      schedule();
    };
    const activate = (card: Card) => {
      window.clearTimeout(card.timer);
      setActiveCard(card);
    };
    const releaseSoon = (card: Card) => {
      window.clearTimeout(card.timer);
      card.timer = window.setTimeout(() => {
        card.timer = 0;
        const bounds = card.element.getBoundingClientRect();
        const withinHitArea =
          pointerX >= bounds.left - hitPadding &&
          pointerX <= bounds.right + hitPadding &&
          pointerY >= bounds.top - hitPadding &&
          pointerY <= bounds.bottom + hitPadding;
        const focusWithin = card.element.contains(document.activeElement);
        if (activeCard === card && !withinHitArea && !focusWithin) {
          setActiveCard(null);
        }
      }, 120);
    };
    const cardCleanups: Array<() => void> = [];
    for (const card of cards) {
      const onPointerEnter = (event: PointerEvent) => {
        if (event.pointerType !== "touch") activate(card);
      };
      const onPointerLeave = (event: PointerEvent) => {
        if (event.pointerType !== "touch") releaseSoon(card);
      };
      const onFocusIn = () => activate(card);
      const onFocusOut = (event: FocusEvent) => {
        if (!event.relatedTarget || !card.element.contains(event.relatedTarget as Node)) {
          releaseSoon(card);
        }
      };
      const onPointerDown = (event: PointerEvent) => {
        if (event.pointerType === "touch") {
          setActiveCard(activeCard === card ? null : card);
        }
      };
      card.element.addEventListener("pointerenter", onPointerEnter);
      card.element.addEventListener("pointerleave", onPointerLeave);
      card.element.addEventListener("focusin", onFocusIn);
      card.element.addEventListener("focusout", onFocusOut);
      card.element.addEventListener("pointerdown", onPointerDown);
      cardCleanups.push(() => {
        card.element.removeEventListener("pointerenter", onPointerEnter);
        card.element.removeEventListener("pointerleave", onPointerLeave);
        card.element.removeEventListener("focusin", onFocusIn);
        card.element.removeEventListener("focusout", onFocusOut);
        card.element.removeEventListener("pointerdown", onPointerDown);
        window.clearTimeout(card.timer);
      });
    }

    const onOutsideTouch = (event: PointerEvent) => {
      if (
        event.pointerType === "touch" &&
        !cards.some((card) => card.element.contains(event.target as Node))
      ) {
        setActiveCard(null);
      }
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      const card = cards.find((candidate) => {
        const bounds = candidate.element.getBoundingClientRect();
        return (
          pointerX >= bounds.left - hitPadding &&
          pointerX <= bounds.right + hitPadding &&
          pointerY >= bounds.top - hitPadding &&
          pointerY <= bounds.bottom + hitPadding
        );
      });
      if (card) activate(card);
      else if (
        activeCard &&
        activeCard.timer === 0 &&
        !activeCard.element.contains(document.activeElement)
      ) {
        releaseSoon(activeCard);
      }
    };
    const onScroll = () => {
      scrollX = window.scrollX;
      scrollY = window.scrollY;
      schedule();
    };
    const onMotionChange = () => {
      if (reduced()) {
        if (frameId) window.cancelAnimationFrame(frameId);
        frameId = 0;
        instantGather = Boolean(activeCard);
        draw(performance.now());
      } else {
        schedule();
      }
    };
    const onResize = () => resize();

    const createShapeDot = (
      slotIndex: number,
      targetIndex: number,
      now: number,
      slots: GridSlots,
    ) => {
      const slotKey = slots.key[slotIndex];
      occupiedSlots.add(slotKey);
      const range = clampTtlRange(ttlRange);
      const dot: ShapeDot = {
        sourceKey: slotKey,
        destinationKey: null,
        x: slots.x[slotIndex],
        y: slots.y[slotIndex],
        vx: 0,
        vy: 0,
        targetIndex,
        born: now,
        ttl: range[0] + Math.random() * (range[1] - range[0]),
        state: "gather",
        releaseAt: 0,
        releaseStarted: 0,
        releaseToX: 0,
        releaseToY: 0,
        releaseFromX: 0,
        releaseFromY: 0,
      };
      if (reduced() && activeCard?.definition) {
        const target = targetPosition(dot, now);
        dot.x = target.x;
        dot.y = target.y;
        dot.state = "formed";
      }
      dots.push(dot);
      return dot;
    };
    const recruit = (now: number, instantly = false) => {
      if (!activeCard?.definition) return;
      const slots = lastSlots;
      const targets = activeCard.definition.targets;
      const targetLimit = Math.min(maxDots, targets.length + pulseTargets.length);
      const desiredRecruitCount = instantly ? targetLimit : 14;
      let recruited = 0;
      while (recruited < desiredRecruitCount) {
        const assignments = new Set(
          dots
            .filter((dot) => dot.state !== "release" && dot.targetIndex >= 0)
            .map((dot) => dot.targetIndex),
        );
        let targetIndex = -1;
        for (let index = 0; index < targetLimit; index += 1) {
          if (!assignments.has(index)) {
            targetIndex = index;
            break;
          }
        }
        if (targetIndex < 0) break;
        const target = targetIndex < targets.length
          ? targets[targetIndex]
          : pulseTargets[targetIndex - targets.length];
        const cardRect =
          currentCardBounds ?? activeCard.element.getBoundingClientRect();
        const targetX = cardRect.left + target.x;
        const targetY = cardRect.top + target.y;
        let nearest = -1;
        let nearestDistance = Number.POSITIVE_INFINITY;
        for (let slot = 0; slot < slots.length; slot += 1) {
          const key = slots.key[slot];
          if (occupiedSlots.has(key)) continue;
          const distance = Math.hypot(
            slots.x[slot] - targetX,
            slots.y[slot] - targetY,
          );
          const replacement = replacementTargets.has(targetIndex);
          if (replacement && (distance < 150 || distance > 400)) continue;
          if (distance < nearestDistance) {
            nearest = slot;
            nearestDistance = distance;
          }
        }
        if (nearest < 0) break;
        createShapeDot(nearest, targetIndex, now, slots);
        replacementTargets.delete(targetIndex);
        recruited += 1;
      }
    };

    const targetPosition = (dot: ShapeDot, time: number) => {
      if (!activeCard?.definition || dot.targetIndex < 0) {
        return { x: dot.x, y: dot.y };
      }
      const definition = activeCard.definition;
      const isPulse = dot.targetIndex >= definition.targets.length;
      const target = isPulse
        ? pulseTargets[dot.targetIndex - definition.targets.length]
        : definition.targets[dot.targetIndex];
      if (!target) return { x: dot.x, y: dot.y };
      let x = target.x;
      let y = target.y;
      if (target.slides && target.group >= 0) {
        const contour = definition.contours[target.group];
        const shift = reduced()
          ? 0
          : ((time - activeStartedAt) * 0.0004 * contour.length);
        const position = ((dot.targetIndex + shift) % contour.length + contour.length) % contour.length;
        const first = Math.floor(position);
        const second = (first + 1) % contour.length;
        const blend = position - first;
        x = contour[first].x + (contour[second].x - contour[first].x) * blend;
        y = contour[first].y + (contour[second].y - contour[first].y) * blend;
      }
      if (target.ring >= 0) {
        const ring = definition.rings[target.ring];
        const scale = reduced()
          ? 1
          : 1 + Math.sin((time / 1000 / ring.period) * twoPi + ring.phase) * 0.03;
        x = ring.x + (x - ring.x) * scale;
        y = ring.y + (y - ring.y) * scale;
      }
      if (!reduced()) {
        x += smoothNoise(time * 0.00025, dot.targetIndex * 0.17) * 1.5;
        y += smoothNoise(time * 0.00025 + 31, dot.targetIndex * 0.17) * 1.5;
      }
      const cardRect =
        currentCardBounds ?? activeCard.element.getBoundingClientRect();
      return { x: cardRect.left + x, y: cardRect.top + y };
    };

    const triggerPulse = (now: number) => {
      if (!activeCard?.definition || reduced() || now - pulseAt < 3000) return;
      pulseAt = now;
      pulseUntil = now + 1100;
      const targets = activeCard.definition.targets;
      const count = Math.ceil(targets.length * 0.08);
      pulseTargets = Array.from({ length: count }, () => {
        const source = targets[Math.floor(Math.random() * targets.length)];
        return {
          ...source,
          x: source.x + (Math.random() - 0.5) * 10,
          y: source.y + (Math.random() - 0.5) * 10,
          slides: false,
        };
      });
    };

    const updateDots = (now: number, slots: GridSlots) => {
      if (activeCard?.dirty) buildTargets(activeCard);
      if (activeCard?.definition) {
        triggerPulse(now);
        if (pulseTargets.length && now > pulseUntil) {
          for (const dot of dots) {
            if (
              dot.state !== "release" &&
              dot.targetIndex >= activeCard.definition.targets.length
            ) {
              replacementTargets.delete(dot.targetIndex);
              addRelease(dot, now);
            }
          }
          pulseTargets = [];
        }
        recruit(now, instantGather);
        instantGather = false;
      }

      for (let index = dots.length - 1; index >= 0; index -= 1) {
        const dot = dots[index];
        if (dot.state === "release") {
          if (now < dot.releaseAt) continue;
          if (!dot.releaseStarted) dot.releaseStarted = now;
          const progress = reduced()
            ? 1
            : Math.min(1, (now - dot.releaseStarted) / 800);
          const easedProgress = 1 - (1 - progress) ** 2;
          dot.x =
            dot.releaseFromX +
            (dot.releaseToX - dot.releaseFromX) * easedProgress;
          dot.y =
            dot.releaseFromY +
            (dot.releaseToY - dot.releaseFromY) * easedProgress;
          if (progress >= 1) {
            occupiedSlots.delete(dot.sourceKey);
            if (dot.destinationKey !== null) {
              occupiedSlots.delete(dot.destinationKey);
            }
            dots.splice(index, 1);
          }
          continue;
        }
        if (!reduced() && now - dot.born >= dot.ttl) {
          replacementTargets.add(dot.targetIndex);
          addRelease(dot, now);
          continue;
        }
        const target = targetPosition(dot, now);
        if (reduced()) {
          dot.x = target.x;
          dot.y = target.y;
          dot.vx = 0;
          dot.vy = 0;
          dot.state = "formed";
          continue;
        }
        dot.vx = (dot.vx + (target.x - dot.x) * 0.06) * 0.82;
        dot.vy = (dot.vy + (target.y - dot.y) * 0.06) * 0.82;
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (
          dot.state === "gather" &&
          Math.hypot(target.x - dot.x, target.y - dot.y) < 1.5 &&
          Math.hypot(dot.vx, dot.vy) < 0.5
        ) {
          dot.state = "formed";
        }
      }

      void slots;
    };

    const draw = (now: number) => {
      context.clearRect(0, 0, width, height);
      cardBounds = new Map(
        cards.map((card) => [card.element, card.element.getBoundingClientRect()]),
      );
      currentCardBounds = activeCard
        ? cardBounds.get(activeCard.element) ?? null
        : null;
      const slots = getGridSlots(now);
      lastSlots = slots;
      updateDots(now, slots);
      for (let index = 0; index < slots.length; index += 1) {
        if (occupiedSlots.has(slots.key[index])) continue;
        const spriteIndex = slots.kind[index];
        const radius = [0.9, 1.2, 1.6][spriteIndex];
        context.globalAlpha = 1;
        context.drawImage(
          sprites[spriteIndex],
          slots.x[index] - radius - 1,
          slots.y[index] - radius - 1,
        );
      }

      for (const dot of dots) {
        const progress = dot.state === "release"
          ? 1 - Math.min(1, (now - dot.releaseStarted) / 800)
          : dot.state === "formed"
            ? 1
            : Math.min(1, (now - dot.born) / 1000);
        const redSpeck =
          hash(
            Math.floor(dot.sourceKey / 1000000),
            dot.sourceKey % 1000000,
          ) < 0.05;
        context.globalAlpha = dot.state === "release" ? progress : 1;
        context.fillStyle = redSpeck ? red : mixHex("#1A1B1F", blue, progress);
        context.beginPath();
        context.arc(
          dot.x,
          dot.y,
          redSpeck ? 1 : 1.3 + Math.min(1, progress) * 0.5,
          0,
          twoPi,
        );
        context.fill();
      }
      context.globalAlpha = 1;
    };
    const render = (now: number) => {
      frameId = 0;
      if (document.hidden) return;
      if (previousFrame) {
        if (now - previousFrame > 20) slowFrames += 1;
        else slowFrames = 0;
        if (slowFrames >= 30 && currentSpacing < baseSpacing + 4) {
          currentSpacing = baseSpacing + 4;
          slowFrames = 0;
        }
      }
      previousFrame = now;
      draw(now);
      if (!reduced() || dots.some((dot) => dot.state === "release")) {
        frameId = window.requestAnimationFrame(render);
      }
    };
    const onOutsideClick = (event: PointerEvent) => onOutsideTouch(event);
    const resizeObserver = new ResizeObserver(() => {
      for (const card of cards) card.dirty = true;
      resize();
    });
    for (const card of cards) resizeObserver.observe(card.element);

    resize();
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerdown", onOutsideClick, true);
    document.addEventListener("visibilitychange", schedule);
    motionPreference.addEventListener("change", onMotionChange);
    void document.fonts.ready.then(() => {
      if (disposed) return;
      for (const card of cards) card.dirty = true;
      schedule();
    });
    if (!reduced()) schedule();

    return () => {
      disposed = true;
      if (frameId) window.cancelAnimationFrame(frameId);
      for (const cleanup of cardCleanups) cleanup();
      resizeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerdown", onOutsideClick, true);
      document.removeEventListener("visibilitychange", schedule);
      motionPreference.removeEventListener("change", onMotionChange);
    };
  }, [color, hitPadding, maxDots, shape, spacing, ttlRange]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 size-full"
    />
  );
}
