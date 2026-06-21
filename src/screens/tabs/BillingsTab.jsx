import { useState, useEffect, useRef } from 'react';

/* ─── Inline keyframes injected once ─────────────────────────────────────── */
const STYLE = `
@keyframes shimmerBtn  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes pulseRing   { 0%,100%{box-shadow:0 0 0 0 rgba(127,86,217,0.5)} 50%{box-shadow:0 0 0 12px rgba(127,86,217,0)} }
@keyframes floatA      { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(8deg)} }
@keyframes floatB      { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-10px) rotate(-6deg)} }
@keyframes floatC      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
@keyframes blink       { 0%,100%{opacity:1} 50%{opacity:0.3} }
@keyframes countUp     { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes gradAnim    { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes badgeBounce { 0%,100%{transform:scale(1)} 30%{transform:scale(1.12)} 60%{transform:scale(0.95)} }
@keyframes tickerScroll{ 0%{transform:translateX(100%)} 100%{transform:translateX(-100%)} }
@keyframes crownSpin   { 0%{transform:rotate(-10deg) scale(1)} 50%{transform:rotate(10deg) scale(1.15)} 100%{transform:rotate(-10deg) scale(1)} }
`;

const FEATURES = [
  { icon: '📋', label: 'PDF Tasks / Day', free: '15 tasks', pro: '50 tasks', hi: true },
  { icon: '💰', label: 'Max Daily Earning', free: '₹1,500', pro: '₹5,000', hi: true },
  { icon: '📅', label: 'Monthly Max', free: '₹45,000', pro: '₹1,50,000', hi: false },
  { icon: '⚡', label: 'Payout Speed', free: '48 hours', pro: '24 hours', hi: false },
  { icon: '🎯', label: 'Task Priority', free: 'Standard', pro: 'Priority', hi: false },
  { icon: '🏷️', label: 'Task Types', free: 'Basic', pro: 'All types', hi: false },
  { icon: '🎁', label: 'Bonus Tasks', free: '—', pro: '✓', hi: false },
  { icon: '🏦', label: 'Support', free: 'Community', pro: 'Dedicated', hi: false },
];

const PERKS = [
  { icon: '🚀', title: '3× More Tasks', desc: '50 tasks/day vs 15 on Free — earn 3× more every day' },
  { icon: '⚡', title: 'Instant Payouts', desc: 'Get your money in 24 hrs, not 48. Every rupee, faster.' },
  { icon: '🎯', title: 'Best Tasks First', desc: 'Priority queue — you see high-paying tasks before others' },
  { icon: '🎁', title: 'Bonus Rewards', desc: 'Exclusive bonus tasks with premium rewards up to ₹500 each' },
];

const TESTIMONIALS = [
  '🟢 Rahul upgraded to Pro · just now',
  '🟢 Priya earned ₹4,800 today · Pro',
  '🟢 Arjun joined Pro · 2 min ago',
  '🟢 Sneha unlocked 50 tasks · Pro',
  '🟢 Vikram earned ₹5,000 · Pro',
];

/* ─── Shimmer Button ─────────────────────────────────────────────────────── */
const ShimmerButton = ({ onClick, children, style = {} }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%', padding: '15px', borderRadius: 14, border: 'none',
      background: 'linear-gradient(90deg,#7F56D9 0%,#FF6B6B 40%,#a78bfa 60%,#7F56D9 100%)',
      backgroundSize: '200% auto',
      animation: 'shimmerBtn 2.5s linear infinite, pulseRing 2s ease-in-out infinite',
      color: 'white', fontWeight: 800, fontSize: 15,
      fontFamily: 'var(--font-sans)', cursor: 'pointer',
      letterSpacing: '0.3px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      ...style,
    }}
  >
    {children}
  </button>
);

/* ─── Countdown Timer ────────────────────────────────────────────────────── */
const Countdown = () => {
  const [secs, setSecs] = useState(14 * 60 + 37); // 14:37
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s > 0 ? s - 1 : 899), 1000);
    return () => clearInterval(t);
  }, []);
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 100, padding: '5px 12px' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'blink 1s ease-in-out infinite' }} />
      <span style={{ fontSize: 12, fontWeight: 800, color: '#ef4444', fontFamily: 'var(--font-display)' }}>
        Offer ends in {m}:{s}
      </span>
    </div>
  );
};

/* ─── Live Counter ───────────────────────────────────────────────────────── */
const LiveCounter = () => {
  const [count, setCount] = useState(1284);
  useEffect(() => {
    const t = setInterval(() => setCount(c => c + Math.floor(Math.random() * 2)), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 10 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'blink 1.5s ease-in-out infinite' }} />
      <span><strong style={{ color: '#4ade80', fontFamily: 'var(--font-display)' }}>{count.toLocaleString()}</strong> users on Pro right now</span>
    </div>
  );
};

/* ─── Ticker ─────────────────────────────────────────────────────────────── */
const Ticker = () => {
  const [idx, setIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setIdx(i => (i + 1) % TESTIMONIALS.length), 2800); return () => clearInterval(t); }, []);
  return (
    <div style={{ overflow: 'hidden', background: 'rgba(0,195,126,0.08)', borderRadius: 100, padding: '6px 14px', marginBottom: 12, border: '1px solid var(--green-border)' }}>
      <div key={idx} style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, animation: 'countUp 0.4s ease forwards', whiteSpace: 'nowrap' }}>
        {TESTIMONIALS[idx]}
      </div>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────────────────────── */
const BillingsTab = ({ isPro, onUpgrade, onDowngrade, onNavigateToPayment }) => {
  const [activePlan, setActivePlan] = useState('pro');
  const [showConfirm, setShowConfirm] = useState(false);
  const [highlighted, setHighlighted] = useState(false);
  const [showRefundInfo, setShowRefundInfo] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountPct, setDiscountPct] = useState(null);   // null | number
  const [selectedRole, setSelectedRole] = useState(null); // null | 'student' | 'housewife'

  const basePrice = 499;
  const discountedPrice = discountPct ? Math.round(basePrice - (basePrice * discountPct) / 100) : basePrice;
  const isViewingPro = activePlan === 'pro';

  return (
    <>
      {/* ── DISCOUNT POPUP ── */}
      {showDiscount && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            padding: '0 24px',
          }}
          onClick={() => setShowDiscount(false)}
        >
          <div
            style={{
              background: 'linear-gradient(160deg,#0f1220 0%,#1a2040 100%)',
              borderRadius: 24, padding: '28px 22px 24px',
              width: '100%', maxWidth: 380,
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 20, fontWeight: 900, color: 'white', fontFamily: 'var(--font-display)', textAlign: 'center', marginBottom: 6 }}>Special Discount 🎉</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>
              Students &amp; Housewives get an exclusive 1–5% off on Premium!
            </p>

            {/* Role selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                { id: 'student', icon: '🎓', label: 'Student', pct: 5, sub: '5% OFF' },
                { id: 'housewife', icon: '🏠', label: 'Housewife', pct: 3, sub: '3% OFF' },
              ].map(role => (
                <button
                  key={role.id}
                  onClick={() => { setSelectedRole(role.id); setDiscountPct(role.pct); }}
                  style={{
                    padding: '16px 10px', borderRadius: 16, border: `2px solid ${selectedRole === role.id ? '#a78bfa' : 'rgba(255,255,255,0.1)'}`,
                    background: selectedRole === role.id ? 'rgba(127,86,217,0.2)' : 'rgba(255,255,255,0.04)',
                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  }}
                >
                  <span style={{ fontSize: 32 }}>{role.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)' }}>{role.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, background: 'linear-gradient(135deg,#a78bfa,#7F56D9)', color: 'white', padding: '2px 10px', borderRadius: 100 }}>{role.sub}</span>
                </button>
              ))}
            </div>

            {/* Discounted price preview */}
            {selectedRole && (
              <div style={{ background: 'rgba(127,86,217,0.12)', border: '1px solid rgba(127,86,217,0.3)', borderRadius: 14, padding: '14px 16px', marginBottom: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 4 }}>Your price after discount</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', fontFamily: 'var(--font-display)', fontWeight: 700 }}>₹{basePrice}</span>
                  <span style={{ fontSize: 32, fontWeight: 900, color: '#a78bfa', fontFamily: 'var(--font-display)' }}>₹{discountedPrice}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, background: 'linear-gradient(135deg,#ef4444,#f97316)', color: 'white', padding: '2px 9px', borderRadius: 100 }}>{discountPct}% OFF</span>
                </div>
              </div>
            )}

            {/* Apply button */}
            <button
              disabled={!selectedRole}
              onClick={() => setShowDiscount(false)}
              style={{
                width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 15,
                background: selectedRole ? 'linear-gradient(135deg,#7F56D9,#a78bfa)' : '#2a2a3a',
                color: selectedRole ? 'white' : 'rgba(255,255,255,0.3)',
                cursor: selectedRole ? 'pointer' : 'not-allowed',
                boxShadow: selectedRole ? '0 8px 24px rgba(127,86,217,0.35)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {selectedRole ? `Apply ${discountPct}% Discount →` : 'Select your role above'}
            </button>

            <button onClick={() => setShowDiscount(false)} style={{ display: 'block', margin: '12px auto 0', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── REFUND INFO POPUP ── */}
      {showRefundInfo && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            padding: '0 24px',
          }}
          onClick={() => setShowRefundInfo(false)}
        >
          <div
            style={{
              background: 'linear-gradient(160deg,#0f1220 0%,#1e2461 100%)',
              borderRadius: 20, padding: '28px 24px 20px',
              width: '100%', maxWidth: 400,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Price breakdown */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'white', fontFamily: 'var(--font-display)', marginBottom: 14 }}>₹499</div>
              {[
                { label: 'Security', val: '₹352.12' },
                { label: 'Service charge 10%', val: '₹35.21' },
                { label: 'GST 18%', val: '₹11.67' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{row.label}</span>
                  <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>→ {row.val}</span>
                </div>
              ))}
            </div>

            {/* Refund highlight badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(0,195,126,0.12)', border: '1px solid rgba(0,195,126,0.3)',
              borderRadius: 12, padding: '10px 14px', marginBottom: 14,
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>💰</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#4ade80', lineHeight: 1.5 }}>
                Security deposit amount is <span style={{ textDecoration: 'underline' }}>refundable</span> after your first withdrawal.
              </span>
            </div>

            {/* Info text */}
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 22 }}>
              Security amount is collected as a refundable security deposit and is adjusted as part of payout as per Refund Policy. Refund and payout are subject to platform policies and user compliance.
            </p>

            {/* OK button */}
            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => setShowRefundInfo(false)}
                style={{
                  background: 'transparent', border: 'none', color: 'white',
                  fontSize: 18, fontWeight: 900, cursor: 'pointer',
                  fontFamily: 'var(--font-display)', letterSpacing: '1px',
                }}
              >OK</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ paddingBottom: 32 }}>
        <style>{STYLE}</style>

        {/* ── HERO ── */}
        <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg,#0D0D1A 0%,#1A1040 50%,#0D1F3C 100%)', padding: '28px 20px 96px' }}>
          {/* Floating particles */}
          {[
            { emoji: '👑', top: 12, left: 16, anim: 'floatC 3s ease-in-out infinite', fontSize: 26 },
            { emoji: '💰', top: 20, right: 20, anim: 'floatA 4s ease-in-out infinite 0.5s', fontSize: 22 },
            { emoji: '✨', top: 55, left: 30, anim: 'floatB 3.5s ease-in-out infinite 0.3s', fontSize: 18 },
            { emoji: '💎', top: 65, right: 35, anim: 'floatC 4.5s ease-in-out infinite 1s', fontSize: 16 },
            { emoji: '🚀', top: 40, right: 10, anim: 'floatA 5s ease-in-out infinite 0.8s', fontSize: 20 },
          ].map((p, i) => (
            <div key={i} style={{ position: 'absolute', top: `${p.top}%`, left: p.left ? p.left : undefined, right: p.right ? p.right : undefined, fontSize: p.fontSize, animation: p.anim, opacity: 0.55, pointerEvents: 'none' }}>
              {p.emoji}
            </div>
          ))}

          {/* Glow orbs */}
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(127,86,217,0.4) 0%,transparent 70%)', top: -60, right: -40 }} />
          <div style={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,195,126,0.3) 0%,transparent 70%)', bottom: -40, left: -20 }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 100, padding: '6px 14px', marginBottom: 14, backdropFilter: 'blur(10px)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: isPro ? '#4ade80' : '#94a3b8', display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{isPro ? 'Pro Plan · Active' : 'Free Plan · Active'}</span>
            </div>

            <h2 style={{ fontSize: 26, fontWeight: 900, color: 'white', fontFamily: 'var(--font-display)', marginBottom: 6, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              Unlock Your<br />
              <span style={{ background: 'linear-gradient(90deg,#4ade80,#38bdf8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', backgroundSize: '200%', animation: 'gradAnim 3s ease infinite' }}>
                Earning Potential
              </span>
            </h2>

            <LiveCounter />
          </div>
        </div>

        {/* ── FLOATING TOGGLE CARD ── */}
        <div style={{ padding: '0 16px', marginTop: -68, position: 'relative', zIndex: 10 }}>
          <div style={{
            background: 'white', borderRadius: 24, overflow: 'hidden',
            boxShadow: isViewingPro ? '0 16px 48px rgba(127,86,217,0.25), 0 4px 16px rgba(15,18,32,0.15)' : '0 16px 48px rgba(15,18,32,0.18)',
            border: isViewingPro ? '1.5px solid rgba(127,86,217,0.3)' : '1px solid var(--border-color)',
            transition: 'all 0.35s ease',
          }}>
            {/* PLAN TOGGLE */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#f0f2f8', margin: 16, borderRadius: 14, padding: 4 }}>
              {['free', 'pro'].map(plan => (
                <button key={plan} onClick={() => setActivePlan(plan)} style={{
                  padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, transition: 'all 0.25s ease',
                  background: activePlan === plan ? (plan === 'pro' ? 'linear-gradient(135deg,#7F56D9,#FF6B6B)' : 'white') : 'transparent',
                  color: activePlan === plan ? (plan === 'pro' ? 'white' : 'var(--text-primary)') : 'var(--text-secondary)',
                  boxShadow: activePlan === plan ? (plan === 'pro' ? '0 4px 16px rgba(127,86,217,0.35)' : '0 2px 8px rgba(15,18,32,0.1)') : 'none',
                  animation: highlighted && plan === activePlan ? 'badgeBounce 0.6s ease' : 'none',
                }}>
                  {plan === 'free' ? '🆓 Free' : '👑 Pro'}
                </button>
              ))}
            </div>

            <div style={{ padding: '4px 20px 20px' }}>
              {/* Countdown — only for Pro */}
              {isViewingPro && (
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <Countdown />
                </div>
              )}

              {/* Price */}
              <div style={{ textAlign: 'center', padding: '12px 0 18px', borderBottom: '1px solid var(--border-color)', marginBottom: 16 }}>
                {isViewingPro && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 18, color: 'var(--text-muted)', textDecoration: 'line-through', fontFamily: 'var(--font-display)', fontWeight: 700 }}>₹2,000</span>
                    <span style={{ fontSize: 11, fontWeight: 800, background: 'linear-gradient(135deg,#ef4444,#f97316)', color: 'white', padding: '2px 10px', borderRadius: 100, animation: 'badgeBounce 1.5s ease infinite' }}>80% OFF</span>
                  </div>
                )}
                <div style={{ fontSize: 50, fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '-2px', color: isViewingPro ? '#7F56D9' : 'var(--text-primary)', lineHeight: 1, transition: 'all 0.3s' }}>
                  {isViewingPro ? (
                    discountPct
                      ? <>
                        <span style={{ fontSize: 22, textDecoration: 'line-through', color: 'rgba(127,86,217,0.4)', letterSpacing: '-1px' }}>₹{basePrice}</span>
                        {' '}₹{discountedPrice}
                      </>
                      : '₹499'
                  ) : 'FREE'}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f0fdf4', border: '1px solid var(--green-border)', borderRadius: 100, padding: '3px 12px', marginTop: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--green)' }}>
                    🕊️ {isViewingPro ? 'One-time · Lifetime access' : 'Free Forever · No charges'}
                  </span>
                </div>
                <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 8, background: isViewingPro ? 'rgba(127,86,217,0.08)' : 'var(--green-light)', borderRadius: 100, padding: '6px 16px', border: `1px solid ${isViewingPro ? 'rgba(127,86,217,0.2)' : 'var(--green-border)'}` }}>
                  <span style={{ fontSize: 14 }}>{isViewingPro ? '🚀' : '📋'}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isViewingPro ? '#7F56D9' : 'var(--green)' }}>
                    {isViewingPro ? '50 tasks/day · Up to ₹5,000 daily' : '15 tasks/day · Up to ₹1,500 daily'}
                  </span>
                </div>
              </div>

              {/* Student / Housewife discount button */}
              {isViewingPro && !isPro && (
                <button
                  onClick={() => setShowDiscount(true)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', marginTop: 12, padding: '10px 16px',
                    background: 'linear-gradient(135deg, rgba(127,86,217,0.08), rgba(167,139,250,0.08))',
                    border: '1.5px dashed rgba(127,86,217,0.4)',
                    borderRadius: 100, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: 15 }}>🎓</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#7F56D9', fontFamily: 'var(--font-sans)' }}>
                    Student / Housewife? Get {discountPct ? discountPct + '% OFF Applied ✔' : '1–5% OFF'}
                  </span>
                </button>
              )}

              {/* Key stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                {(isViewingPro ? [
                  { icon: '📋', val: '50', label: 'Tasks/day' },
                  { icon: '💰', val: '₹5,000', label: 'Daily max' },
                  { icon: '⚡', val: '24 hrs', label: 'Payout' },
                  { icon: '🎯', val: 'Priority', label: 'Access' },
                ] : [
                  { icon: '📋', val: '15', label: 'Tasks/day' },
                  { icon: '💰', val: '₹1,500', label: 'Daily max' },
                  { icon: '⚡', val: '48 hrs', label: 'Payout' },
                  { icon: '🎯', val: 'Standard', label: 'Access' },
                ]).map((s, i) => (
                  <div key={i} style={{ background: '#f8f9fc', borderRadius: 14, padding: '12px 10px', display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${isViewingPro ? 'rgba(127,86,217,0.12)' : 'var(--border-color)'}`, transition: 'all 0.3s' }}>
                    <div style={{ fontSize: 22 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: isViewingPro ? '#7F56D9' : 'var(--text-primary)', fontFamily: 'var(--font-display)', animation: 'countUp 0.4s ease forwards' }}>{s.val}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {isViewingPro ? (
                isPro
                  ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(127,86,217,0.08)', border: '1.5px solid rgba(127,86,217,0.2)', borderRadius: 14, padding: '14px' }}>
                    <span style={{ fontSize: 18 }}>✅</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#7F56D9' }}>You're on Pro — All features active!</span>
                  </div>
                  : <>
                    <ShimmerButton onClick={async () => {
                      const success = await onUpgrade();
                      if (!success && onNavigateToPayment) {
                        onNavigateToPayment();
                      }
                    }}>
                      👑 Upgrade to Pro — ₹499 Lifetime
                    </ShimmerButton>
                    {/* Refundable Button */}
                    <button
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 8, width: '100%', marginTop: 10, padding: '11px 16px',
                        background: 'white', border: '1.5px solid #fce7f3',
                        borderRadius: 100, cursor: 'pointer', transition: 'all 0.2s',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#fff0f7'}
                      onMouseOut={e => e.currentTarget.style.background = 'white'}
                      onClick={() => setShowRefundInfo(true)}
                    >
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#e11d48', fontFamily: 'var(--font-sans)' }}>(Refundable)</span>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 20, height: 20, borderRadius: '50%', background: '#f1f5f9',
                        border: '1px solid #e2e8f0', flexShrink: 0,
                      }}
                        onClick={e => { e.stopPropagation(); setShowRefundInfo(true); }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4" />
                          <path d="M12 8h.01" />
                        </svg>
                      </span>
                    </button>
                  </>
              ) : (
                isPro
                  ? <button onClick={() => setShowConfirm(true)}
                    style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'transparent', border: '1.5px solid var(--border-color)', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                    Downgrade to Free Plan
                  </button>
                  : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--green-light)', border: '1.5px solid var(--green-border)', borderRadius: 14, padding: '14px' }}>
                    <span style={{ fontSize: 18 }}>✅</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>You're on Free — No cost</span>
                  </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 16px 0' }}>

          {/* ── SOCIAL PROOF TICKER ── */}
          <Ticker />

          {/* ── COMPARISON TABLE ── */}
          <h3 style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 12, color: 'var(--text-primary)' }}>
            Plan Comparison
          </h3>
          <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)', marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', background: 'linear-gradient(135deg,#0f1220,#1e2040)', padding: '12px 16px' }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Feature</div>
              <div style={{ width: 72, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>Free</div>
              <div style={{ width: 72, textAlign: 'center', fontSize: 12, color: '#a78bfa', fontWeight: 800 }}>👑 Pro</div>
            </div>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', padding: '13px 16px', borderTop: '1px solid var(--border-color)', background: i % 2 === 0 ? 'white' : '#fafbfd', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{f.icon}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{f.label}</span>
                </div>
                <div style={{ width: 72, textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{f.free}</div>
                <div style={{ width: 72, textAlign: 'center', fontSize: 12, fontWeight: 800, color: f.hi ? '#7F56D9' : 'var(--green)' }}>{f.pro}</div>
              </div>
            ))}
          </div>

          {/* ── WHY PRO PERKS ── */}
          {!isPro && (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 12 }}>Why Upgrade to Pro? 👑</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {PERKS.map((p, i) => (
                  <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 0.06}s`, background: 'white', borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'flex-start', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg,rgba(127,86,217,0.12),rgba(255,107,107,0.08))', border: '1px solid rgba(127,86,217,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      {p.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3, fontFamily: 'var(--font-display)' }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── DARK UPGRADE BANNER ── */}
          {!isPro && (
            <div style={{ background: 'linear-gradient(135deg,#1a0533,#2d1b69,#0d2a4a)', borderRadius: 24, padding: '26px 20px', position: 'relative', overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ position: 'absolute', top: -30, right: -20, width: 130, height: 130, borderRadius: '50%', background: 'rgba(127,86,217,0.3)' }} />
              <div style={{ position: 'absolute', bottom: -20, left: 10, width: 90, height: 90, borderRadius: '50%', background: 'rgba(0,195,126,0.2)' }} />
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 40, animation: 'crownSpin 3s ease-in-out infinite', display: 'inline-block', marginBottom: 10 }}>👑</div>
                <div style={{ color: 'white', fontWeight: 900, fontSize: 18, fontFamily: 'var(--font-display)', marginBottom: 4, letterSpacing: '-0.3px' }}>One-time. Lifetime. ₹499.</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.7, marginBottom: 16 }}>Pay once, earn every day forever — no recurring charges.</div>
                <ShimmerButton onClick={async () => {
                  setActivePlan('pro');
                  const success = await onUpgrade();
                  if (!success && onNavigateToPayment) {
                    onNavigateToPayment();
                  }
                }}>
                  👑 Get Pro Lifetime — ₹499
                </ShimmerButton>
                <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>🔒 Secure checkout · Instant activation</div>
              </div>
            </div>
          )}

          {/* ── FAQ ── */}
          <h3 style={{ fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 12 }}>Common Questions</h3>
          {[
            { q: 'Is it really a one-time payment?', a: 'Yes! Pay ₹499 once and get Pro access forever. No subscription, no renewals.' },
            { q: 'How are payments processed?', a: 'Via UPI or bank transfer. Pro members get priority payouts credited within 24 hours.' },
            { q: 'What are the extra 35 tasks?', a: 'Same great PDF editing tasks — digitization, watermarking, redaction — just 35 more each day.' },
          ].map((item, i) => (
            <div key={i} className="card" style={{ padding: '14px 16px', marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--purple)', flexShrink: 0 }}>Q</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{item.q}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.a}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── DOWNGRADE MODAL ── */}
        {showConfirm && (
          <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 30 }}>⚠️</div>
                <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8, fontFamily: 'var(--font-display)' }}>Downgrade to Free?</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                  You'll lose <strong style={{ color: '#7F56D9' }}>35 daily tasks</strong> and your max drops from <strong style={{ color: '#7F56D9' }}>₹5,000</strong> to <strong style={{ color: 'var(--green)' }}>₹1,500</strong> per day.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowConfirm(false)} className="btn-purple" style={{ flex: 1, borderRadius: 12 }}>Keep Pro 👑</button>
                  <button onClick={() => { onDowngrade(); setShowConfirm(false); }} style={{ flex: 1, padding: '13px', borderRadius: 12, background: '#fee2e2', border: '1px solid #fecaca', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, color: 'var(--red)', cursor: 'pointer' }}>Downgrade</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BillingsTab;
