import { useMemo } from 'react'

function createStars(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `star-${index}`,
    left: `${(index * 17 + 9) % 100}%`,
    top: `${(index * 13 + 5) % 78}%`,
    size: index % 7 === 0 ? 2.4 : index % 3 === 0 ? 1.6 : 1.1,
    delay: `${(index * 0.37) % 5}s`,
    duration: `${2.8 + (index % 5) * 0.6}s`,
  }))
}

export default function NightSky() {
  const stars = useMemo(() => createStars(56), [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="night-sky absolute inset-0" />
      <div className="night-glow absolute inset-0" />
      {stars.map((star) => (
        <span
          key={star.id}
          className="night-star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
    </div>
  )
}
