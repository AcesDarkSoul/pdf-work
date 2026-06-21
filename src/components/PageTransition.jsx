import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

const PageTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={`screen-container ${className}`}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
