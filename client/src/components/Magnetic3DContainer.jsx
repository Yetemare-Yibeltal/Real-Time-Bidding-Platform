import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export const Magnetic3DContainer = ({ children }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-300, 300], [15, -15])
  const rotateY = useTransform(x, [-300, 300], [-15, 15])

  return (
    <motion.div
      style={{ rotateX, rotateY, z: 100 }}
      onMouseMove={e => {
        const rect = e.currentTarget.getBoundingClientRect()
        x.set(e.clientX - rect.left - rect.width / 2)
        y.set(e.clientY - rect.top - rect.height / 2)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
      className='preserve-3d'
    >
      {children}
    </motion.div>
  )
}
