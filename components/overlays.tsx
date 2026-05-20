// SVG overlay graphics that draw from the robotics/physics visual vocabulary.
// Color is inherited via `currentColor` so they pick up dark/light mode through
// the `text-warm` utility on the wrapping element.

export function FeaMesh() {
  const cols = 6
  const rows = 4
  const dx = 18
  const dy = 16
  const points: [number, number][] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const jitter = (r + c) % 2 === 0 ? 1.5 : -1.2
      points.push([c * dx + r * 4, r * dy + jitter])
    }
  }
  const tri: [number, number, number][] = []
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const i = r * cols + c
      tri.push([i, i + 1, i + cols])
      tri.push([i + 1, i + cols + 1, i + cols])
    }
  }
  return (
    <div
      className="absolute top-6 right-6 pointer-events-none hidden md:block text-warm"
      aria-hidden
    >
      <svg width={cols * dx + 20} height={rows * dy + 10}>
        <g
          stroke="currentColor"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.55"
        >
          {tri.map((t, i) => {
            const [a, b, c] = t
            const [ax, ay] = points[a]
            const [bx, by] = points[b]
            const [cx, cy] = points[c]
            return (
              <polygon
                key={i}
                points={`${ax},${ay} ${bx},${by} ${cx},${cy}`}
              />
            )
          })}
        </g>
        <g fill="currentColor" opacity="0.75">
          {points.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.1" />
          ))}
        </g>
      </svg>
    </div>
  )
}

export function TrajectoryCurve() {
  return (
    <div
      className="absolute pointer-events-none hidden md:block text-warm"
      style={{
        top: "12%",
        left: "50%",
        transform: "translateX(-50%)",
      }}
      aria-hidden
    >
      <svg width="900" height="220" viewBox="0 0 900 220">
        <path
          d="M 60 180 C 220 40, 380 200, 540 80 S 820 60, 880 20"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeDasharray="4,5"
          fill="none"
          opacity="0.5"
        />
        <circle cx="60" cy="180" r="3" fill="currentColor" opacity="0.7" />
        <polygon
          points="880,20 868,15 870,28"
          fill="currentColor"
          opacity="0.7"
        />
        <circle cx="300" cy="111" r="1.6" fill="currentColor" opacity="0.45" />
        <circle cx="540" cy="80" r="1.6" fill="currentColor" opacity="0.45" />
        <circle cx="730" cy="46" r="1.6" fill="currentColor" opacity="0.45" />
      </svg>
    </div>
  )
}
