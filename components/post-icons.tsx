// Stylized SVG icons assigned per post via frontmatter `icon: <name>`.
// All icons render in the warm accent via `currentColor` on the wrapper.

const SIZE = 44

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox="0 0 40 40"
      aria-hidden
      className="block"
    >
      {children}
    </svg>
  )
}

function MeshIcon() {
  // Smaller triangulated patch — fits the magitek FEA / structural-complexity vibe.
  const cols = 4
  const rows = 3
  const dx = 8
  const dy = 8
  const offsetX = 5
  const offsetY = 8
  const points: [number, number][] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const jitter = (r + c) % 2 === 0 ? 0.8 : -0.6
      points.push([offsetX + c * dx + r * 1.5, offsetY + r * dy + jitter])
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
    <Wrap>
      <g stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.75">
        {tri.map(([a, b, c], i) => (
          <polygon
            key={i}
            points={`${points[a][0]},${points[a][1]} ${points[b][0]},${points[b][1]} ${points[c][0]},${points[c][1]}`}
          />
        ))}
      </g>
      <g fill="currentColor" opacity="0.9">
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.8" />
        ))}
      </g>
    </Wrap>
  )
}

function TrajectoryIcon() {
  return (
    <Wrap>
      <path
        d="M 5 32 C 12 8, 24 32, 35 8"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeDasharray="1.6,1.8"
        fill="none"
        opacity="0.75"
      />
      <circle cx="5" cy="32" r="1.8" fill="currentColor" />
      <polygon points="35,8 30.5,7.5 31.5,12.5" fill="currentColor" />
    </Wrap>
  )
}

function CoilIcon() {
  return (
    <Wrap>
      <circle
        cx="20"
        cy="20"
        r="14"
        stroke="currentColor"
        strokeWidth="0.7"
        fill="none"
        opacity="0.55"
      />
      <circle
        cx="20"
        cy="20"
        r="10"
        stroke="currentColor"
        strokeWidth="0.7"
        fill="none"
        opacity="0.7"
      />
      <circle
        cx="20"
        cy="20"
        r="6"
        stroke="currentColor"
        strokeWidth="0.7"
        fill="none"
        opacity="0.85"
      />
      <circle cx="20" cy="20" r="1.4" fill="currentColor" />
    </Wrap>
  )
}

function DatabaseIcon() {
  return (
    <Wrap>
      <g stroke="currentColor" strokeWidth="0.9" fill="none" opacity="0.8">
        <ellipse cx="20" cy="9" rx="11" ry="2.6" />
        <path d="M 9 9 L 9 31" />
        <path d="M 31 9 L 31 31" />
        <path d="M 9 19 a 11 2.6 0 0 0 22 0" />
        <path d="M 9 31 a 11 2.6 0 0 0 22 0" />
      </g>
    </Wrap>
  )
}

function CompassIcon() {
  return (
    <Wrap>
      <circle
        cx="20"
        cy="20"
        r="14"
        stroke="currentColor"
        strokeWidth="0.7"
        fill="none"
        opacity="0.7"
      />
      {/* cardinal ticks */}
      <line
        x1="20"
        y1="6"
        x2="20"
        y2="9"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      <line
        x1="20"
        y1="31"
        x2="20"
        y2="34"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.5"
      />
      <line
        x1="6"
        y1="20"
        x2="9"
        y2="20"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.5"
      />
      <line
        x1="31"
        y1="20"
        x2="34"
        y2="20"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.5"
      />
      {/* needle */}
      <polygon points="20,8 17,22 23,22" fill="currentColor" opacity="0.9" />
      <polygon points="20,32 17,22 23,22" fill="currentColor" opacity="0.35" />
    </Wrap>
  )
}

function NetworkIcon() {
  return (
    <Wrap>
      <g stroke="currentColor" strokeWidth="0.6" opacity="0.55">
        <line x1="8" y1="10" x2="20" y2="20" />
        <line x1="32" y1="10" x2="20" y2="20" />
        <line x1="8" y1="30" x2="20" y2="20" />
        <line x1="32" y1="30" x2="20" y2="20" />
        <line x1="8" y1="10" x2="8" y2="30" />
        <line x1="32" y1="10" x2="32" y2="30" />
      </g>
      <g fill="currentColor" opacity="0.9">
        <circle cx="8" cy="10" r="2" />
        <circle cx="32" cy="10" r="2" />
        <circle cx="20" cy="20" r="2.4" />
        <circle cx="8" cy="30" r="2" />
        <circle cx="32" cy="30" r="2" />
      </g>
    </Wrap>
  )
}

function ArmIcon() {
  // 3-link kinematic arm: base, two revolute joints, end effector.
  return (
    <Wrap>
      <g
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      >
        <line x1="20" y1="34" x2="12" y2="22" />
        <line x1="12" y1="22" x2="24" y2="14" />
        <line x1="24" y1="14" x2="32" y2="8" />
      </g>
      <g fill="currentColor">
        {/* base */}
        <rect x="14" y="33" width="12" height="3" rx="1" opacity="0.7" />
        {/* joints */}
        <circle cx="20" cy="34" r="2.2" />
        <circle cx="12" cy="22" r="2" />
        <circle cx="24" cy="14" r="2" />
        {/* end effector: small gripper */}
        <g
          stroke="currentColor"
          strokeWidth="1.1"
          fill="none"
          opacity="0.85"
        >
          <line x1="32" y1="8" x2="30" y2="4" />
          <line x1="32" y1="8" x2="35" y2="5" />
        </g>
      </g>
    </Wrap>
  )
}

function EyeIcon() {
  return (
    <Wrap>
      <g stroke="currentColor" strokeWidth="0.9" fill="none" opacity="0.85">
        <path d="M 4 20 Q 20 6, 36 20 Q 20 34, 4 20 Z" />
        <circle cx="20" cy="20" r="5.5" />
      </g>
      <circle cx="20" cy="20" r="2.2" fill="currentColor" />
    </Wrap>
  )
}

const ICONS: Record<string, React.FC> = {
  mesh: MeshIcon,
  trajectory: TrajectoryIcon,
  coil: CoilIcon,
  database: DatabaseIcon,
  compass: CompassIcon,
  network: NetworkIcon,
  eye: EyeIcon,
  arm: ArmIcon,
}

export function PostIcon({ name }: { name?: string }) {
  if (!name) return null
  const Icon = ICONS[name]
  if (!Icon) return null
  return (
    <div className="text-warm" aria-hidden>
      <Icon />
    </div>
  )
}
