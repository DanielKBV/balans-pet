import { sampleMonths } from "./sample-data"

// Isometric projection: x runs along the months, y across the pair, z is height in px.
const UNIT = 36
const COS = UNIT * 0.866
const SIN = UNIT * 0.5
const ORIGIN_X = 200
const ORIGIN_Y = 266
const MAX_BAR = 200
const STEP = 1.7
const SIZE = 0.62
const EXPENSE_ROW = 0.78

type Point = [number, number, number]

function toScreen([x, y, z]: Point): [number, number] {
  return [Math.round((ORIGIN_X + (x - y) * COS) * 10) / 10, Math.round((ORIGIN_Y + (x + y) * SIN - z) * 10) / 10]
}

const polygon = (points: Point[]) => points.map((point) => toScreen(point).join(",")).join(" ")

/** A box standing on the floor: the two faces turned to the viewer and the top. */
function Bar({ x, y, height, color }: { x: number; y: number; height: number; color: string }) {
  const [x1, y1] = [x + SIZE, y + SIZE]
  return (
    <g>
      <polygon points={polygon([[x, y1, 0], [x1, y1, 0], [x1, y1, height], [x, y1, height]])} style={{ fill: color }} />
      <polygon
        points={polygon([[x1, y, 0], [x1, y1, 0], [x1, y1, height], [x1, y, height]])}
        style={{ fill: `color-mix(in oklch, ${color}, black 35%)` }}
      />
      <polygon
        points={polygon([[x, y, height], [x1, y, height], [x1, y1, height], [x, y1, height]])}
        style={{ fill: `color-mix(in oklch, ${color}, white 22%)` }}
      />
    </g>
  )
}

/**
 * Static picture of the hero scene: six months of income and expense bars with the profit line above.
 * The 3D scene replaces it in RUN 3 and keeps it as the fallback, so the box is a fixed 4:3.
 */
export function HeroVisual({ label }: { label: string }) {
  const months = sampleMonths()
  const scale = MAX_BAR / Math.max(...months.map((m) => m.income))
  const profits = months.map((m) => m.income - m.expense)
  const [low, high] = [Math.min(...profits), Math.max(...profits)]
  // The projection drops every month lower on screen; lifting by the same amount keeps the line level,
  // so higher profit reads as higher, not as a fall.
  const linePoints = months.map((_, i) =>
    toScreen([i * STEP + SIZE, EXPENSE_ROW / 2 + SIZE / 2, 220 + i * STEP * SIN + ((profits[i] - low) / (high - low)) * 50])
  )
  const floorEnd = (months.length - 1) * STEP + SIZE + 0.6
  // One floor line between neighbouring months.
  const dividers = months.slice(1).map((_, i) => {
    const x = i * STEP + SIZE + (STEP - SIZE) / 2
    return [toScreen([x, -0.6, 0]), toScreen([x, 2, 0])]
  })

  return (
    <div className="relative mx-auto aspect-4/3 w-full max-w-md rise-in lg:max-w-none">
      <div aria-hidden className="absolute inset-0 bg-glow" />
      <svg viewBox="0 0 640 480" role="img" aria-label={label} className="relative size-full">
        <polygon
          points={polygon([[-0.6, -0.6, 0], [floorEnd, -0.6, 0], [floorEnd, 2, 0], [-0.6, 2, 0]])}
          className="fill-card stroke-border"
        />
        {dividers.map(([[x1, y1], [x2, y2]], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-border" />
        ))}
        {months.flatMap((month, i) => [
          <Bar key={`i${i}`} x={i * STEP} y={0} height={month.income * scale} color="var(--chart-income)" />,
          <Bar key={`e${i}`} x={i * STEP} y={EXPENSE_ROW} height={month.expense * scale} color="var(--chart-expense)" />,
        ])}
        <g>
          <polyline
            points={linePoints.map((point) => point.join(",")).join(" ")}
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            className="stroke-chart-profit"
          />
          {linePoints.map(([cx, cy], i) => {
            const isLast = i === linePoints.length - 1
            return <circle key={i} cx={cx} cy={cy} r={isLast ? 5 : 3} className={isLast ? "fill-primary-text" : "fill-chart-profit"} />
          })}
        </g>
      </svg>
    </div>
  )
}
