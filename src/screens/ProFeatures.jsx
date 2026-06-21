import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, CheckCircle, Zap, Headphones, ArrowLeft, Clock, User } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const ProFeatures = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const plans = {
    free: {
      title: 'Basic Free',
      price: '₹0',
      period: '/ forever',
      icon: User,
      color: 'var(--text-secondary)',
      bg: 'var(--bg-secondary)',
      buttonText: 'Current Plan',
      benefits: [
        { icon: Clock, title: '15 Daily Tasks', desc: 'Standard daily earning limit.' },
        { icon: CheckCircle, title: 'Standard Withdrawal', desc: 'Processing within 24-48 hours.' },
        { icon: Headphones, title: 'Email Support', desc: 'Basic support via email.' },
      ]
    },
    pro: {
      title: 'Pro Membership',
      price: '₹499',
      period: '/ month',
      icon: Crown,
      color: '#fbbf24',
      bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      buttonText: 'Buy Pro Now',
      benefits: [
        { icon: Zap, title: '50 Daily Tasks', desc: 'Unlock more earning potential every day.' },
        { icon: Zap, title: 'Instant Withdrawal', desc: 'Get your money immediately, no waiting.' },
        { icon: Headphones, title: 'Live Chat Support', desc: '24/7 dedicated pro member chat.' },
      ]
    }
  };

  const currentPlan = plans[selectedPlan];

  return (
    <PageTransition>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ fontSize: '24px' }}>Membership Plans</h2>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', background: 'var(--bg-glass)', padding: '6px', borderRadius: '16px' }} className="animate-fade-up">
        <button 
          onClick={() => setSelectedPlan('free')}
          style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid', borderColor: selectedPlan === 'free' ? 'var(--border-color)' : 'transparent', background: selectedPlan === 'free' ? 'var(--bg-secondary)' : 'transparent', color: selectedPlan === 'free' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: selectedPlan === 'free' ? '0 2px 4px rgba(0,0,0,0.02)' : 'none' }}
        >
          Free
        </button>
        <button 
          onClick={() => setSelectedPlan('pro')}
          style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid', borderColor: selectedPlan === 'pro' ? 'var(--border-color)' : 'transparent', background: selectedPlan === 'pro' ? 'var(--bg-secondary)' : 'transparent', color: selectedPlan === 'pro' ? '#d97706' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: selectedPlan === 'pro' ? '0 2px 4px rgba(0,0,0,0.02)' : 'none' }}
        >
          <Crown size={18} /> Pro
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }} className="animate-fade-up" key={selectedPlan}>
          <currentPlan.icon size={64} color={currentPlan.color} style={{ filter: selectedPlan === 'pro' ? 'drop-shadow(0 0 16px rgba(251, 191, 36, 0.5))' : 'none', marginBottom: '16px' }} />
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{currentPlan.title}</h1>
          
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', marginTop: '16px' }}>
            <span style={{ fontSize: '42px', fontWeight: 'bold', color: currentPlan.color }}>{currentPlan.price}</span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{currentPlan.period}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px', animationDelay: '0.1s' }} className="animate-fade-up" key={selectedPlan + 'benefits'}>
          {currentPlan.benefits.map((benefit, idx) => (
            <div key={idx} className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
              <div style={{ background: selectedPlan === 'pro' ? 'rgba(251, 191, 36, 0.1)' : 'var(--bg-glass-hover)', padding: '10px', borderRadius: '12px' }}>
                <benefit.icon size={24} color={currentPlan.color} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>{benefit.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', textAlign: 'center', animationDelay: '0.2s' }} className="animate-fade-up" key={selectedPlan + 'btn'}>
          <button 
            className={selectedPlan === 'pro' ? "" : "btn-secondary"}
            style={selectedPlan === 'pro' ? { 
              background: currentPlan.bg,
              color: 'white',
              border: 'none',
              padding: '16px 24px',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
            } : { opacity: 0.7, cursor: 'not-allowed' }}
            disabled={selectedPlan === 'free'}
          >
            {currentPlan.buttonText} {selectedPlan === 'pro' && <Crown size={20} fill="currentColor" />}
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default ProFeatures;
