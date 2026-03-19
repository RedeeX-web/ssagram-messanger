import { motion } from 'framer-motion';

const TabTransition = ({ children, direction }) => {
  const variants = {
  initial: (d) => ({
    x: d < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
  },
  exit: (d) => ({
    x: d < 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

  return (
    <motion.div
      custom={direction} // Передаем direction сюда
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ 
        duration: 0.3, 
        ease: [0.4, 0, 0.2, 1] 
      }}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        backgroundColor: 'var(--bg-color)' // Обязательно, чтобы не было прозрачности
      }}
    >
      {children}
    </motion.div>
  );
};

export default TabTransition;