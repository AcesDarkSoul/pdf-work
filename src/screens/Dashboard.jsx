import { useNavigate } from 'react-router-dom';
import { Crown, FileText, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const Dashboard = () => {
  const navigate = useNavigate();
  // Mock data representing free user limits and tasks
  const tasks = Array.from({ length: 15 }).map((_, i) => ({ id: i + 1, status: i === 0 ? 'active' : 'pending' }));

  return (
    <PageTransition>
      {/* Header Profile Area */}
      <div className="flex-between animate-fade-up" style={{ marginBottom: '24px', animationDelay: '0.05s' }}>
        <div>
          <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <FileText size={24} color="var(--accent-primary)" />
             PDF Editor Studio
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontWeight: '500', marginTop: '4px' }}>Welcome back, Rohit!</p>
        </div>
        <div 
          className="glass-panel flex-center" 
          style={{ padding: '8px 16px', borderRadius: '100px', cursor: 'pointer', border: '1px solid var(--accent-primary)' }}
          onClick={() => navigate('/progress')}
        >
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>₹0</span>
        </div>
      </div>

      {/* Workspace Alerts */}
      <div 
        className="glass-panel animate-fade-up" 
        style={{ background: 'var(--bg-secondary)', padding: '16px 20px', marginBottom: '24px', cursor: 'pointer', animationDelay: '0.1s', display: 'flex', alignItems: 'center', gap: '12px' }}
        onClick={() => navigate('/pro')}
      >
        <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '10px', borderRadius: '10px' }}>
          <Crown size={20} color="var(--accent-primary)" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>Unlock Professional Tier</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>Increase daily task limits to 50 documents</p>
        </div>
        <ChevronRight color="var(--text-muted)" />
      </div>

      {/* Categories Tabs */}
      <div className="animate-fade-up" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', margin: '0 -24px', paddingLeft: '24px', paddingRight: '24px', animationDelay: '0.15s', scrollbarWidth: 'none' }}>
        <div style={{ background: 'var(--accent-gradient)', color: 'white', padding: '10px 20px', borderRadius: '100px', fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>All PDF Tasks</div>
        <div style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', padding: '10px 20px', borderRadius: '100px', fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Available (15)</div>
        <div style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', padding: '10px 20px', borderRadius: '100px', fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}><Crown size={14}/> Premium</div>
        <div style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', padding: '10px 20px', borderRadius: '100px', fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>High Paying</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, overflowY: 'auto', paddingBottom: '100px', margin: '0 -24px', padding: '0 24px 100px 24px' }}>
        {Array.from({ length: 15 }).map((_, idx) => {
          const id = idx + 1;
          const status = id === 1 ? 'active' : 'locked';
          const reward = 100 + (idx * 5); // Slight reward increase for each
          
          // Generate varied visual headers for the tasks
          const templates = [
            { title: 'Document Digitization', provider: 'DocWorks Inc.', bg: 'linear-gradient(135deg, #7F56D9 0%, #FF6B6B 100%)', header: 'Convert Scanned Files to Editable PDF' },
            { title: 'Legal Clause Watermarking', provider: 'LawFirm Pros', bg: 'linear-gradient(135deg, #027A48 0%, #12B76A 100%)', header: 'Add Confidential Watermarks to Contracts' },
            { title: 'Invoice Data Correction', provider: 'FinanceTech', bg: 'linear-gradient(135deg, #B54708 0%, #F79009 100%)', header: 'Fix Misaligned Text in Tax Invoices' },
            { title: 'Resume Formatting', provider: 'CareerBuild', bg: 'linear-gradient(135deg, #175CD3 0%, #2E90FA 100%)', header: 'Adjust Margins and Font Sizes' },
            { title: 'Medical Text Obfuscation', provider: 'HealthDoc Pro', bg: 'linear-gradient(135deg, #C11574 0%, #EE46BC 100%)', header: 'Redact sensitive patient info blocks' }
          ];
          
          const taskData = templates[idx % templates.length];

          return (
            <div 
              key={id} 
              onClick={() => navigate(status === 'active' ? `/task/${id}` : '/pro')}
              className="animate-fade-up" 
              style={{ cursor: 'pointer', background: 'var(--bg-secondary)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', animationDelay: `${0.1 + (idx * 0.05)}s`, transition: 'transform 0.2s ease, box-shadow 0.2s ease', opacity: status === 'locked' ? 0.8 : 1 }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)' }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {/* Header / Poster Area */}
              <div style={{ background: status === 'active' ? taskData.bg : '#eaebf0', padding: '24px', position: 'relative', overflow: 'hidden', height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', filter: status === 'locked' ? 'grayscale(0.5)' : 'none' }}>
                
                {/* Status Badges */}
                <div style={{ position: 'absolute', top: '16px', left: '16px', background: status === 'active' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', backdropFilter: 'blur(10px)', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', color: status === 'active' ? 'white' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={14} /> PDF Task #{id}
                </div>

                {status === 'locked' && (
                  <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'white', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <Crown size={14} fill="currentColor" /> Pro Required
                  </div>
                )}
                
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: status === 'active' ? 'white' : 'var(--text-secondary)', maxWidth: '75%', lineHeight: '1.3', position: 'relative', zIndex: 2, marginTop: '20px' }}>{taskData.header}</h2>
                
                {/* Decorative Graphic Element */}
                <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', width: '140px', height: '140px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 1 }}></div>
                <FileText size={80} color={status === 'active' ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)"} style={{ position: 'absolute', right: '10px', bottom: '10px', transform: 'rotate(-15deg)', zIndex: 1 }} />
              </div>

              <div style={{ padding: '20px' }}>
                {/* Task Vendor & Title */}
                <div className="flex-between" style={{ marginBottom: '16px', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>{taskData.title}</h3>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>by {taskData.provider}</span>
                  </div>
                </div>

                {/* Professional Task Constraints */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Fixed Budget</span>
                    <span style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: '700' }}>₹{reward}.00</span>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Est. Time</span>
                    <span style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: '700' }}>~ 15 mins</span>
                  </div>
                </div>

                {/* Action Button */}
                {status === 'active' ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/task/${id}`); }}
                    className="btn-primary"
                  >
                    Start Editing Now
                  </button>
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate('/pro'); }}
                    className="btn-secondary"
                    style={{ background: 'var(--bg-glass-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                  >
                    <Crown size={18} fill="currentColor" color="var(--warning)" /> Locked (Requires Pro)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Bottom Nav Simulation */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 24px', background: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-around', zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)' }}>
          <FileText size={24} />
          <span style={{ fontSize: '12px', fontWeight: '500' }}>Tasks</span>
        </div>
        <div 
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', cursor: 'pointer' }}
          onClick={() => navigate('/progress')}
        >
          <Clock size={24} />
          <span style={{ fontSize: '12px', fontWeight: '500' }}>Progress</span>
        </div>
        <div 
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', cursor: 'pointer' }}
          onClick={() => navigate('/pro')}
        >
          <Crown size={24} />
          <span style={{ fontSize: '12px', fontWeight: '500' }}>Pro</span>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
