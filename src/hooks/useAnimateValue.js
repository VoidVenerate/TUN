import { useEffect, useRef, useState } from 'react'

export function useAnimateValue(targetValue, duration = 800) {
  const [displayValue, setDisplayValue] = useState(targetValue)
  const displayRef = useRef(targetValue)

  useEffect(() => {
    displayRef.current = displayValue
  })

  useEffect(() => {
    const startValue = displayRef.current
    const endValue = targetValue
    let startTime = null
    let rafId = null

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const newValue = startValue + (endValue - startValue) * progress
      setDisplayValue(Number(newValue.toFixed(1)))
      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      }
    }

    rafId = requestAnimationFrame(animate)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [targetValue, duration])

  return displayValue
}
