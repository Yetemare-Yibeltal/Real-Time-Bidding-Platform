import { motion, useMotionValue, useMotionTemplate } from 'framer-motion'

export const GlobalInteractiveBackground = () => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  return (
    <motion.div
      className='fixed inset-0 -z-10 bg-slate-950 overflow-hidden'
      onMouseMove={e => {
        mouseX.set(e.clientX)
        mouseY.set(e.clientY)
      }}
    >
      <motion.div
        className='absolute w-[600px] h-[600px] rounded-full blur-[120px] bg-blue-600/20'
        style={{
          x: useMotionTemplate`${mouseX}px`,
          y: useMotionTemplate`${mouseY}px`,
          translateX: '-50%',
          translateY: '-50%'
        }}
      />
    </motion.div>
  )
}
