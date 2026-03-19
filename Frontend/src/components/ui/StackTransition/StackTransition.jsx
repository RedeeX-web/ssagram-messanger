import { motion } from 'framer-motion';

const StackTransition = ({ children }) => (
  <motion.div
    initial={{ x: '100%' }}
    animate={{ x: 0 }}
    exit={{ x: '100%' }}
    transition={{ 
      duration: 0.09, // 200мс — очень быстро и отзывчиво
      ease: 'ease-out'// Плавный, но резкий старт
    }}
    style={{
      position: 'fixed', 
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--bg-color)',
      zIndex: 100, 
      boxShadow: '-10px 0 30px rgba(0,0,0,0.3)',
    }}
  >
    {children}
  </motion.div>
);

export default StackTransition;