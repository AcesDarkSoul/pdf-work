import { useNavigate } from 'react-router-dom';
import { Play, Video } from 'lucide-react';
import { motion } from 'framer-motion';

const OnboardingVideo = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f0f2f8' }}
    >
      {/* ── HEADER ── */}
      <div style={{
        background: 'linear-gradient(160deg,#0f1220 0%,#1a2040 60%,#2d1b69 100%)',
        padding: '44px 24px 64px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(0,195,126,0.15)' }} />
        <div style={{ position: 'absolute', bottom: -50, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(127,86,217,0.2)' }} />

        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#00c37e,#00e896)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 24px rgba(0,195,126,0.4)', marginBottom: 18 }}>
            <Video size={28} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'white', fontFamily: "'Outfit',sans-serif", letterSpacing: '-0.3px', marginBottom: 8 }}>
            Quick Tutorial
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6 }}>
            Watch this 2-minute video to master the workflow and maximize your earnings.
          </p>
        </motion.div>
      </div>

      {/* ── CONTENT CARD ── */}
      <motion.div
        initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          flex: 1, padding: '28px 22px',
          background: 'white',
          marginTop: -22, borderRadius: '22px 22px 0 0',
          position: 'relative', zIndex: 2,
          boxShadow: '0 -4px 24px rgba(15,18,32,0.1)',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column'
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }}
          style={{
            background: '#f8f9fc', padding: '12px', borderRadius: '20px',
            border: '1px solid #e4e7f0', boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            marginBottom: 'auto'
          }}
        >
          <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#000' }}>
            {/* Embedded YouTube video (using a placeholder tutorial video id) */}
            <iframe
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0&modestbranding=1"
              title="Tutorial Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
          style={{
            marginTop: '24px', padding: '16px', borderRadius: 14,
            background: 'linear-gradient(135deg,#00c37e,#00e896)',
            border: 'none', color: 'white', fontWeight: 800, fontSize: 16,
            cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
            boxShadow: '0 6px 24px rgba(0,195,126,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', transition: 'all 0.2s'
          }}
          onClick={() => navigate('/onboarding-3')}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Start Earning Tasks <Play size={20} fill="currentColor" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingVideo;
