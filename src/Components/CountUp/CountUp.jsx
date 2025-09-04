// CountUp.jsx
import { motion, useSpring, useTransform } from "framer-motion"
import { useEffect } from "react"

const CountUp = ({ value }) => {
  const spring = useSpring(0, { stiffness: 100, damping: 20 })
  const display = useTransform(spring, (v) => Math.round(v))

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  return <motion.span>{display}</motion.span>
}

export default CountUp
