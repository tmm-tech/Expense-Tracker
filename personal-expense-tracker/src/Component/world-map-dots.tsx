"use client"

export function WorldMapDots() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <pattern id="dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="currentColor" className="text-muted-foreground/40" />
          </pattern>
        </defs>
        {/* Rough world map outline using dots */}
        <g fill="currentColor" className="text-muted-foreground">
          {/* North America */}
          {Array.from({ length: 80 }).map((_, i) => {
            const angle = (i / 80) * Math.PI * 0.8
            const radius = 120 + Math.random() * 40
            const x = 200 + Math.cos(angle + 2) * radius
            const y = 200 + Math.sin(angle + 2) * radius * 1.2
            return <circle key={`na-${i}`} cx={x} cy={y} r="1.2" opacity={Math.random() * 0.6 + 0.4} />
          })}
          {/* South America */}
          {Array.from({ length: 50 }).map((_, i) => {
            const angle = (i / 50) * Math.PI * 0.7
            const radius = 60 + Math.random() * 30
            const x = 220 + Math.cos(angle + 3.5) * radius
            const y = 380 + Math.sin(angle + 3.5) * radius * 1.5
            return <circle key={`sa-${i}`} cx={x} cy={y} r="1.2" opacity={Math.random() * 0.6 + 0.4} />
          })}
          {/* Europe */}
          {Array.from({ length: 60 }).map((_, i) => {
            const angle = (i / 60) * Math.PI * 0.6
            const radius = 60 + Math.random() * 25
            const x = 380 + Math.cos(angle + 2.5) * radius
            const y = 160 + Math.sin(angle + 2.5) * radius
            return <circle key={`eu-${i}`} cx={x} cy={y} r="1.2" opacity={Math.random() * 0.6 + 0.4} />
          })}
          {/* Africa */}
          {Array.from({ length: 90 }).map((_, i) => {
            const angle = (i / 90) * Math.PI * 0.9
            const radius = 80 + Math.random() * 35
            const x = 400 + Math.cos(angle + 3) * radius
            const y = 300 + Math.sin(angle + 3) * radius * 1.3
            return <circle key={`af-${i}`} cx={x} cy={y} r="1.2" opacity={Math.random() * 0.6 + 0.4} />
          })}
          {/* Asia */}
          {Array.from({ length: 120 }).map((_, i) => {
            const angle = (i / 120) * Math.PI * 1.1
            const radius = 140 + Math.random() * 50
            const x = 520 + Math.cos(angle + 2.2) * radius
            const y = 220 + Math.sin(angle + 2.2) * radius * 1.1
            return <circle key={`as-${i}`} cx={x} cy={y} r="1.2" opacity={Math.random() * 0.6 + 0.4} />
          })}
          {/* Australia */}
          {Array.from({ length: 40 }).map((_, i) => {
            const angle = (i / 40) * Math.PI * 0.8
            const radius = 50 + Math.random() * 20
            const x = 620 + Math.cos(angle + 3.5) * radius
            const y = 480 + Math.sin(angle + 3.5) * radius
            return <circle key={`au-${i}`} cx={x} cy={y} r="1.2" opacity={Math.random() * 0.6 + 0.4} />
          })}
        </g>
      </svg>
    </div>
  )
}