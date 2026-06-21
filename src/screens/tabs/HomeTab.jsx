import { useState } from 'react';
import { useLang } from '../../i18n/LangContext';
const HomeTab = ({ userName, isPro, balance = 0, completedCount = 0, onStartWork, onWithdraw, onStreakClaim }) => {
  const { t } = useLang();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const [claimedStreak, setClaimedStreak] = useState(() => localStorage.getItem('sw_streak_claim_date') === todayStr);

  // ── real stats from localStorage ──
  const completed = (() => {
    try { return JSON.parse(localStorage.getItem('sw_completed') || '[]'); } catch { return []; }
  })();
  const withdrawals = (() => {
    try { return JSON.parse(localStorage.getItem('sw_withdrawals') || '[]'); } catch { return []; }
  })();

  // This week earnings (Mon–Sun of current week)
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday
  weekStart.setHours(0, 0, 0, 0);
  const weekEarn = completed
    .filter(t => new Date(t.date) >= weekStart)
    .reduce((s, t) => s + t.reward, 0);
  const weekMax = isPro ? 5000 * 7 : 1500 * 7;
  const weekPct = Math.min((weekEarn / weekMax) * 100, 100);

  // Last payout
  const lastPayout = withdrawals.length ? withdrawals[0].amount : 0;

  // Streak: consecutive days with at least 1 task
  const fmtDate = d => d.toISOString().slice(0, 10);
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    if (completed.some(t => t.date === fmtDate(d))) streak++; else break;
  }

  // Streak grid (last 21 days)
  const days = Array.from({ length: 21 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (20 - i));
    return { day: d.getDate(), completed: completed.some(t => t.date === fmtDate(d)), isToday: i === 20 };
  });

  const dailyReward = Math.min(streak * 10, 100); // Caps at 100

  const handleClaimStreak = () => {
    if (!onStreakClaim || claimedStreak || streak === 0) return;
    onStreakClaim(dailyReward);
    localStorage.setItem('sw_streak_claim_date', todayStr);
    setClaimedStreak(true);
  };

  return (
    <div style={{ padding: '16px' }}>

      {/* ── HERO BALANCE CARD ── */}
      <div
        className="animate-fade-up"
        style={{
          background: 'linear-gradient(160deg,#0f1220 0%,#1a2040 60%,#1e2a5e 100%)',
          borderRadius: 24, padding: '24px 22px', marginBottom: 16,
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(15,18,32,0.35)',
        }}
      >
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -40, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(0,195,126,0.12)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(127,86,217,0.15)' }} />
        <div style={{ position: 'absolute', top: 20, right: 20, width: 60, height: 60, borderRadius: '50%', background: 'rgba(0,195,126,0.08)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>{t('total_balance')}</p>
              <div style={{ fontSize: 38, fontWeight: 900, color: 'white', fontFamily: 'var(--font-display)', letterSpacing: '-1px', lineHeight: 1 }}>
                ₹{parseFloat(balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6, fontWeight: 500 }}>{t('inr_updated')}</p>
            </div>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(0,195,126,0.15)', border: '1px solid rgba(0,195,126,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
              💼
            </div>
          </div>

          {/* Plan badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 100, padding: '5px 12px', marginBottom: 18, border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: 11 }}>{isPro ? '👑' : '🆓'}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{isPro ? t('pro_plan') : t('free_plan')}</span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn-green"
              style={{ flex: 1, borderRadius: 12, padding: '12px' }}
              onClick={onStartWork}
            >
              {t('start_work')}
            </button>
            <button
              className="btn-outline-green"
              onClick={onWithdraw}
              style={{ flex: 1, borderRadius: 12, padding: '12px', background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              {t('withdraw')}
            </button>
          </div>
        </div>
      </div>

      {/* ── EARNINGS STATS ── */}
      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10, paddingLeft: 2 }}>
        {t('earnings')}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>

        {/* This week */}
        <div className="card animate-fade-up" style={{ padding: 16, animationDelay: '0.08s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📈</div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{t('this_week')}</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 10 }}>₹{weekEarn.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${Math.max(weekPct, 2)}%` }} /></div>
        </div>

        {/* Last withdrawal */}
        <div className="card animate-fade-up" style={{ padding: 16, animationDelay: '0.12s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💸</div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{t('last_payout')}</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>₹{lastPayout.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{lastPayout ? t('last_withdrawal_processed') : t('no_withdrawals_yet')}</div>
        </div>
      </div>

      {/* ── QUICK STATS ROW ── */}
      <div className="animate-fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16, animationDelay: '0.14s' }}>
        {[
          { icon: '✅', label: t('completed'), val: completedCount, color: 'var(--green)' },
          { icon: '⏳', label: t('pending'), val: '0', color: 'var(--orange)' },
          { icon: '🔥', label: t('streak'), val: `${streak}d`, color: '#ef4444' },
        ].map((s, i) => (
          <div key={i} className="stat-chip" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── DAILY STREAK ── */}
      <div className="card animate-fade-up" style={{ padding: 18, marginBottom: 16, animationDelay: '0.18s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{t('daily_streak')}</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{t('work_every_day')}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)', borderRadius: 100, padding: '4px 12px' }}>
              <span style={{ fontSize: 12, color: 'white', fontWeight: 700 }}>{streak} day{streak !== 1 ? 's' : ''}</span>
            </div>
            {streak > 0 && !claimedStreak && (
              <button
                onClick={handleClaimStreak}
                style={{
                  background: 'linear-gradient(135deg,#00c37e,#00e896)',
                  border: 'none', color: 'white', fontWeight: 800, fontSize: 12,
                  padding: '6px 12px', borderRadius: 100, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,195,126,0.3)',
                }}
              >
                Claim ₹{dailyReward}
              </button>
            )}
            {streak > 0 && claimedStreak && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0', color: '#166534', fontWeight: 800, fontSize: 12,
                padding: '5px 11px', borderRadius: 100,
              }}>
                Claimed!
              </div>
            )}
          </div>
        </div>
        <div className="streak-grid">
          {days.map((d, i) => (
            <div key={i} className={`streak-day ${d.completed ? 'completed' : ''} ${d.isToday ? 'today' : ''}`}>
              {d.completed ? '✓' : d.day}
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="card animate-fade-up" style={{ padding: 18, marginBottom: 20, animationDelay: '0.22s', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'var(--green-light)' }} />
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 18, position: 'relative' }}>{t('how_it_works')}</h3>
        {[
          { icon: '📲', title: t('step_pick'), desc: t('step_pick_desc'), color: 'var(--purple-light)', accent: '#7F56D9' },
          { icon: '⬇️', title: t('step_download'), desc: t('step_download_desc'), color: 'rgba(67,97,238,0.1)', accent: '#4361ee' },
          { icon: '✏️', title: t('step_edit'), desc: t('step_edit_desc'), color: 'rgba(245,158,11,0.1)', accent: '#f59e0b' },
          { icon: '💰', title: t('step_paid'), desc: t('step_paid_desc'), color: 'var(--green-light)', accent: 'var(--green)' },
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: i < 3 ? 16 : 0, position: 'relative' }}>
            {i < 3 && <div style={{ position: 'absolute', left: 16, top: 40, width: 1.5, height: 20, background: 'var(--border-color)' }} />}
            <div style={{ width: 36, height: 36, borderRadius: 12, background: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, border: `1px solid rgba(0,0,0,0.04)` }}>
              {step.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{step.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{step.desc}</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: step.accent, background: 'transparent', padding: '2px 0', flexShrink: 0 }}>
              {String(i + 1).padStart(2, '0')}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default HomeTab;
