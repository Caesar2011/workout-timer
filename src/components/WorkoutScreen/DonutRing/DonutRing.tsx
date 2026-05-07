import type { DonutSegment, PhaseKind } from '../../../types';

import styles from './DonutRing.module.css';

interface Props {
  segments: DonutSegment[];
  totalSecs: number;
  elapsedSecs: number;
  phase: PhaseKind;
}

const SIZE = 500;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = 220;
const INNER_R = 160;

/** Convert polar angle (degrees from top, clockwise) to SVG x/y. */
function polarToXY(angleDeg: number, r: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function arcPath(
  startAngle: number,
  sweepAngle: number,
  outerR: number,
  innerR: number,
): string {
  // clamp to avoid degenerate arcs
  const sweep = Math.min(sweepAngle, 359.999);
  const largeArc = sweep > 180 ? 1 : 0;
  const endAngle = startAngle + sweep;

  const o1 = polarToXY(startAngle, outerR);
  const o2 = polarToXY(endAngle, outerR);
  const i1 = polarToXY(endAngle, innerR);
  const i2 = polarToXY(startAngle, innerR);

  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ');
}

export function DonutRing({ segments, totalSecs, elapsedSecs, phase }: Props) {
  if (totalSecs === 0) return null;

  const elapsedDeg = (elapsedSecs / totalSecs) * 360;

  return (
    <svg
      class={styles.svg}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {segments.map((seg, i) => {
        const segEndAngle = seg.startAngle + seg.sweepAngle;
        const color =
          seg.kind === 'active' ? 'var(--c-active)' : 'var(--c-rest)';

        // Portion of this segment that is elapsed (fully dark)
        const elapsedInSeg = Math.max(
          0,
          Math.min(elapsedDeg - seg.startAngle, seg.sweepAngle),
        );
        // Portion remaining (colored)
        const remainingStart = seg.startAngle + elapsedInSeg;
        const remainingSweep = seg.sweepAngle - elapsedInSeg;

        return (
          <g key={i}>
            {/* Full segment background (dim) */}
            <path
              d={arcPath(seg.startAngle, seg.sweepAngle, OUTER_R, INNER_R)}
              fill="var(--c-done-seg)"
            />
            {/* Remaining colored portion */}
            {remainingSweep > 0.1 && (
              <path
                d={arcPath(remainingStart, remainingSweep, OUTER_R, INNER_R)}
                fill={color}
                opacity={phase === 'done' ? 0.3 : 1}
              />
            )}
            {/* Segment divider gap — thin dark line at boundaries */}
            <path
              d={arcPath(segEndAngle - 0.5, 1, OUTER_R + 2, INNER_R - 2)}
              fill="var(--c-bg)"
            />
          </g>
        );
      })}
    </svg>
  );
}
