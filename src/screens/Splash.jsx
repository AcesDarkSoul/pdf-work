import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-primary)' }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex-center flex-column"
        style={{ flexDirection: 'column', gap: '16px' }}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <div style={{ background: 'var(--accent-gradient)', padding: '24px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)' }}>
            <FileText size={64} color="white" />
          </div>
        </motion.div>
        <h1 className="text-gradient" style={{ fontSize: '32px', marginTop: '16px' }}>PDF Task App</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Earn easily by editing PDFs</p>
      </motion.div>
    </div>
  );
}

export default Splash;
