import { useState, useMemo } from 'react';

/* ─── helpers ────────────────────────────────────────────────────────────── */
const toDate  = str => new Date(str);
const fmtDate = d => d.toISOString().slice(0, 10);
const today   = fmtDate(new Date());

const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const CAT_COLOR  = {
  Basic:'#7F56D9', Legal:'#027A48', Finance:'#B54708',
  Career:'#175CD3', Medical:'#C11574', Design:'#D92D8A',
};

/* ─── useStats: derive everything from localStorage ─────────────────────── */
function useStats() {
  const all = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('sw_completed') || '[]'); }
    catch { return []; }
  }, []);

  // ── weekly: last 7 days ──
  const weekly = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const key = fmtDate(d);
      const entries = all.filter(t => t.date === key);
      return {
        day:   DAYS_SHORT[d.getDay()],
        date:  key,
        tasks: entries.length,
        earn:  entries.reduce((s, t) => s + t.reward, 0),
        isToday: key === today,
      };
    });
  }, [all]);

  // ── monthly trend: last 5 months ──
  const monthly = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (4 - i));
      const year = d.getFullYear(), month = d.getMonth();
      const earn = all.filter(t => {
        const td = toDate(t.date);
        return td.getFullYear() === year && td.getMonth() === month;
      }).reduce((s, t) => s + t.reward, 0);
      return {
        month: d.toLocaleString('en-IN', { month: 'short' }),
        earn,
      };
    });
  }, [all]);

  // ── categories ──
  const categories = useMemo(() => {
    const map = {};
    all.forEach(t => {
      if (!map[t.category]) map[t.category] = { tasks: 0, earn: 0 };
      map[t.category].tasks += 1;
      map[t.category].earn  += t.reward;
    });
    const total = all.length || 1;
    return Object.entries(map)
      .map(([name, v]) => ({ name, ...v, pct: Math.round((v.tasks / total) * 100), color: CAT_COLOR[name] || '#6b7280' }))
      .sort((a, b) => b.earn - a.earn);
  }, [all]);

  // ── heatmap: last 28 days ──
  const heatmap = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (27 - i));
      const key = fmtDate(d);
      return all.filter(t => t.date === key).length;
    });
  }, [all]);

  // ── streak: consecutive days up to today ──
  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = fmtDate(d);
      if (all.some(t => t.date === key)) count++; else break;
    }
    return count;
  }, [all]);

  const totalEarned = all.reduce((s, t) => s + t.reward, 0);
  const totalTasks  = all.length;
  const todayTasks  = all.filter(t => t.date === today).length;
  const todayEarn   = all.filter(t => t.date === today).reduce((s, t) => s + t.reward, 0);
  const avgPerTask  = totalTasks ? Math.round(totalEarned / totalTasks) : 0;
  const bestDay     = weekly.reduce((a, b) => b.earn > a.earn ? b : a, { day: '—', earn: 0 });

  return { all, weekly, monthly, categories, heatmap, streak, totalEarned, totalTasks, todayTasks, todayEarn, avgPerTask, bestDay };
}

/* ─── Empty State ─────────────────────────────────────────────────────────── */
const EmptyState = () => (
  <div style={{ textAlign:'center', padding:'40px 24px' }}>
    <div style={{ fontSize:56, marginBottom:14 }}>📊</div>
    <h3 style={{ fontSize:18, fontWeight:800, fontFamily:'var(--font-display)', marginBottom:8 }}>No Data Yet</h3>
    <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6 }}>
      Complete your first PDF task to see your analytics appear here in real-time.
    </p>
  </div>
);

/* ─── Bar Chart ──────────────────────────────────────────────────────────── */
const BarChart = ({ data, labelKey, valueKey, color, accentIdx = -1 }) => {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:100, marginBottom:6 }}>
        {data.map((d, i) => {
          const pct = (d[valueKey] / max) * 100;
          const accent = i === accentIdx || d.isToday;
          return (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, height:'100%', justifyContent:'flex-end' }}>
              <span style={{ fontSize:8, color: accent ? 'var(--green)' : 'var(--text-muted)', fontWeight:700 }}>
                {d[valueKey] ? (d[valueKey] >= 1000 ? `${(d[valueKey]/1000).toFixed(1)}k` : d[valueKey]) : ''}
              </span>
              <div style={{
                width:'100%', borderRadius:'5px 5px 0 0',
                background: accent ? 'var(--grad-green)' : color,
                height:`${Math.max(pct, d[valueKey] ? 4 : 0)}%`,
                transition:'height 0.7s cubic-bezier(0.16,1,0.3,1)',
                boxShadow: accent ? 'var(--green-glow)' : 'none',
              }} />
            </div>
          );
        })}
      </div>
      <div style={{ display:'flex', gap:6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex:1, textAlign:'center', fontSize:9, color: d.isToday ? 'var(--green)' : 'var(--text-muted)', fontWeight:600 }}>
            {d[labelKey]}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
const AnalyticsTab = ({ isPro }) => {
  const [period, setPeriod] = useState('week');
  const { all, weekly, monthly, categories, heatmap, streak, totalEarned, totalTasks, todayTasks, todayEarn, avgPerTask, bestDay } = useStats();

  const maxHeat = Math.max(...heatmap, 1);

  return (
    <div>
      {/* ── HERO ── */}
      <div style={{ background:'linear-gradient(160deg,#0f1220 0%,#1a2040 55%,#0d3320 100%)', padding:'28px 20px 44px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-40, right:-30, width:160, height:160, borderRadius:'50%', background:'rgba(0,195,126,0.15)' }} />
        <div style={{ position:'absolute', bottom:-40, left:-20, width:120, height:120, borderRadius:'50%', background:'rgba(67,97,238,0.15)' }} />

        <div style={{ position:'relative', zIndex:1 }}>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', marginBottom:6 }}>My Analytics</p>
          <h2 style={{ fontSize:22, fontWeight:900, color:'white', fontFamily:'var(--font-display)', marginBottom:4 }}>Your Performance</h2>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', marginBottom:18 }}>
            {new Date().toLocaleDateString('en-IN',{ weekday:'long', day:'numeric', month:'long' })}
          </p>

          {/* Today snapshot */}
          <div style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:'16px 20px', backdropFilter:'blur(10px)' }}>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', fontWeight:600, marginBottom:4 }}>Today's Earnings</div>
            <div style={{ fontSize:36, fontWeight:900, color:'#4ade80', fontFamily:'var(--font-display)', letterSpacing:'-1px' }}>
              ₹{todayEarn.toLocaleString('en-IN')}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
              <span style={{ fontSize:14 }}>✅</span>
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.45)' }}>
                {todayTasks} task{todayTasks !== 1 ? 's' : ''} done today
                {totalTasks > 0 && ` · ₹${avgPerTask} avg/task`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding:'0 16px', marginTop:-22 }}>

        {totalTasks === 0 ? <EmptyState /> : (
          <>
            {/* ── QUICK STATS ── */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
              {[
                { icon:'✅', label:'Total Tasks',   value: totalTasks,               sub:'All time',       accent:'var(--green)' },
                { icon:'💰', label:'Total Earned',  value:`₹${totalEarned.toLocaleString('en-IN')}`, sub:'All time', accent:'#4361ee' },
                { icon:'🔥', label:'Streak',        value:`${streak}d`,              sub:'Consecutive days', accent:'#ef4444'    },
                { icon:'🏆', label:'Best Day',      value:`₹${bestDay.earn.toLocaleString()}`, sub: bestDay.day || '—', accent:'#f59e0b' },
              ].map((s, i) => (
                <div key={i} className="card animate-fade-up" style={{ padding:'14px 16px', animationDelay:`${i*0.06}s` }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <div style={{ width:34, height:34, borderRadius:11, background:`${s.accent}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>{s.icon}</div>
                    <span style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600 }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize:22, fontWeight:900, color:s.accent, fontFamily:'var(--font-display)', letterSpacing:'-0.5px' }}>{s.value}</div>
                  <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:3 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* ── EARNINGS CHART ── */}
            <div className="card animate-fade-up" style={{ padding:18, marginBottom:14, animationDelay:'0.2s' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div>
                  <h3 style={{ fontSize:14, fontWeight:700, fontFamily:'var(--font-display)' }}>Earnings Chart</h3>
                  <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>₹ earned per day</p>
                </div>
                <div style={{ display:'flex', background:'#f0f2f8', borderRadius:100, padding:3, gap:2 }}>
                  {['week','month'].map(p => (
                    <button key={p} onClick={() => setPeriod(p)} style={{
                      padding:'4px 11px', borderRadius:100, border:'none', cursor:'pointer',
                      fontFamily:'var(--font-sans)', fontWeight:700, fontSize:11, transition:'all 0.2s',
                      background: period===p ? 'white' : 'transparent',
                      color: period===p ? 'var(--text-primary)' : 'var(--text-muted)',
                      boxShadow: period===p ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    }}>
                      {p === 'week' ? 'Week' : 'Month'}
                    </button>
                  ))}
                </div>
              </div>
              <BarChart
                data={period === 'week' ? weekly : monthly}
                labelKey={period === 'week' ? 'day' : 'month'}
                valueKey="earn"
                color="linear-gradient(180deg,rgba(67,97,238,0.7),rgba(67,97,238,0.25))"
              />
              {(period === 'week' ? weekly : monthly).every(d => d.earn === 0) && (
                <p style={{ fontSize:12, color:'var(--text-muted)', textAlign:'center', marginTop:8 }}>Complete tasks to see your chart fill up!</p>
              )}
            </div>

            {/* ── TASKS COMPLETED THIS WEEK ── */}
            <div className="card animate-fade-up" style={{ padding:18, marginBottom:14, animationDelay:'0.24s' }}>
              <h3 style={{ fontSize:14, fontWeight:700, fontFamily:'var(--font-display)', marginBottom:4 }}>Tasks Per Day</h3>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:14 }}>Number of PDF tasks submitted daily</p>
              <BarChart
                data={weekly}
                labelKey="day"
                valueKey="tasks"
                color="linear-gradient(180deg,rgba(127,86,217,0.7),rgba(127,86,217,0.25))"
              />
            </div>

            {/* ── CATEGORY BREAKDOWN ── */}
            {categories.length > 0 && (
              <div className="card animate-fade-up" style={{ padding:18, marginBottom:14, animationDelay:'0.28s' }}>
                <h3 style={{ fontSize:14, fontWeight:700, fontFamily:'var(--font-display)', marginBottom:4 }}>Task Categories</h3>
                <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:14 }}>What type of PDF work you've done</p>

                {/* Segmented bar */}
                <div style={{ display:'flex', borderRadius:100, overflow:'hidden', height:10, marginBottom:14 }}>
                  {categories.map((c,i) => (
                    <div key={i} style={{ width:`${c.pct}%`, background:c.color, minWidth:3 }} />
                  ))}
                </div>

                {categories.map((c, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: i < categories.length-1 ? 12 : 0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:10, height:10, borderRadius:3, background:c.color }} />
                      <span style={{ fontSize:13, color:'var(--text-secondary)', fontWeight:500 }}>{c.name}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                      <span style={{ fontSize:11, color:'var(--text-muted)' }}>{c.tasks} task{c.tasks!==1?'s':''}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:c.color, minWidth:60, textAlign:'right' }}>₹{c.earn.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── 28-DAY HEATMAP ── */}
            <div className="card animate-fade-up" style={{ padding:18, marginBottom:14, animationDelay:'0.32s' }}>
              <h3 style={{ fontSize:14, fontWeight:700, fontFamily:'var(--font-display)', marginBottom:4 }}>Activity Heatmap</h3>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:14 }}>Your daily task activity — last 28 days</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:5 }}>
                {heatmap.map((val, i) => {
                  const isToday = i === 27;
                  const opacity = val === 0 ? 0 : Math.min((val / maxHeat) * 0.85 + 0.2, 1);
                  return (
                    <div key={i} style={{
                      aspectRatio:'1', borderRadius:6,
                      background: val === 0 ? '#f0f2f8' : `rgba(0,195,126,${opacity})`,
                      border: isToday ? '2px solid var(--green)' : '1px solid transparent',
                    }} />
                  );
                })}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:10, justifyContent:'flex-end' }}>
                <span style={{ fontSize:9, color:'var(--text-muted)' }}>Less</span>
                {[0.15,0.35,0.6,0.85,1].map((o,i) => (
                  <div key={i} style={{ width:10, height:10, borderRadius:3, background:`rgba(0,195,126,${o})` }} />
                ))}
                <span style={{ fontSize:9, color:'var(--text-muted)' }}>More</span>
              </div>
            </div>

            {/* ── RECENT TASKS ── */}
            <div className="card animate-fade-up" style={{ padding:18, marginBottom:24, animationDelay:'0.36s' }}>
              <h3 style={{ fontSize:14, fontWeight:700, fontFamily:'var(--font-display)', marginBottom:14 }}>Recent Completions</h3>
              {all.slice().reverse().slice(0, 6).map((t, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom: i<5?12:0, marginBottom: i<5?12:0, borderBottom: i<5?'1px solid var(--border-color)':'none' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:12, background:`${CAT_COLOR[t.category]||'#7F56D9'}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                      📄
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{t.name.length > 22 ? t.name.slice(0,22)+'…' : t.name}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:1 }}>
                        {new Date(t.ts).toLocaleDateString('en-IN',{ day:'numeric', month:'short' })} · {t.category}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize:14, fontWeight:800, color:'var(--green)', fontFamily:'var(--font-display)' }}>+₹{t.reward}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── PRO NUDGE ── */}
        {!isPro && (
          <div className="animate-fade-up" style={{ background:'linear-gradient(135deg,#0f1220,#2d1b69)', borderRadius:20, padding:'20px', marginBottom:24, textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:8 }}>📊</div>
            <div style={{ color:'white', fontWeight:800, fontSize:15, fontFamily:'var(--font-display)', marginBottom:4 }}>Unlock Full Analytics</div>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12, marginBottom:12, lineHeight:1.6 }}>
              Pro users earn 3× more and see deeper task-by-task insights.
            </div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(127,86,217,0.2)', border:'1px solid rgba(127,86,217,0.3)', borderRadius:100, padding:'5px 14px' }}>
              <span style={{ fontSize:11, color:'#a78bfa', fontWeight:700 }}>👑 Pro — ₹399 Lifetime</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsTab;
