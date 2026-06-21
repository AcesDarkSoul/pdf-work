import { useState } from 'react';

const QUICK_AMOUNTS = [100, 200, 500, 1000];
const MIN_WITHDRAW = 500;

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const fmt = (n) => parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ─── Withdraw History from localStorage ────────────────────────────────────── */
const getHistory = () => {
  try { return JSON.parse(localStorage.getItem('sw_withdrawals') || '[]'); }
  catch { return []; }
};

const saveWithdrawal = (entry) => {
  const prev = getHistory();
  prev.unshift(entry);
  localStorage.setItem('sw_withdrawals', JSON.stringify(prev));
};

/* ════════════════════════════════════════════════════════════════════════════ */
const WithdrawSheet = ({ balance = 0, onClose, onWithdraw }) => {
  const upi = localStorage.getItem('sw_upi') || '';
  const bankName = localStorage.getItem('sw_bank') || '';
  const accNo = localStorage.getItem('sw_acc') || '';
  const completedCount = (() => {
    try { return JSON.parse(localStorage.getItem('sw_completed') || '[]').length; }
    catch { return 0; }
  })();

  const hasPayment = !!(upi || accNo);
  const isPro = localStorage.getItem('sw_pro') === 'true';

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(upi ? 'upi' : 'bank');
  const [phase, setPhase] = useState('form'); // form | confirm | processing | success | error
  const [history, setHistory] = useState(getHistory);

  const numAmt = parseFloat(amount) || 0;

  // ── Validation ──
  const inputErrors = [];
  if (!hasPayment) inputErrors.push('⚠️ No payment method saved. Go to Settings → Bank/UPI first.');
  else if (amount !== '' && numAmt < MIN_WITHDRAW) inputErrors.push(`⚠️ Minimum withdrawal is ₹${MIN_WITHDRAW}.`);
  else if (numAmt > balance) inputErrors.push('⚠️ Amount exceeds your available balance.');

  const canSubmit = inputErrors.length === 0 && numAmt >= MIN_WITHDRAW && numAmt <= balance;

  const handleSubmit = () => {
    if (!canSubmit) return;

    if (!isPro) {
      setPhase('premium_modal');
      return;
    }
    if (completedCount < 35) {
      setPhase('task_modal');
      return;
    }

    setPhase('processing');
    setTimeout(() => {
      const entry = {
        id: Date.now(),
        amount: numAmt,
        method: method === 'upi' ? `UPI · ${upi}` : `Bank · ${bankName} ****${accNo.slice(-4)}`,
        status: 'pending',
        date: new Date().toISOString(),
      };
      saveWithdrawal(entry);
      setHistory(getHistory());
      onWithdraw(numAmt);   // deduct from balance in Main.jsx
      setPhase('success');
    }, 2200);
  };

  /* ── PHASE: TASK MODAL ──────────────────────────── */
  if (phase === 'task_modal') return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: 0, background: 'linear-gradient(160deg, #1A1040 0%, #0D0D1A 100%)', border: '1px solid rgba(56,189,248,0.3)', overflow: 'hidden' }}>
        <div style={{ padding: '32px 20px 24px', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)' }}></div>
          <h2 style={{ fontSize: 40, marginBottom: 12 }}>📋</h2>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#38bdf8', fontFamily: 'var(--font-display)', marginBottom: 8, position: 'relative', zIndex: 1 }}>Complete More Tasks</h2>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 20, lineHeight: 1.5, position: 'relative', zIndex: 1 }}>
            You need to complete at least <strong>35 tasks</strong> to make your first withdrawal.
          </p>

          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '16px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 24, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Progress</span>
              <span style={{ fontSize: 13, color: '#38bdf8', fontWeight: 800 }}>{completedCount} / 35</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #38bdf8, #818cf8)', width: `${Math.min((completedCount / 35) * 100, 100)}%`, borderRadius: 100 }} />
            </div>
          </div>

          <button
            style={{ width: '100%', padding: '15px', borderRadius: 14, background: 'linear-gradient(135deg, #38bdf8, #2563eb)', color: 'white', fontSize: 15, fontWeight: 900, fontFamily: 'var(--font-sans)', border: 'none', boxShadow: '0 8px 24px rgba(56,189,248,0.3)', cursor: 'pointer', position: 'relative', zIndex: 1 }}
            onClick={onClose}
          >
            Start Working
          </button>

          <button onClick={() => setPhase('form')} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', marginTop: 16, fontSize: 13, fontWeight: 600, cursor: 'pointer', position: 'relative', zIndex: 1, textDecoration: 'underline' }}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );

  /* ── PHASE: PREMIUM MODAL ───────────────────────── */
  if (phase === 'premium_modal') return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: 0, background: 'linear-gradient(160deg, #1A1040 0%, #0D0D1A 100%)', border: '1px solid rgba(127,86,217,0.3)', overflow: 'hidden' }}>
        <div style={{ padding: '32px 20px 24px', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)' }}></div>
          <div style={{ position: 'absolute', bottom: -50, left: -50, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(127,86,217,0.3) 0%, transparent 70%)' }}></div>

          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#f59e0b', fontFamily: 'var(--font-display)', marginBottom: 8, position: 'relative', zIndex: 1 }}>SkillWork</h2>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 20, lineHeight: 1.5, position: 'relative', zIndex: 1, padding: '0 10px' }}>
            पैसे निकालने के लिए नीचे दी गयी जानकारी पूरी पढ़ें !
          </p>

          <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '16px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 20, position: 'relative', zIndex: 1 }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 1.6, fontWeight: 500 }}>
              <li style={{ marginBottom: 10, display: 'flex', gap: 10 }}><span style={{ color: '#f59e0b', fontSize: 16 }}>•</span> <span style={{ paddingTop: 2 }}>केवल <strong>Premium</strong> सदस्य ही पैसे निकाल सकते हैं।</span></li>
              <li style={{ marginBottom: 10, display: 'flex', gap: 10 }}><span style={{ color: '#f59e0b', fontSize: 16 }}>•</span> <span style={{ paddingTop: 2 }}>Premium सदस्यता सिर्फ <strong>₹399</strong> की है।</span></li>
              <li style={{ marginBottom: 10, display: 'flex', gap: 10 }}><span style={{ color: '#f59e0b', fontSize: 16 }}>•</span> <span style={{ paddingTop: 2 }}>रोज़ 50+ टास्क मुफ्त मिलेंगे।</span></li>
              <li style={{ marginBottom: 10, display: 'flex', gap: 10 }}><span style={{ color: '#f59e0b', fontSize: 16 }}>•</span> <span style={{ paddingTop: 2 }}>त्वरित ग्राहक सहायता।</span></li>
              <li style={{ display: 'flex', gap: 10 }}><span style={{ color: '#f59e0b', fontSize: 16 }}>•</span> <span style={{ paddingTop: 2 }}><strong>BUY NOW</strong> दबाकर Premium सदस्य बनें।</span></li>
            </ul>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 100, padding: '10px 16px', marginBottom: 24, position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: 18 }}>💰</span>
            <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700 }}>अपनी पहली निकासी पर Premium राशि वापस पाएं</span>
          </div>

          <button
            style={{ width: '100%', padding: '15px', borderRadius: 14, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontSize: 15, fontWeight: 900, fontFamily: 'var(--font-sans)', border: 'none', boxShadow: '0 8px 24px rgba(245,158,11,0.3)', cursor: 'pointer', position: 'relative', zIndex: 1 }}
            onClick={onClose}
          >
            Buy Now
          </button>

          <button onClick={() => setPhase('form')} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', marginTop: 16, fontSize: 13, fontWeight: 600, cursor: 'pointer', position: 'relative', zIndex: 1, textDecoration: 'underline' }}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );

  /* ── PHASE: SUCCESS ─────────────────────────────── */
  if (phase === 'success') return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ paddingBottom: 36 }}>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--grad-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 34, boxShadow: 'var(--green-glow)' }}>✓</div>
          <h3 style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: 6 }}>Request Submitted!</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 6 }}>
            ₹{fmt(numAmt)} withdrawal is being processed.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--green-light)', borderRadius: 100, padding: '5px 14px', border: '1px solid var(--green-border)', marginBottom: 24 }}>
            <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>⚡ Credited within 24 hours</span>
          </div>
          <button className="btn-green" style={{ width: '100%', borderRadius: 14 }} onClick={onClose}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  /* ── PHASE: PROCESSING ──────────────────────────── */
  if (phase === 'processing') return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ paddingBottom: 36 }}>
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ width: 60, height: 60, border: '4px solid var(--green-light)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 20px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 6 }}>Processing…</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Please wait while we submit your request.</p>
        </div>
      </div>
    </div>
  );

  /* ── MAIN FORM ──────────────────────────────────── */
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ paddingBottom: 40, maxHeight: '92vh' }}>

        {/* Handle bar */}
        <div style={{ width: 36, height: 4, borderRadius: 100, background: '#e4e7f0', margin: '0 auto 20px' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-display)' }}>💸 Withdraw</h3>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: '#f0f2f8', border: 'none', cursor: 'pointer', fontWeight: 800, color: 'var(--text-secondary)', fontSize: 14 }}>✕</button>
        </div>

        {/* Balance display */}
        <div style={{ background: 'linear-gradient(160deg,#0f1220,#1a2040)', borderRadius: 18, padding: '18px 20px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(0,195,126,0.15)' }} />
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4, position: 'relative' }}>Available Balance</p>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#4ade80', fontFamily: 'var(--font-display)', letterSpacing: '-1px', position: 'relative' }}>
            ₹{fmt(balance)}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4, position: 'relative' }}>Min. withdrawal: ₹{MIN_WITHDRAW}</p>
        </div>

        {/* Quick pick amounts */}
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Quick Amount</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
          {QUICK_AMOUNTS.map(a => (
            <button key={a} onClick={() => setAmount(String(a))}
              style={{ padding: '10px 4px', borderRadius: 12, border: `1.5px solid ${String(amount) === String(a) ? 'var(--green)' : 'var(--border-color)'}`, background: String(amount) === String(a) ? 'var(--green-light)' : 'white', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13, color: String(amount) === String(a) ? 'var(--green)' : 'var(--text-primary)', transition: 'all 0.18s' }}>
              ₹{a}
            </button>
          ))}
        </div>

        {/* Custom amount input */}
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Enter Amount</p>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, fontWeight: 800, color: 'var(--text-secondary)' }}>₹</span>
          <input
            type="number" placeholder="0.00" value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{ width: '100%', background: '#f0f2f8', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)', padding: '13px 14px 13px 36px', borderRadius: 14, fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, outline: 'none', transition: 'all 0.2s' }}
            onFocus={e => { e.target.style.borderColor = 'var(--green)'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(0,195,126,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.background = '#f0f2f8'; e.target.style.boxShadow = 'none'; }}
          />
          {balance > 0 && (
            <button onClick={() => setAmount(String(Math.floor(balance)))}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'var(--green)', border: 'none', borderRadius: 100, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
              MAX
            </button>
          )}
        </div>

        {/* Payment method */}
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Pay To</p>
        {hasPayment ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {upi && (
              <div onClick={() => setMethod('upi')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, border: `1.5px solid ${method === 'upi' ? 'var(--green)' : 'var(--border-color)'}`, background: method === 'upi' ? 'var(--green-light)' : 'white', cursor: 'pointer', transition: 'all 0.18s' }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(0,134,201,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📲</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>UPI</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{upi}</div>
                </div>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${method === 'upi' ? 'var(--green)' : 'var(--border-color)'}`, background: method === 'upi' ? 'var(--green)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {method === 'upi' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                </div>
              </div>
            )}
            {accNo && (
              <div onClick={() => setMethod('bank')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, border: `1.5px solid ${method === 'bank' ? 'var(--green)' : 'var(--border-color)'}`, background: method === 'bank' ? 'var(--green-light)' : 'white', cursor: 'pointer', transition: 'all 0.18s' }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(2,122,72,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏦</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{bankName || 'Bank Account'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>A/C ending ****{accNo.slice(-4)}</div>
                </div>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${method === 'bank' ? 'var(--green)' : 'var(--border-color)'}`, background: method === 'bank' ? 'var(--green)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {method === 'bank' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 14, padding: '12px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>No payment method added</div>
              <div style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>Go to Settings → Bank / UPI to add one.</div>
            </div>
          </div>
        )}

        {/* Error */}
        {inputErrors.length > 0 && amount !== '' && (
          <div style={{ background: '#fee2e2', borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#991b1b', fontWeight: 600 }}>
            {inputErrors[0]}
          </div>
        )}

        {/* Info row */}
        {canSubmit && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {[
              { label: 'You get', val: `₹${fmt(numAmt)}`, color: 'var(--green)' },
              { label: 'After this', val: `₹${fmt(balance - numAmt)}`, color: '#4361ee' },
            ].map((r, i) => (
              <div key={i} style={{ background: '#f8f9fc', borderRadius: 12, padding: '10px 12px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase' }}>{r.label}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: r.color, fontFamily: 'var(--font-display)' }}>{r.val}</div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            width: '100%', padding: '15px', borderRadius: 14, border: 'none', fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 15, cursor: canSubmit ? 'pointer' : 'not-allowed', transition: 'all 0.2s', letterSpacing: '0.2px',
            background: canSubmit ? 'var(--grad-green)' : '#e5e7eb',
            color: canSubmit ? 'white' : 'var(--text-muted)',
            boxShadow: canSubmit ? 'var(--green-glow)' : 'none',
          }}
        >
          {canSubmit ? `💸 Withdraw ₹${fmt(numAmt)}` : 'Enter valid amount to continue'}
        </button>

        {/* Withdrawal history */}
        {history.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Recent Withdrawals</p>
            {history.slice(0, 4).map((h, i) => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < Math.min(history.length, 4) - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: h.status === 'pending' ? 'rgba(245,158,11,0.1)' : 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {h.status === 'pending' ? '⏳' : '✅'}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{h.method}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>₹{fmt(h.amount)}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: h.status === 'pending' ? '#f59e0b' : 'var(--green)', marginTop: 2, textTransform: 'uppercase' }}>{h.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawSheet;
