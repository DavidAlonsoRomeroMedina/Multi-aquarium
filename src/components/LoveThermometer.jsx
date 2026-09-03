import { motion } from 'framer-motion'

const TICKS = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

export default function LoveThermometer({ percent = 0, animate = true }) {
  const fill = Math.max(0, Math.min(100, Math.round(percent)))

  return (
    <div className="love-meter" aria-label={`Afinidad ${fill}%`}>
      <span className="love-sparkle love-sparkle-a">✦</span>
      <span className="love-sparkle love-sparkle-b">♡</span>
      <span className="love-sparkle love-sparkle-c">✿</span>
      <span className="love-sparkle love-sparkle-d">✦</span>
      <span className="love-petal love-petal-a">❀</span>
      <span className="love-petal love-petal-b">❀</span>

      <div className="love-meter-column">
        <div className="love-fill-well">
          <motion.div
            className="love-liquid"
            initial={{ height: '0%' }}
            animate={{ height: `${fill}%` }}
            transition={
              animate
                ? { duration: 1.85, ease: [0.22, 0.8, 0.2, 1] }
                : { duration: 0 }
            }
          />
        </div>
        <ol className="love-scale" aria-hidden="true">
          {TICKS.map((tick) => (
            <li key={tick} style={{ bottom: `${tick}%` }}>
              {tick}%
            </li>
          ))}
        </ol>
      </div>

      <div className="love-bow">
        <span className="love-bow-left" />
        <span className="love-bow-center">✿</span>
        <span className="love-bow-right" />
      </div>
    </div>
  )
}
