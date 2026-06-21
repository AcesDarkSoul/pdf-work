import { useNavigate } from 'react-router-dom';
import { ArrowRight, Download, Edit3, Upload, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  { icon: Download, title: 'Download Task', desc: 'Get your daily PDF task from the dashboard.' },
  { icon: Edit3, title: 'Edit PDF', desc: 'Follow the specific instructions provided.' },
  { icon: Upload, title: 'Re-upload', desc: 'Submit completed work for review.' },
  { icon: CheckCircle, title: 'Get Paid', desc: 'Earn ₹100 - ₹200 per approved task.' },
];

const OnboardingInstructions = () => {
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
            <CheckCircle size={28} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'white', fontFamily: "'Outfit',sans-serif", letterSpacing: '-0.3px', marginBottom: 8 }}>
            How it works
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6 }}>
            Your path to daily earning is simple and secure. Follow these steps to get started.
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + (idx * 0.1) }}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8f9fc', borderRadius: '16px', border: '1px solid #e4e7f0' }}
            >
              <div style={{ background: 'white', padding: '12px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <step.icon size={24} color="#2d1b69" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '2px', color: '#0f1220', fontFamily: "'Outfit',sans-serif" }}>{step.title}</h3>
                <p style={{ color: '#5a6480', fontSize: '13px', lineHeight: '1.4' }}>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
          style={{
            marginTop: '24px', padding: '16px', borderRadius: 14,
            background: 'linear-gradient(135deg,#00c37e,#00e896)',
            border: 'none', color: 'white', fontWeight: 800, fontSize: 16,
            cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
            boxShadow: '0 6px 24px rgba(0,195,126,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', transition: 'all 0.2s'
          }}
          onClick={() => navigate('/onboarding-2')}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Got it, Next <ArrowRight size={20} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingInstructions;
