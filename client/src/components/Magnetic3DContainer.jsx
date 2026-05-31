import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export const Magnetic3DContainer = ({ children }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Configure spring physics for a "weighted" feel
  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const rotateX = useTransform(springY, [-300, 300], [15, -15])
  const rotateY = useTransform(springX, [-300, 300], [-15, 15])

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d', // Ensures children maintain 3D space
        perspective: 1000 // Adds depth to the 3D effect
      }}
      onMouseMove={e => {
        const rect = e.currentTarget.getBoundingClientRect()
        x.set(e.clientX - rect.left - rect.width / 2)
        y.set(e.clientY - rect.top - rect.height / 2)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
      className='relative'
    >
      {children}
    </motion.div>
  )
}
