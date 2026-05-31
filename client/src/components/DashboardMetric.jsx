import { motion } from 'framer-motion'

export const DashboardMetric = ({ label, value, icon }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className='glass-3d-card p-6 border border-white/10 rounded-2xl flex items-center justify-between'
  >
    <div>
      <p className='text-white/40 text-xs uppercase tracking-widest'>{label}</p>
      <h3 className='text-2xl font-bold gradient-text'>{value}</h3>
    </div>
    <div className='text-blue-500 text-2xl'>{icon}</div>
  </motion.div>
)
