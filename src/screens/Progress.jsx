import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Wallet, TrendingUp } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const Progress = () => {
  const navigate = useNavigate();

  // Mock Progress Data
  const stats = [
    { label: 'Completed', value: '0', icon: CheckCircle, color: 'var(--success)' },
    { label: 'Pending', value: '15', icon: Clock, color: 'var(--warning)' },
    { label: 'Today Earnt', value: '₹0', icon: TrendingUp, color: 'var(--accent-primary)' },
  ];

  return (
    <PageTransition>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ fontSize: '24px' }}>Your Progress</h2>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Total Wallet Balance */}
        <div className="glass-panel animate-fade-up" style={{ textAlign: 'center', background: 'var(--accent-gradient)', padding: '40px 20px', borderRadius: '24px' }}>
          <Wallet size={40} color="white" style={{ marginBottom: '16px', opacity: 0.8 }} />
          <h3 style={{ fontSize: '16px', opacity: 0.9, fontWeight: '500' }}>Total Available Balance</h3>
          <h1 style={{ fontSize: '56px', fontWeight: '800', marginTop: '8px' }}>₹0</h1>
          
          <button 
            style={{ 
              background: 'white', 
              color: 'var(--accent-primary)', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '100px', 
              fontWeight: 'bold', 
              marginTop: '24px',
              cursor: 'pointer'
            }}
          >
            Withdraw Funds
          </button>
        </div>

        {/* Daily Stats Grid */}
        <h3 className="animate-fade-up" style={{ fontSize: '20px', marginTop: '8px', animationDelay: '0.1s' }}>Daily Overview</h3>
        
        <div 
          className="animate-fade-up"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '16px',
            animationDelay: '0.2s'
          }}
        >
          {stats.map((stat, idx) => (
             <div 
               key={idx} 
               className="glass-panel" 
               style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  gridColumn: stat.label === 'Today Earnt' ? 'span 2' : 'span 1'
               }}
             >
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <stat.icon size={20} color={stat.color} />
                 <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>{stat.label}</span>
               </div>
               <div style={{ fontSize: stat.label === 'Today Earnt' ? '32px' : '24px', fontWeight: 'bold' }}>
                 {stat.value}
               </div>
             </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default Progress;
