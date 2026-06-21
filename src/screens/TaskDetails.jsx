import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, CheckCircle, UploadCloud, Download, Loader2, Check } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const TaskDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const reward = 100;
  
  // flow states: 'idle' | 'downloading' | 'editing' | 'uploading' | 'review' | 'claimed'
  const [taskState, setTaskState] = useState('idle');

  const handleDownload = () => {
    setTaskState('downloading');
    // simulate download delay
    setTimeout(() => {
      setTaskState('editing');
    }, 1500);
  };

  const handleUploadClick = () => {
    // In a real app we'd trigger a hidden <input type="file" />
    setTaskState('uploading');
    // simulate upload progress
    setTimeout(() => {
      setTaskState('review');
    }, 2000);
  };

  const handleClaim = () => {
    setTaskState('claimed');
    // simulate server update then route
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <PageTransition className="p-0">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        
        {/* Scrollable Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '120px' }}>
          
          {/* Header Banner */}
          <div style={{ position: 'relative', width: '100%', height: '220px', background: 'var(--accent-gradient)', borderBottomLeftRadius: '32px', borderBottomRightRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Top Bar inside Banner */}
            <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
               <button 
                onClick={() => navigate('/dashboard')} 
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none', color: 'white', cursor: 'pointer', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              >
                <ArrowLeft size={20} />
              </button>
            </div>
            
            {/* Contextual Illustration in Header based on state */}
            {taskState === 'idle' || taskState === 'downloading' ? (
              <div style={{ textAlign: 'center' }}>
                 <Download size={64} color="rgba(255,255,255,0.9)" style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.2))', marginBottom: '16px' }} />
                 <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>Download Required</h2>
              </div>
            ) : taskState === 'editing' || taskState === 'uploading' ? (
              <div style={{ textAlign: 'center' }}>
                 <UploadCloud size={64} color="rgba(255,255,255,0.9)" style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.2))', marginBottom: '16px' }} />
                 <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>Awaiting Upload</h2>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                 <CheckCircle size={64} color="rgba(255,255,255,0.9)" style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.2))', marginBottom: '16px' }} />
                 <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>Task Completed!</h2>
              </div>
            )}
            
            {/* Background Decor */}
            <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', width: '150px', height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 1 }}></div>
          </div>

          <div style={{ padding: '24px' }}>
            {/* Main App Title */}
            <h2 className="animate-fade-up" style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>
              PDF Editing Task #{id || '1'}
            </h2>
            <p className="animate-fade-up" style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px', animationDelay: '0.05s' }}>
              Follow instructions strictly to guarantee approval.
            </p>

            {/* Editing Instructions (Hidden once successfully uploaded) */}
            {taskState !== 'review' && taskState !== 'claimed' && (
              <div className="glass-panel animate-fade-up" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', animationDelay: '0.1s', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(127, 86, 217, 0.1)', padding: '10px', borderRadius: '12px' }}>
                      <FileText size={24} color="var(--accent-primary)" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Task Instructions</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>4 required steps</p>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(247, 144, 9, 0.1)', color: 'var(--warning)', padding: '6px 16px', borderRadius: '100px', fontWeight: '800', fontSize: '14px' }}>
                    <Crown size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    ₹{reward}
                  </div>
                </div>
                
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', border: '1px solid var(--border-color)', flexShrink: 0 }}>1</div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>Download the raw PDF resource file below.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', border: '1px solid var(--border-color)', flexShrink: 0 }}>2</div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>Read the specific editing instruction note attached on page 1 of the PDF.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', border: '1px solid var(--border-color)', flexShrink: 0 }}>3</div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>Perform the edits exactly as requested and export.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', border: '1px solid var(--border-color)', flexShrink: 0 }}>4</div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>Upload the final result using the dropzone below to await QA review.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Zone (Visible only after Download) */}
            {(taskState === 'editing' || taskState === 'uploading') && (
              <div className="glass-panel animate-fade-up" style={{ padding: '32px 24px', textAlign: 'center', border: '2px dashed var(--accent-primary)', background: 'rgba(127, 86, 217, 0.03)', marginBottom: '32px' }}>
                <div style={{ background: 'rgba(127, 86, 217, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <UploadCloud size={32} color="var(--accent-primary)" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Upload Edited PDF</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Max file size 10MB. Accepted formats: .pdf</p>
                <button 
                  onClick={handleUploadClick}
                  disabled={taskState === 'uploading'}
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '12px 24px', borderRadius: '100px', color: 'var(--text-primary)', fontWeight: '600', fontSize: '15px', cursor: taskState === 'uploading' ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto', opacity: taskState === 'uploading' ? 0.7 : 1 }}
                >
                  {taskState === 'uploading' ? <><Loader2 size={18} className="animate-spin" /> Uploading...</> : 'Select File'}
                </button>
              </div>
            )}

            {/* Success Review State */}
            {(taskState === 'review' || taskState === 'claimed') && (
              <div className="glass-panel animate-fade-up" style={{ padding: '32px 24px', textAlign: 'center', background: 'rgba(3, 152, 85, 0.05)', border: '1px solid rgba(3, 152, 85, 0.2)', marginBottom: '32px' }}>
                <div style={{ background: 'var(--success)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', boxShadow: '0 8px 16px rgba(3, 152, 85, 0.2)' }}>
                  <Check size={32} color="white" />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>File Uploaded Successfully!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6' }}>
                  Your submission is currently securely stored in our system. You are now eligible to claim your completion reward for this task.
                </p>
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
               <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Terms &amp; Conditions</h3>
               <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                 By accepting and downloading this task, you agree to the subsequent terms and conditions. The edited file must maintain high resolution and follow the exact instructions provided. The reward may be revoked within 24 hours if the submission is found to be plagiarized or automated incorrectly. <span style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: '600' }}>Read full policy</span>
               </p>
            </div>
          </div>
        </div>

        {/* Dynamic Floating Action Button */}
        <div 
          style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            background: 'var(--bg-primary)', 
            padding: '16px 24px', 
            borderTop: '1px solid var(--border-color)', 
            boxShadow: '0 -10px 40px rgba(0,0,0,0.05)',
            zIndex: 100
          }}
        >
          {taskState === 'idle' && (
            <button className="btn-primary" onClick={handleDownload}>
              <Download size={20} /> Download Source PDF
            </button>
          )}

          {taskState === 'downloading' && (
            <button className="btn-primary" disabled style={{ opacity: 0.8, cursor: 'not-allowed' }}>
              <Loader2 size={20} className="animate-spin" /> Downloading Secure File...
            </button>
          )}

          {(taskState === 'editing' || taskState === 'uploading') && (
            <button className="btn-secondary" disabled style={{ opacity: 0.7, cursor: 'not-allowed', width: '100%' }}>
               Awaiting valid file upload...
            </button>
          )}

          {taskState === 'review' && (
            <button className="btn-primary" onClick={handleClaim} style={{ background: 'var(--success)', boxShadow: '0 4px 15px rgba(3, 152, 85, 0.3)' }}>
               Claim ₹{reward} Reward
            </button>
          )}

          {taskState === 'claimed' && (
            <button className="btn-primary" disabled style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', boxShadow: 'none', border: '1px solid var(--border-color)' }}>
               <Loader2 size={20} className="animate-spin" /> Processing Payout...
            </button>
          )}
        </div>

      </div>
    </PageTransition>
  );
};

export default TaskDetails;
