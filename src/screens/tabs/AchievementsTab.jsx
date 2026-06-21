import { useState, useEffect } from 'react';

/* ─── Rarity config ──────────────────────────────────────────────────────── */
const RARITY = {
  Common: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.25)', glow: 'rgba(107,114,128,0.3)' },
  Rare: { color: '#2563eb', bg: 'rgba(37,99,235,0.1)', border: 'rgba(37,99,235,0.3)', glow: 'rgba(37,99,235,0.4)' },
  Epic: { color: '#7F56D9', bg: 'rgba(127,86,217,0.1)', border: 'rgba(127,86,217,0.3)', glow: 'rgba(127,86,217,0.4)' },
  Legendary: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.4)', glow: 'rgba(245,158,11,0.5)' },
};

/* ─── Achievement definitions ────────────────────────────────────────────── */
const buildAchievements = (stats) => {
  const { tasks, balance, streak, teamSize, daysActive } = stats;
  return [
    // ── TASK MILESTONES ──
    { id: 'task1', icon: '🌱', title: 'First Step', desc: 'Complete your 1st task', rarity: 'Common', category: 'Tasks', check: tasks >= 1, progress: Math.min(tasks, 1), total: 1 },
    { id: 'task5', icon: '✋', title: 'High Five', desc: 'Complete 5 tasks', rarity: 'Common', category: 'Tasks', check: tasks >= 5, progress: Math.min(tasks, 5), total: 5 },
    { id: 'task10', icon: '🔟', title: 'Ten Strong', desc: 'Complete 10 tasks', rarity: 'Common', category: 'Tasks', check: tasks >= 10, progress: Math.min(tasks, 10), total: 10 },
    { id: 'task25', icon: '⭐', title: 'Rising Star', desc: 'Complete 25 tasks', rarity: 'Rare', category: 'Tasks', check: tasks >= 25, progress: Math.min(tasks, 25), total: 25 },
    { id: 'task50', icon: '🚀', title: 'Half Century', desc: 'Complete 50 tasks', rarity: 'Rare', category: 'Tasks', check: tasks >= 50, progress: Math.min(tasks, 50), total: 50 },
    { id: 'task100', icon: '💯', title: 'Century Club', desc: 'Complete 100 tasks', rarity: 'Epic', category: 'Tasks', check: tasks >= 100, progress: Math.min(tasks, 100), total: 100 },
    { id: 'task500', icon: '🏛️', title: 'Task Legend', desc: 'Complete 500 tasks', rarity: 'Legendary', category: 'Tasks', check: tasks >= 500, progress: Math.min(tasks, 500), total: 500 },

    // ── EARNINGS ──
    { id: 'earn100', icon: '💰', title: 'First Hundred', desc: 'Earn ₹100 in total', rarity: 'Common', category: 'Earnings', check: balance >= 100, progress: Math.min(balance, 100), total: 100 },
    { id: 'earn500', icon: '💵', title: 'High Earner', desc: 'Earn ₹500 in total', rarity: 'Common', category: 'Earnings', check: balance >= 500, progress: Math.min(balance, 500), total: 500 },
    { id: 'earn1k', icon: '🤑', title: 'Thousand Up', desc: 'Earn ₹1,000 in total', rarity: 'Rare', category: 'Earnings', check: balance >= 1000, progress: Math.min(balance, 1000), total: 1000 },
    { id: 'earn5k', icon: '💎', title: 'Diamond Earner', desc: 'Earn ₹5,000 in total', rarity: 'Epic', category: 'Earnings', check: balance >= 5000, progress: Math.min(balance, 5000), total: 5000 },
    { id: 'earn10k', icon: '👑', title: 'Income King', desc: 'Earn ₹10,000 in total', rarity: 'Legendary', category: 'Earnings', check: balance >= 10000, progress: Math.min(balance, 10000), total: 10000 },

    // ── STREAK ──
    { id: 'streak3', icon: '🔥', title: 'On Fire', desc: 'Maintain a 3-day streak', rarity: 'Common', category: 'Streak', check: streak >= 3, progress: Math.min(streak, 3), total: 3 },
    { id: 'streak7', icon: '🗓️', title: 'Week Warrior', desc: 'Maintain a 7-day streak', rarity: 'Rare', category: 'Streak', check: streak >= 7, progress: Math.min(streak, 7), total: 7 },
    { id: 'streak15', icon: '⚡', title: 'Unstoppable', desc: 'Maintain a 15-day streak', rarity: 'Epic', category: 'Streak', check: streak >= 15, progress: Math.min(streak, 15), total: 15 },
    { id: 'streak30', icon: '🌟', title: 'Iron Discipline', desc: 'Maintain a 30-day streak', rarity: 'Legendary', category: 'Streak', check: streak >= 30, progress: Math.min(streak, 30), total: 30 },

    // ── TEAM / REFERRALS ──
    { id: 'refer1', icon: '🤝', title: 'Team Player', desc: 'Add 1 person to your team', rarity: 'Common', category: 'Team', check: teamSize >= 1, progress: Math.min(teamSize, 1), total: 1 },
    { id: 'refer3', icon: '👫', title: 'Triple Force', desc: 'Add 3 direct team members', rarity: 'Rare', category: 'Team', check: teamSize >= 3, progress: Math.min(teamSize, 3), total: 3 },
    { id: 'refer10', icon: '🏆', title: 'Team Leader', desc: 'Build a team of 10', rarity: 'Epic', category: 'Team', check: teamSize >= 10, progress: Math.min(teamSize, 10), total: 10 },

    // ── LOYALTY ──
    { id: 'day1', icon: '📅', title: 'Welcome!', desc: 'Active on day 1', rarity: 'Common', category: 'Loyalty', check: daysActive >= 1, progress: Math.min(daysActive, 1), total: 1 },
    { id: 'day7', icon: '🗝️', title: 'Week One', desc: 'Active for 7 days', rarity: 'Rare', category: 'Loyalty', check: daysActive >= 7, progress: Math.min(daysActive, 7), total: 7 },
    { id: 'day30', icon: '🎖️', title: 'Monthly Veteran', desc: 'Active for 30 days', rarity: 'Legendary', category: 'Loyalty', check: daysActive >= 30, progress: Math.min(daysActive, 30), total: 30 },
  ];
};

const CATEGORIES = ['All', 'Tasks', 'Earnings', 'Streak', 'Team', 'Loyalty'];

/* ─── Badge Card ─────────────────────────────────────────────────────────── */
const BadgeCard = ({ badge, isNew }) => {
  const r = RARITY[badge.rarity];
  const pct = badge.total > 0 ? (badge.progress / badge.total) * 100 : 0;

  return (
    <div style={{
      borderRadius: 18, padding: 16, border: `1.5px solid ${badge.check ? r.border : 'var(--border-color)'}`,
      background: badge.check ? r.bg : '#f8f9fc',
      opacity: badge.check ? 1 : 0.7,
      position: 'relative', overflow: 'hidden',
      boxShadow: badge.check ? `0 4px 20px ${r.glow}` : 'none',
      transition: 'all 0.3s',
    }}>
      {/* NEW ribbon */}
      {isNew && badge.check && (
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'var(--green)', color: 'white', fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 100, letterSpacing: '0.5px' }}>NEW</div>
      )}

      {/* Rarity label */}
      <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 9, fontWeight: 800, color: badge.check ? r.color : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{badge.rarity}</div>

      {/* Icon */}
      <div style={{ textAlign: 'center', marginTop: 16, marginBottom: 8 }}>
        <div style={{ fontSize: 38, filter: badge.check ? 'none' : 'grayscale(1) opacity(0.4)' }}>{badge.icon}</div>
      </div>

      {/* Title */}
      <div style={{ fontSize: 13, fontWeight: 800, color: badge.check ? 'var(--text-primary)' : 'var(--text-muted)', textAlign: 'center', marginBottom: 4, fontFamily: 'var(--font-display)' }}>{badge.title}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4, marginBottom: 10 }}>{badge.desc}</div>

      {/* Progress */}
      {!badge.check && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700 }}>Progress</span>
            <span style={{ fontSize: 9, color: r.color, fontWeight: 800 }}>{badge.progress}/{badge.total}</span>
          </div>
          <div style={{ height: 4, background: '#e5e7eb', borderRadius: 100 }}>
            <div style={{ height: 4, borderRadius: 100, background: r.color, width: `${Math.max(pct, 2)}%`, transition: 'width 0.5s' }} />
          </div>
        </div>
      )}

      {/* Unlocked */}
      {badge.check && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: r.bg, border: `1px solid ${r.border}`, borderRadius: 100, padding: '4px 10px' }}>
            <span style={{ fontSize: 10 }}>✓</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: r.color }}>Unlocked</span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main AchievementsTab ───────────────────────────────────────────────── */
const AchievementsTab = ({ isPro }) => {
  // ── Real stats from localStorage ──
  const completed = (() => { try { return JSON.parse(localStorage.getItem('sw_completed') || '[]'); } catch { return []; } })();
  const balance = parseFloat(localStorage.getItem('sw_balance') || '0');
  const team = (() => { try { return JSON.parse(localStorage.getItem('sw_team') || '[]'); } catch { return []; } })();

  // Streak calc
  const today = new Date();
  const fmtDate = d => d.toISOString().slice(0, 10);
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    if (completed.some(t => t.date === fmtDate(d))) streak++; else break;
  }

  // Days active (from first task date)
  let daysActive = 1;
  if (completed.length) {
    const earliest = completed.reduce((min, t) => t.date < min ? t.date : min, completed[0].date);
    daysActive = Math.max(1, Math.floor((Date.now() - new Date(earliest).getTime()) / 86400000) + 1);
  }

  const stats = { tasks: completed.length, balance, streak, teamSize: team.length, daysActive };
  const achievements = buildAchievements(stats);

  // Track previously-seen unlocked IDs to show NEW ribbon
  const [seenIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sw_seen_ach') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    const newlyUnlocked = achievements.filter(a => a.check).map(a => a.id);
    localStorage.setItem('sw_seen_ach', JSON.stringify(newlyUnlocked));
  }, []);

  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? achievements : achievements.filter(a => a.category === filter);

  const unlocked = achievements.filter(a => a.check).length;
  const total = achievements.length;
  const pct = Math.round((unlocked / total) * 100);

  // Category counts
  const catCount = (cat) => {
    const list = cat === 'All' ? achievements : achievements.filter(a => a.category === cat);
    return { done: list.filter(a => a.check).length, total: list.length };
  };

  return (
    <div>
      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(160deg,#0f1220 0%,#1a2040 55%,#2a1a4a 100%)', padding: '28px 20px 52px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(245,158,11,0.15)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(127,86,217,0.2)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Your Progress</p>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', fontFamily: 'var(--font-display)', marginBottom: 18 }}>🏆 Achievements</h2>

          {/* Overall progress ring simulation */}
          <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', border: '3px solid rgba(245,158,11,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#fbbf24', fontFamily: 'var(--font-display)' }}>{pct}%</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'white', marginBottom: 4, fontFamily: 'var(--font-display)' }}>
                  {unlocked} / {total} Unlocked
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 100, marginBottom: 6 }}>
                  <div style={{ height: 6, borderRadius: 100, background: 'linear-gradient(90deg,#f59e0b,#fbbf24)', width: `${pct}%`, transition: 'width 1s' }} />
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{total - unlocked} badges remaining</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: -24 }}>

        {/* ── STATS ROW ── */}
        <div className="card animate-fade-up" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
            {[
              { label: 'Tasks', val: stats.tasks, color: '#7F56D9' },
              { label: 'Streak', val: `${streak}d`, color: '#ef4444' },
              { label: 'Earned', val: `₹${Math.floor(balance)}`, color: 'var(--green)' },
              { label: 'Team', val: team.length, color: '#2563eb' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '13px 8px', textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: s.color, fontFamily: 'var(--font-display)' }}>{s.val}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CATEGORY FILTER ── */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 14, scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => {
            const { done, total: t } = catCount(cat);
            const active = filter === cat;
            return (
              <button key={cat} onClick={() => setFilter(cat)}
                style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 100, border: `1.5px solid ${active ? 'var(--green)' : 'var(--border-color)'}`, background: active ? 'var(--green)' : 'white', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12, color: active ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5 }}>
                {cat}
                <span style={{ background: active ? 'rgba(255,255,255,0.25)' : '#f0f2f8', borderRadius: 100, padding: '1px 6px', fontSize: 10, fontWeight: 800, color: active ? 'white' : 'var(--text-muted)' }}>{done}/{t}</span>
              </button>
            );
          })}
        </div>

        {/* ── RARITY LEGEND ── */}
        <div className="card animate-fade-up" style={{ padding: '12px 16px', marginBottom: 14, animationDelay: '0.05s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginRight: 4 }}>Rarity:</span>
            {Object.entries(RARITY).map(([name, r]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: r.color }}>{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── BADGES GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {filtered.map(badge => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isNew={badge.check && !seenIds.includes(badge.id)}
            />
          ))}
        </div>

        {/* ── MOTIVATIONAL FOOTER ── */}
        {unlocked < total && (
          <div className="card animate-fade-up" style={{ padding: 18, marginBottom: 24, textAlign: 'center', animationDelay: '0.2s' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🎯</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
              Keep Going!
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              You've unlocked <strong style={{ color: 'var(--green)' }}>{unlocked}</strong> of {total} badges.<br />
              Complete more tasks, build your streak, and grow your team to unlock them all!
            </div>
          </div>
        )}

        {unlocked === total && (
          <div className="card" style={{ padding: 20, marginBottom: 24, textAlign: 'center', background: 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(127,86,217,0.08))', border: '1.5px solid rgba(245,158,11,0.3)' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🏆</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#f59e0b', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
              All Achieved!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Legendary status unlocked. You are a SkillWork Master! 🌟
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsTab;
