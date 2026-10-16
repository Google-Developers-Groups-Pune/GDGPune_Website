"use client";

import { useEffect, useRef } from "react";
import "./devfest-brace.css";

export type DevFestBraceFieldProps = {
  enabled?: boolean;
  ownLattice?: boolean;
  hitPadding?: number;
  minSpanW?: number;
  minHeight?: number;
  minW?: number;
  minH?: number;
};

type Point = { x: number; y: number };
type Target = Point & {
  contour: number;
  position: number;
  brace: "left" | "right";
  isEdge: boolean;
};

type Particle = {
  index: number;
  target: Target;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  speck: boolean;
  delay: number;
  born: number;
  lifetime: number;
  releaseAngle: number;
  startX: number;
  startY: number;
};

type Raster = {
  edge: Point[];
  body: Point[];
  width: number;
  height: number;
};

const TAU = Math.PI * 2;
const BLUE = "#4169E1";
const RED = "#D93025";
const BLACK = "#1A1B1F";
const TILT_ANGLE_DEG = 0.1;
const TILT_TAN = Math.tan((TILT_ANGLE_DEG * Math.PI) / 180);

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function mixHex(from: string, to: string, amount: number): string {
  const c = Math.max(0, Math.min(1, amount));
  const f = Number.parseInt(from.slice(1), 16);
  const t = Number.parseInt(to.slice(1), 16);
  const r1 = (f >> 16) & 255;
  const g1 = (f >> 8) & 255;
  const b1 = f & 255;
  const r2 = (t >> 16) & 255;
  const g2 = (t >> 8) & 255;
  const b2 = t & 255;
  const r = Math.round(r1 + (r2 - r1) * c);
  const g = Math.round(g1 + (g2 - g1) * c);
  const b = Math.round(b1 + (b2 - b1) * c);
  return `rgb(${r} ${g} ${b})`;
}

function smoothNoise(x: number, y: number): number {
  const i0 = Math.floor(x);
  const j0 = Math.floor(y);
  const fx = x - i0;
  const fy = y - j0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  const hash = (i: number, j: number) => {
    const v = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
    return (v - Math.floor(v)) * 2 - 1;
  };

  const n00 = hash(i0, j0);
  const n10 = hash(i0 + 1, j0);
  const n01 = hash(i0, j0 + 1);
  const n11 = hash(i0 + 1, j0 + 1);

  const nx0 = n00 + sx * (n10 - n00);
  const nx1 = n01 + sx * (n11 - n01);
  return nx0 + sy * (nx1 - nx0);
}

/**
 * Builds the exact broad & bulgy DevFest bracket geometry with smooth inside curves:
 *
 *   ┌───────────────────────┐  ← top horizontal arm
 *   │                       │
 *   │               ╭───────┘  ← rounded inner corner (R ~ 25px)
 *   │               │
 *   │               │          ← upper inner spine (broad stroke ~ 58-60px)
 *   │               ╰╮
 * ╭─┘ center tooth   │         ← inner curve (cusp) smoothly dips inward (left)
 * │   vertical face  │         ← following the center tooth
 * ╰─┐                ╭╯
 *   │               │          ← lower inner spine
 *   │               │
 *   │               ╭───────┐  ← rounded inner corner (R ~ 25px)
 *   │                       │
 *   └───────────────────────┘  ← bottom horizontal arm
 */
function makeSquareCurlyRaster(
  width: number,
  height: number,
  strokeWidth: number,
): Raster {
  const padding = 24;
  const rasterW = Math.ceil(width + padding * 2);
  const rasterH = Math.ceil(height + padding * 2);
  const raster = document.createElement("canvas");
  raster.width = rasterW;
  raster.height = rasterH;
  const ctx = raster.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("DevFestBraceField could not create offscreen canvas");
  }

  ctx.translate(padding, padding);

  // Broad & bulgy stroke thickness:
  const stroke = Math.max(46, Math.min(strokeWidth, Math.round(height * 0.115)));
  const toothProj = Math.round(stroke * 0.92);
  const spineOuterX = toothProj;
  const spineInnerX = spineOuterX + stroke;
  const armEndX = width;
  const armThick = stroke;

  const midY = height / 2;
  const toothH = Math.round(height * 0.135);
  const toothHalfH = toothH / 2;
  const toothR = 10;
  const outerCornerR = Math.round(stroke * 1.15); // Large rounded bulgy shoulders
  const innerCornerR = Math.round(stroke * 0.42); // Smooth rounded inner arm corner
  const armCornerR = 6; // Soft end-cap corners

  // Inside curve (cusp) geometry:
  // Smoothly curves inward (to the left, towards the tooth) around midY
  const innerCuspSpan = Math.round(height * 0.145);
  const innerDip = Math.round(stroke * 0.90);
  const cuspApexX = spineInnerX - innerDip;
  const cuspStartY = midY - innerCuspSpan;
  const cuspEndY = midY + innerCuspSpan;

  ctx.beginPath();

  // 1. Top arm end-cap top corner
  ctx.moveTo(armEndX - armCornerR, 0);
  ctx.arcTo(armEndX, 0, armEndX, armCornerR, armCornerR);

  // 2. Top arm vertical end-cap
  ctx.lineTo(armEndX, armThick - armCornerR);
  ctx.arcTo(armEndX, armThick, armEndX - armCornerR, armThick, armCornerR);

  // 3. Bottom edge of top arm going left
  ctx.lineTo(spineInnerX + innerCornerR, armThick);

  // 4. Inner top rounded corner turning down
  ctx.arcTo(spineInnerX, armThick, spineInnerX, armThick + innerCornerR, innerCornerR);

  // 5. Upper vertical inner spine going down to cusp start
  ctx.lineTo(spineInnerX, cuspStartY);

  // 6. Center inner curve (cusp) dipping to the left:
  // Sweeps from (spineInnerX, cuspStartY) in to apex (cuspApexX, midY)
  ctx.bezierCurveTo(
    spineInnerX,
    cuspStartY + innerCuspSpan * 0.50,
    cuspApexX,
    midY - innerCuspSpan * 0.22,
    cuspApexX,
    midY,
  );

  // Sweeps from apex (cuspApexX, midY) out to (spineInnerX, cuspEndY)
  ctx.bezierCurveTo(
    cuspApexX,
    midY + innerCuspSpan * 0.22,
    spineInnerX,
    cuspEndY - innerCuspSpan * 0.50,
    spineInnerX,
    cuspEndY,
  );

  // 7. Lower vertical inner spine going down to bottom arm
  ctx.lineTo(spineInnerX, height - armThick - innerCornerR);

  // 8. Inner bottom rounded corner turning right
  ctx.arcTo(
    spineInnerX,
    height - armThick,
    spineInnerX + innerCornerR,
    height - armThick,
    innerCornerR,
  );

  // 9. Top edge of bottom arm going right
  ctx.lineTo(armEndX - armCornerR, height - armThick);
  ctx.arcTo(
    armEndX,
    height - armThick,
    armEndX,
    height - armThick + armCornerR,
    armCornerR,
  );

  // 10. Bottom arm vertical end-cap
  ctx.lineTo(armEndX, height - armCornerR);
  ctx.arcTo(armEndX, height, armEndX - armCornerR, height, armCornerR);

  // 11. Bottom edge of bottom arm going left
  ctx.lineTo(spineOuterX + outerCornerR, height);

  // 12. Bottom-left outer rounded shoulder turning up
  ctx.arcTo(spineOuterX, height, spineOuterX, height - outerCornerR, outerCornerR);

  // 13. Lower vertical outer spine going up to tooth
  ctx.lineTo(spineOuterX, midY + toothHalfH + toothR);

  // 14. Bottom fillet of tooth turning outward (left)
  ctx.arcTo(spineOuterX, midY + toothHalfH, 0, midY + toothHalfH, toothR);

  // 15. Horizontal bottom step of tooth going to outer face
  ctx.lineTo(toothR, midY + toothHalfH);

  // 16. Bottom-left corner of tooth turning up
  ctx.arcTo(0, midY + toothHalfH, 0, midY, toothR);

  // 17. Vertical outer face of tooth (at x = 0)
  ctx.lineTo(0, midY - toothHalfH + toothR);

  // 18. Top-left corner of tooth turning right
  ctx.arcTo(0, midY - toothHalfH, toothR, midY - toothHalfH, toothR);

  // 19. Horizontal top step of tooth going right back to spine
  ctx.lineTo(spineOuterX - toothR, midY - toothHalfH);

  // 20. Top fillet of tooth turning up into upper spine
  ctx.arcTo(
    spineOuterX,
    midY - toothHalfH,
    spineOuterX,
    midY - toothHalfH - toothR,
    toothR,
  );

  // 21. Upper vertical outer spine going up to shoulder
  ctx.lineTo(spineOuterX, outerCornerR);

  // 22. Top-left outer rounded shoulder turning right
  ctx.arcTo(spineOuterX, 0, spineOuterX + outerCornerR, 0, outerCornerR);

  // 23. Top edge of top arm going right back to start
  ctx.lineTo(armEndX - armCornerR, 0);

  ctx.closePath();

  ctx.fillStyle = "#ffffff";
  ctx.fill();

  const img = ctx.getImageData(0, 0, rasterW, rasterH);
  const data = img.data;
  const isFilled = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= rasterW || y >= rasterH) return false;
    return data[(y * rasterW + x) * 4 + 3] > 100;
  };

  const rawEdge: Point[] = [];
  const rawBody: Point[] = [];

  for (let y = 0; y < rasterH; y += 1) {
    for (let x = 0; x < rasterW; x += 1) {
      if (!isFilled(x, y)) continue;
      const pt = { x: x - padding, y: y - padding };
      const isEdge =
        !isFilled(x - 1, y) ||
        !isFilled(x + 1, y) ||
        !isFilled(x, y - 1) ||
        !isFilled(x, y + 1);

      if (isEdge) {
        rawEdge.push(pt);
      } else {
        rawBody.push(pt);
      }
    }
  }

  // Normalize so outer tip is exactly at x = 0
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const pt of rawEdge) {
    if (pt.x < minX) minX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y > maxY) maxY = pt.y;
  }

  const edge = rawEdge.map((p) => ({ x: p.x - minX, y: p.y - minY }));
  const body = rawBody.map((p) => ({ x: p.x - minX, y: p.y - minY }));
  const finalW = maxX - minX;
  const finalH = maxY - minY;

  return { edge, body, width: finalW, height: finalH };
}

function sampleBlueNoise(
  points: Point[],
  count: number,
  startGap = 12,
  minGap = 3,
): Point[] {
  const pool = [...points];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  for (let gap = startGap; gap >= minGap; gap -= 1) {
    const selected: Point[] = [];
    const gapSq = gap * gap;
    for (const p of pool) {
      let ok = true;
      for (const s of selected) {
        const dx = s.x - p.x;
        const dy = s.y - p.y;
        if (dx * dx + dy * dy < gapSq) {
          ok = false;
          break;
        }
      }
      if (ok) {
        selected.push(p);
        if (selected.length === count) return selected;
      }
    }
    if (selected.length >= count) return selected.slice(0, count);
  }
  return pool.slice(0, count);
}

function getTextBlockRect(wrapper: HTMLElement): {
  left: number;
  top: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
} {
  const targets = Array.from(
    wrapper.querySelectorAll<HTMLElement>(
      "h1, h2, h3, h4, p, a, button, [role='button'], [class*='pill'], [class*='badge'], [data-dashfield-clear-zone], [data-dfb-type]",
    ),
  ).filter((el) => !el.closest(".dfb-layer"));

  if (targets.length === 0) {
    const rect = wrapper.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
    };
  }

  let minLeft = Infinity;
  let minTop = Infinity;
  let maxRight = -Infinity;
  let maxBottom = -Infinity;

  for (const el of targets) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (r.left < minLeft) minLeft = r.left;
    if (r.top < minTop) minTop = r.top;
    if (r.right > maxRight) maxRight = r.right;
    if (r.bottom > maxBottom) maxBottom = r.bottom;
  }

  if (minLeft === Infinity) {
    const rect = wrapper.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
    };
  }

  const width = maxRight - minLeft;
  const height = maxBottom - minTop;
  return {
    left: minLeft,
    top: minTop,
    width,
    height,
    cx: minLeft + width / 2,
    cy: minTop + height / 2,
  };
}

function createParticle(
  target: Target,
  index: number,
  staggerDelay: number,
): Particle {
  const isSpeck = Math.random() < 0.05;
  const roll = Math.random();
  const diameter = isSpeck
    ? 1.2
    : roll < 0.2
      ? 1.8
      : roll < 0.65
        ? 2.5
        : roll < 0.9
          ? 3.2
          : 3.8;

  const initialAngle = Math.random() * TAU;
  const initialDist = randomBetween(4, 35);
  const startX = target.x + Math.cos(initialAngle) * initialDist;
  const startY = target.y + Math.sin(initialAngle) * initialDist;

  return {
    index,
    target,
    x: startX,
    y: startY,
    vx: 0,
    vy: 0,
    size: Math.min(4.0, diameter),
    speck: isSpeck,
    delay: staggerDelay,
    born: 0,
    lifetime: randomBetween(900, 2600),
    releaseAngle: Math.random() * TAU,
    startX,
    startY,
  };
}

export function DevFestBraceField({
  enabled = true,
  ownLattice = false,
  hitPadding = 32,
  minSpanW,
  minHeight,
  minW,
  minH,
}: DevFestBraceFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const layer = canvas.parentElement;
    const wrapper = layer?.parentElement;
    if (!layer || !wrapper) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Reduced distance between two brackets
    const resolvedMinSpanW = minSpanW ?? minW ?? 560;
    const resolvedMinHeight = minHeight ?? minH ?? 460;

    let width = 1;
    let height = 1;
    let dpr = 1;
    let particles: Particle[] = [];
    let leftContour: Point[] = [];
    let rightContour: Point[] = [];
    let frameId = 0;
    let active = false;
    let visible = true;
    let transitioning = false;
    let releaseStartedAt = 0;
    let leaveTimer = 0;
    let lastPointerX = -1;
    let lastPointerY = -1;

    let C = { x: 0, y: 0 };
    let outerTipDistance = 340;
    let braceHeight = 520;

    const schedule = () => {
      if (frameId === 0 && visible && !document.hidden) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    const getHitZone = () => {
      const maxTiltOffset = Math.ceil((braceHeight / 2) * TILT_TAN);
      return {
        left: C.x - outerTipDistance - maxTiltOffset - hitPadding,
        right: C.x + outerTipDistance + maxTiltOffset + hitPadding,
        top: C.y - braceHeight / 2 - hitPadding,
        bottom: C.y + braceHeight / 2 + hitPadding,
      };
    };

    const isPointerInside = (px = lastPointerX, py = lastPointerY) => {
      const hz = getHitZone();
      return (
        px >= hz.left && px <= hz.right && py >= hz.top && py <= hz.bottom
      );
    };

    const drawLattice = () => {
      if (!ownLattice) return;
      ctx.clearRect(0, 0, width, height);
      const spacing = 20;
      ctx.fillStyle = "rgba(26,27,31,0.9)";
      for (let r = 0; r * spacing < height; r += 1) {
        const offset = (r % 2) * (spacing / 2);
        for (let x = offset; x < width; x += spacing) {
          ctx.beginPath();
          ctx.arc(x, r * spacing, 0.75, 0, TAU);
          ctx.fill();
        }
      }
    };

    const recomputeTargets = () => {
      const textBlock = getTextBlockRect(wrapper);
      C = { x: textBlock.cx, y: textBlock.cy };

      const W = textBlock.width;
      const H = textBlock.height;

      const unscaledBraceHeight = Math.max(resolvedMinHeight, 2.35 * H);
      // Broad & bulgy bracket width:
      const unscaledBraceWidth = Math.max(
        190,
        Math.round(unscaledBraceHeight * 0.46),
      );
      // Significantly reduced distance between the inner bracket tips (~250px):
      const unscaledTipGap = 250;
      const halfGap = unscaledTipGap / 2;
      // Distance from center C.x to outer edge (including 24px raster padding):
      const unscaledOuterTipDist = halfGap + unscaledBraceWidth + 24;
      const unscaledSpan = unscaledOuterTipDist * 2;
      let strokeThickness = Math.round(unscaledBraceHeight * 0.115);

      const viewportW = window.innerWidth;
      let scale = 1;
      if (viewportW < unscaledSpan + 24) {
        scale = Math.max(0.2, (viewportW - 24) / unscaledSpan);
      }

      braceHeight = unscaledBraceHeight * scale;
      outerTipDistance = unscaledOuterTipDist * scale;
      const eachBraceWidth = unscaledBraceWidth * scale;
      strokeThickness *= scale;

      const totalSpan = outerTipDistance * 2;

      const maxTiltOffset = Math.ceil((braceHeight / 2) * TILT_TAN);
      const margin = 24 + maxTiltOffset;
      const rawCanvasW = Math.ceil(totalSpan + margin * 2);
      const rawCanvasH = Math.ceil(braceHeight + margin * 2);

      width = Math.min(rawCanvasW, viewportW);
      height = rawCanvasH;

      const wrapperRect = wrapper.getBoundingClientRect();
      const canvasLeft = C.x - wrapperRect.left - width / 2;
      const canvasTop = C.y - wrapperRect.top - height / 2;

      canvas.style.left = `${canvasLeft}px`;
      canvas.style.top = `${canvasTop}px`;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const C_canvas = { x: width / 2, y: height / 2 };

      if (process.env.NODE_ENV !== "production") {
        const leftBraceMinX = C.x - outerTipDistance - maxTiltOffset;
        const rightBraceMaxX = C.x + outerTipDistance + maxTiltOffset;
        const bboxCenterX = (leftBraceMinX + rightBraceMaxX) / 2;
        const bboxCenterY =
          (C.y - braceHeight / 2 + (C.y + braceHeight / 2)) / 2;
        const diffX = Math.abs(bboxCenterX - C.x);
        const diffY = Math.abs(bboxCenterY - C.y);
        if (diffX > 2 || diffY > 2) {
          console.warn(
            `[DevFestBraceField] DevFest brace bbox centre differs from C by dx=${diffX.toFixed(2)}px, dy=${diffY.toFixed(2)}px`,
          );
        }
      }

      const raster = makeSquareCurlyRaster(
        eachBraceWidth,
        braceHeight,
        strokeThickness,
      );

      const countPerBrace = 450;
      const bodyCount = Math.round(countPerBrace * 0.12);
      const edgeCount = countPerBrace - bodyCount;

      const sampledEdge = sampleBlueNoise(raster.edge, edgeCount, 12, 3);
      const sampledBody = sampleBlueNoise(raster.body, bodyCount, 8, 3);

      const cEdgeX =
        sampledEdge.reduce((s, p) => s + p.x, 0) / sampledEdge.length;
      const cEdgeY =
        sampledEdge.reduce((s, p) => s + p.y, 0) / sampledEdge.length;
      sampledEdge.sort(
        (a, b) =>
          Math.atan2(a.y - cEdgeY, a.x - cEdgeX) -
          Math.atan2(b.y - cEdgeY, b.x - cEdgeX),
      );

      const leftX = C_canvas.x - outerTipDistance;
      const leftY = C_canvas.y - raster.height / 2;

      // Both brackets tilted towards right by 0.1 degrees (shear dx = -(y - cy) * tan(0.1deg))
      leftContour = sampledEdge.map((p) => {
        const rawX = leftX + p.x;
        const rawY = leftY + p.y;
        return {
          x: rawX - (rawY - C_canvas.y) * TILT_TAN,
          y: rawY,
        };
      });

      const rightX = C_canvas.x + outerTipDistance - raster.width;
      const rightY = C_canvas.y - raster.height / 2;

      rightContour = sampledEdge.map((p) => {
        const rawX = rightX + (raster.width - p.x);
        const rawY = rightY + p.y;
        return {
          x: rawX - (rawY - C_canvas.y) * TILT_TAN,
          y: rawY,
        };
      });

      const allTargets: Target[] = [];

      for (let i = 0; i < leftContour.length; i += 1) {
        allTargets.push({
          x: leftContour[i].x,
          y: leftContour[i].y,
          contour: 0,
          position: i,
          brace: "left",
          isEdge: true,
        });
      }

      for (let i = 0; i < sampledBody.length; i += 1) {
        const rawX = leftX + sampledBody[i].x;
        const rawY = leftY + sampledBody[i].y;
        allTargets.push({
          x: rawX - (rawY - C_canvas.y) * TILT_TAN,
          y: rawY,
          contour: -1,
          position: i,
          brace: "left",
          isEdge: false,
        });
      }

      for (let i = 0; i < rightContour.length; i += 1) {
        allTargets.push({
          x: rightContour[i].x,
          y: rightContour[i].y,
          contour: 1,
          position: i,
          brace: "right",
          isEdge: true,
        });
      }

      for (let i = 0; i < sampledBody.length; i += 1) {
        const rawX = rightX + (raster.width - sampledBody[i].x);
        const rawY = rightY + sampledBody[i].y;
        allTargets.push({
          x: rawX - (rawY - C_canvas.y) * TILT_TAN,
          y: rawY,
          contour: -1,
          position: i,
          brace: "right",
          isEdge: false,
        });
      }

      const distances = allTargets.map((t) =>
        Math.hypot(t.x - C_canvas.x, t.y - C_canvas.y),
      );
      const minDist = Math.min(...distances);
      const maxDist = Math.max(...distances);
      const distRange = Math.max(1, maxDist - minDist);

      const now = performance.now();
      particles = allTargets.map((target, idx) => {
        const d = distances[idx];
        const progress = (d - minDist) / distRange;
        const stagger = progress * 450;
        const p = createParticle(target, idx, stagger);
        p.born = now;
        return p;
      });
    };

    const resize = () => {
      recomputeTargets();
      if (active) {
        schedule();
      } else if (ownLattice) {
        drawLattice();
      }
    };

    const begin = () => {
      window.clearTimeout(leaveTimer);
      if (active) return;
      visible = true;
      active = true;
      transitioning = false;
      recomputeTargets();
      schedule();
    };

    const release = () => {
      if (!active) return;
      active = false;
      transitioning = true;
      releaseStartedAt = performance.now();
      for (const p of particles) {
        p.releaseAngle = Math.random() * TAU;
        p.startX = p.x;
        p.startY = p.y;
      }
      schedule();
    };

    const releaseSoon = (immediate = false) => {
      window.clearTimeout(leaveTimer);
      if (immediate) {
        release();
        return;
      }
      leaveTimer = window.setTimeout(() => {
        if (!isPointerInside() && !wrapper.contains(document.activeElement)) {
          release();
        }
      }, 100);
    };

    const targetAt = (p: Particle, now: number): Point => {
      if (p.target.contour < 0 || reducedMotion.matches) return p.target;
      const contour = p.target.contour === 0 ? leftContour : rightContour;
      if (contour.length < 2) return p.target;
      const shift = ((now - p.born) * 0.0006) % contour.length;
      const pos = (p.target.position + shift) % contour.length;
      const idx1 = Math.floor(pos);
      const idx2 = (idx1 + 1) % contour.length;
      const frac = pos - idx1;
      const nx =
        contour[idx1].x + (contour[idx2].x - contour[idx1].x) * frac;
      const ny =
        contour[idx1].y + (contour[idx2].y - contour[idx1].y) * frac;
      const jx = smoothNoise(now * 0.0008, p.index * 1.7) * 1.5;
      const jy = smoothNoise(now * 0.0008 + 100, p.index * 1.7 + 50) * 1.5;
      return { x: nx + jx, y: ny + jy };
    };

    function render(now: number) {
      frameId = 0;
      if (!visible || document.hidden) return;

      ctx.clearRect(0, 0, width, height);
      if (ownLattice) drawLattice();

      // Unified smooth floating motion handled by CSS @keyframes dfb-float
      const floatY = 0;

      if (active) {
        for (const p of particles) {
          const age = now - p.born;
          if (
            !reducedMotion.matches &&
            age >= p.delay &&
            age - p.delay >= p.lifetime
          ) {
            p.born = now;
            p.delay = 0;
            p.lifetime = randomBetween(900, 2600);
            const ang = Math.random() * TAU;
            const dist = randomBetween(4, 20);
            p.x = p.target.x + Math.cos(ang) * dist;
            p.y = p.target.y + Math.sin(ang) * dist;
            p.vx = 0;
            p.vy = 0;
          }

          if (age < p.delay) {
            continue;
          }

          const activeAge = age - p.delay;
          const target = targetAt(p, now);

          if (reducedMotion.matches) {
            p.x = target.x;
            p.y = target.y;
          } else {
            p.vx = (p.vx + (target.x - p.x) * 0.08) * 0.8;
            p.vy = (p.vy + (target.y - p.y) * 0.08) * 0.8;
            p.x += p.vx;
            p.y += p.vy;
          }

          const gatherProgress = reducedMotion.matches
            ? 1
            : Math.min(1, activeAge / 250);
          const opacity = reducedMotion.matches
            ? 1
            : Math.min(1, activeAge / 150);

          const color = p.speck ? RED : mixHex(BLACK, BLUE, gatherProgress);

          ctx.globalAlpha = opacity;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(
            Math.round(p.x * 2) / 2,
            Math.round((p.y + floatY) * 2) / 2,
            p.speck ? 0.6 : p.size / 2,
            0,
            TAU,
          );
          ctx.fill();
        }

        if (!reducedMotion.matches) {
          schedule();
        }
      } else if (transitioning) {
        const elapsed = now - releaseStartedAt;
        const duration = 450;
        const progress = reducedMotion.matches
          ? 1
          : Math.min(1, elapsed / duration);

        for (const p of particles) {
          const drift = 6 + (p.index % 9);
          const currentDrift = drift * progress;
          const x = p.startX + Math.cos(p.releaseAngle) * currentDrift;
          const y = p.startY + Math.sin(p.releaseAngle) * currentDrift;

          let color = BLACK;
          if (progress < 0.33) {
            color = mixHex(BLUE, RED, progress / 0.33);
          } else if (progress < 0.66) {
            color = mixHex(RED, BLACK, (progress - 0.33) / 0.33);
          }

          ctx.globalAlpha = Math.max(0, 1 - progress);
          ctx.fillStyle = p.speck ? RED : color;
          ctx.beginPath();
          ctx.arc(
            Math.round(x * 2) / 2,
            Math.round((y + floatY) * 2) / 2,
            p.speck ? 0.6 : p.size / 2,
            0,
            TAU,
          );
          ctx.fill();
        }

        if (progress < 1) {
          schedule();
        } else {
          transitioning = false;
          particles = [];
          ctx.clearRect(0, 0, width, height);
          if (ownLattice) drawLattice();
        }
      }

      ctx.globalAlpha = 1;
    }

    const onPointerMove = (e: PointerEvent) => {
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      if (e.pointerType === "touch") return;
      if (isPointerInside(e.clientX, e.clientY)) {
        begin();
      } else if (active) {
        releaseSoon();
      }
    };

    const onPointerLeave = () => {
      if (active) releaseSoon();
    };

    const onFocusIn = () => begin();
    const onFocusOut = (e: FocusEvent) => {
      if (!e.relatedTarget || !wrapper.contains(e.relatedTarget as Node)) {
        releaseSoon();
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      if (isPointerInside(e.clientX, e.clientY)) {
        begin();
      } else {
        releaseSoon(true);
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });
    wrapper.addEventListener("focusin", onFocusIn);
    wrapper.addEventListener("focusout", onFocusOut);
    wrapper.addEventListener("pointerdown", onPointerDown, { passive: true });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrapper);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible && frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      } else if (visible && (active || transitioning)) {
        schedule();
      }
    });
    intersectionObserver.observe(wrapper);

    if (document.fonts) {
      document.fonts.ready.then(resize);
    }

    resize();

    return () => {
      window.clearTimeout(leaveTimer);
      if (frameId) window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      wrapper.removeEventListener("focusin", onFocusIn);
      wrapper.removeEventListener("focusout", onFocusOut);
      wrapper.removeEventListener("pointerdown", onPointerDown);
    };
  }, [enabled, hitPadding, minH, minHeight, minSpanW, minW, ownLattice]);

  if (!enabled) return null;

  return (
    <div className="dfb-layer" aria-hidden="true">
      <canvas ref={canvasRef} className="dfb-canvas" />
    </div>
  );
}
