import { useState, useEffect } from 'react';

/* ─── Constants ──────────────────────────────────────────────────────────── */
const COMMISSION = { L1: 10, L2: 5, L3: 2 };  // % of referred user's earnings
const LEVEL_COLORS = {
  L1: { bg:'rgba(0,195,126,0.1)',   border:'rgba(0,195,126,0.3)',   text:'var(--green)', label:'Level 1' },
  L2: { bg:'rgba(67,97,238,0.1)',   border:'rgba(67,97,238,0.3)',   text:'#4361ee',      label:'Level 2' },
  L3: { bg:'rgba(127,86,217,0.1)', border:'rgba(127,86,217,0.3)',  text:'#7F56D9',      label:'Level 3' },
};

/* ─── Storage helpers ────────────────────────────────────────────────────── */
const getTeam = () => {
  try { return JSON.parse(localStorage.getItem('sw_team') || '[]'); } catch { return []; }
};
const saveTeam = (team) => localStorage.setItem('sw_team', JSON.stringify(team));

const genCode = (name) =>
  'SW' + name.replace(/\s+/g,'').toUpperCase().slice(0,4) + Math.floor(1000 + Math.random() * 9000);

/* ─── Invite Modal ───────────────────────────────────────────────────────── */
const InviteModal = ({ parentId, parentName, onClose, onAdd }) => {
  const [invName, setInvName]  = useState('');
  const [invPhone, setInvPhone] = useState('');

  const handleAdd = () => {
    if (!invName.trim()) return;
    onAdd({ name: invName.trim(), phone: invPhone.trim(), parentId });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ paddingBottom:36 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h3 style={{ fontSize:18, fontWeight:800, fontFamily:'var(--font-display)' }}>
            ➕ Add Team Member
          </h3>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:'50%', background:'#f0f2f8', border:'none', cursor:'pointer', fontWeight:800, color:'var(--text-secondary)', fontSize:14 }}>✕</button>
        </div>

        {parentName && (
          <div style={{ background:'var(--green-light)', border:'1px solid var(--green-border)', borderRadius:12, padding:'10px 14px', marginBottom:16, fontSize:12, color:'var(--green)', fontWeight:600 }}>
            👇 Joining under: <strong>{parentName}</strong>
          </div>
        )}

        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-secondary)', marginBottom:6 }}>Full Name *</label>
          <input value={invName} onChange={e => setInvName(e.target.value)} placeholder="e.g. Riya Sharma"
            style={{ width:'100%', background:'#f0f2f8', border:'1.5px solid var(--border-color)', color:'var(--text-primary)', padding:'12px 14px', borderRadius:12, fontFamily:'var(--font-sans)', fontSize:14, outline:'none' }}
            onFocus={e => { e.target.style.borderColor='var(--green)'; e.target.style.background='white'; e.target.style.boxShadow='0 0 0 3px rgba(0,195,126,0.1)'; }}
            onBlur={e  => { e.target.style.borderColor='var(--border-color)'; e.target.style.background='#f0f2f8'; e.target.style.boxShadow='none'; }}
          />
        </div>

        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:700, color:'var(--text-secondary)', marginBottom:6 }}>Mobile (optional)</label>
          <input value={invPhone} onChange={e => setInvPhone(e.target.value)} placeholder="10-digit number" type="tel"
            style={{ width:'100%', background:'#f0f2f8', border:'1.5px solid var(--border-color)', color:'var(--text-primary)', padding:'12px 14px', borderRadius:12, fontFamily:'var(--font-sans)', fontSize:14, outline:'none' }}
            onFocus={e => { e.target.style.borderColor='var(--green)'; e.target.style.background='white'; e.target.style.boxShadow='0 0 0 3px rgba(0,195,126,0.1)'; }}
            onBlur={e  => { e.target.style.borderColor='var(--border-color)'; e.target.style.background='#f0f2f8'; e.target.style.boxShadow='none'; }}
          />
        </div>

        <button className="btn-green" style={{ width:'100%', borderRadius:12 }} onClick={handleAdd}>
          ✅ Add to My Team
        </button>
      </div>
    </div>
  );
};

/* ─── Member Node (tree card) ────────────────────────────────────────────── */
const MemberNode = ({ member, level, team, onAdd, onAddChild }) => {
  const lKey = `L${level}`;
  const style = LEVEL_COLORS[lKey] || LEVEL_COLORS.L3;
  const children = team.filter(m => m.parentId === member.id);
  const canAddChild = level < 3 && children.length < 3;

  return (
    <div style={{ marginLeft: level > 1 ? 20 : 0, marginBottom: 10 }}>
      {/* Node card */}
      <div style={{ display:'flex', alignItems:'center', gap:10, background:'white', borderRadius:14, padding:'10px 14px', border:`1.5px solid ${style.border}`, boxShadow:'var(--shadow-card)', position:'relative' }}>
        {/* Level indicator line */}
        {level > 1 && (
          <div style={{ position:'absolute', left:-20, top:'50%', width:16, height:1.5, background:style.border }} />
        )}
        <div style={{ width:36, height:36, borderRadius:12, background:style.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:800, color:style.text, flexShrink:0, fontFamily:'var(--font-display)' }}>
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{member.name}</div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
            <span style={{ fontSize:10, fontWeight:700, color:style.text, background:style.bg, padding:'2px 7px', borderRadius:100, border:`1px solid ${style.border}` }}>
              {style.label} · {COMMISSION[lKey]}% commission
            </span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600 }}>
            {children.length}/3 team
          </div>
          {canAddChild && (
            <button onClick={() => onAddChild(member.id, member.name)}
              style={{ width:28, height:28, borderRadius:'50%', background:'var(--green)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:'white', boxShadow:'var(--green-glow)', flexShrink:0 }}>
              +
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {children.length > 0 && (
        <div style={{ marginLeft:20, marginTop:6, paddingLeft:4, borderLeft:'1.5px dashed var(--border-color)' }}>
          {children.map(child => (
            <MemberNode key={child.id} member={child} level={Math.min(level+1,3)} team={team} onAdd={onAdd} onAddChild={onAddChild} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Main ReferTab ──────────────────────────────────────────────────────── */
const ReferTab = ({ userName }) => {
  const myCode = (() => {
    let c = localStorage.getItem('sw_ref_code');
    if (!c) { c = genCode(userName); localStorage.setItem('sw_ref_code', c); }
    return c;
  })();

  const [team,          setTeam]          = useState(getTeam);
  const [showInvite,    setShowInvite]    = useState(false);
  const [inviteParent,  setInviteParent]  = useState({ id: 'root', name: '' });
  const [copied,        setCopied]        = useState(false);
  const [toast,         setToast]         = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  const handleCopy = () => {
    navigator.clipboard?.writeText(`Join SkillWork using my code ${myCode} and start earning ₹5,000/day!\nhttps://skillwork.app/join?ref=${myCode}`).catch(()=>{});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('🔗 Link copied!');
  };

  const openAddRoot = () => setInviteParent({ id: 'root', name: '' });
  const openAddChild = (parentId, parentName) => setInviteParent({ id: parentId, name: parentName });

  useEffect(() => {
    if (inviteParent !== null) setShowInvite(true);
  }, [inviteParent]);

  const handleAddMember = ({ name, phone, parentId }) => {
    const newMember = {
      id:       Date.now().toString(),
      name, phone,
      parentId, // 'root' = direct referral
      joinedAt: new Date().toISOString(),
      tasks:    Math.floor(Math.random() * 15) + 1, // simulated activity
      earning:  0,
    };
    const updated = [...team, newMember];
    saveTeam(updated);
    setTeam(updated);
    showToast(`✅ ${name} added to your team!`);
  };

  // ── Computed stats ──
  const directRefs    = team.filter(m => m.parentId === 'root');
  const level2        = team.filter(m => directRefs.some(d => d.id === m.parentId));
  const level3        = team.filter(m => level2.some(d => d.id === m.parentId));
  const totalTeam     = team.length;

  // Simulated commissions (₹10 per task the referred member did, at commission %)
  const l1Earn = directRefs.reduce((s,m) => s + m.tasks * 10 * (COMMISSION.L1/100), 0);
  const l2Earn = level2.reduce((s,m) => s + m.tasks * 10 * (COMMISSION.L2/100), 0);
  const l3Earn = level3.reduce((s,m) => s + m.tasks * 10 * (COMMISSION.L3/100), 0);
  const totalReferEarn = l1Earn + l2Earn + l3Earn;

  const directGoal = 3;
  const directPct  = Math.min((directRefs.length / directGoal) * 100, 100);

  return (
    <div>

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position:'fixed', top:20, left:'50%', transform:'translateX(-50%)', background:'#1a2040', color:'white', padding:'10px 20px', borderRadius:100, fontSize:13, fontWeight:600, zIndex:999, boxShadow:'0 8px 24px rgba(0,0,0,0.3)', whiteSpace:'nowrap' }}>
          {toast}
        </div>
      )}

      {/* ── HERO ── */}
      <div style={{ background:'linear-gradient(160deg,#0f1220 0%,#1a2040 55%,#0d3320 100%)', padding:'28px 20px 52px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-30, right:-20, width:140, height:140, borderRadius:'50%', background:'rgba(0,195,126,0.15)' }} />
        <div style={{ position:'absolute', bottom:-30, left:-10, width:100, height:100, borderRadius:'50%', background:'rgba(127,86,217,0.15)' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', marginBottom:6 }}>Refer & Earn MLM</p>
          <h2 style={{ fontSize:22, fontWeight:900, color:'white', fontFamily:'var(--font-display)', marginBottom:4 }}>Build Your Team 🏆</h2>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', marginBottom:18, lineHeight:1.6 }}>
            Invite 3 people. Earn commissions from 3 levels deep.
          </p>

          {/* Total referral earnings */}
          <div style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:'14px 18px', backdropFilter:'blur(10px)' }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:600, marginBottom:4 }}>Total Team Earnings</div>
            <div style={{ fontSize:30, fontWeight:900, color:'#4ade80', fontFamily:'var(--font-display)', letterSpacing:'-1px' }}>
              ₹{totalReferEarn.toLocaleString('en-IN', { minimumFractionDigits:2, maximumFractionDigits:2 })}
            </div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:4 }}>
              from {totalTeam} team member{totalTeam !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding:'0 16px', marginTop:-24 }}>

        {/* ── REFERRAL CODE CARD ── */}
        <div className="card animate-fade-up" style={{ padding:18, marginBottom:14 }}>
          <p style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:10 }}>Your Referral Code</p>
          <div style={{ display:'flex', alignItems:'center', gap:10, background:'#f8f9fc', borderRadius:14, padding:'14px 16px', border:'1.5px dashed var(--border-color)' }}>
            <span style={{ flex:1, fontSize:22, fontWeight:900, color:'var(--green)', fontFamily:'var(--font-display)', letterSpacing:'2px' }}>{myCode}</span>
            <button onClick={handleCopy} style={{ background: copied ? 'var(--green)' : 'var(--green-light)', border:`1px solid ${copied ? 'var(--green)' : 'var(--green-border)'}`, borderRadius:10, padding:'8px 14px', cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight:700, fontSize:12, color: copied ? 'white' : 'var(--green)', transition:'all 0.2s' }}>
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
          <button onClick={handleCopy} className="btn-green" style={{ width:'100%', borderRadius:12, marginTop:12 }}>
            🔗 Share Invite Link
          </button>
        </div>

        {/* ── INVITE 3 PROGRESS ── */}
        <div className="card animate-fade-up" style={{ padding:18, marginBottom:14, animationDelay:'0.06s' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div>
              <h3 style={{ fontSize:14, fontWeight:700, fontFamily:'var(--font-display)' }}>Direct Team Goal</h3>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Invite 3 people directly to unlock full MLM earnings</p>
            </div>
            <div style={{ fontSize:16, fontWeight:900, fontFamily:'var(--font-display)', color: directRefs.length >= 3 ? 'var(--green)' : 'var(--text-secondary)' }}>
              {directRefs.length}/{directGoal}
            </div>
          </div>

          {/* 3 circles */}
          <div style={{ display:'flex', gap:12, marginBottom:14, justifyContent:'center' }}>
            {Array.from({ length: directGoal }, (_, i) => {
              const member = directRefs[i];
              return (
                <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                  <div
                    onClick={!member ? () => { setInviteParent({ id:'root', name:'' }); setShowInvite(true); } : undefined}
                    style={{ width:60, height:60, borderRadius:18, background: member ? 'var(--grad-green)' : '#f0f2f8', border: `2px solid ${member ? 'var(--green)' : 'var(--border-color)'}`, display:'flex', alignItems:'center', justifyContent:'center', cursor: member ? 'default' : 'pointer', transition:'all 0.2s', fontSize: member ? 22 : 28, boxShadow: member ? 'var(--green-glow)' : 'none', fontWeight:800, color: member ? 'white' : 'var(--text-muted)', fontFamily:'var(--font-display)' }}
                  >
                    {member ? member.name.charAt(0).toUpperCase() : '+'}
                  </div>
                  <span style={{ fontSize:11, fontWeight:600, color: member ? 'var(--green)' : 'var(--text-muted)' }}>
                    {member ? member.name.split(' ')[0] : 'Invite'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width:`${Math.max(directPct,2)}%` }} />
          </div>
          <p style={{ fontSize:11, color: directRefs.length >= 3 ? 'var(--green)' : 'var(--text-muted)', textAlign:'center', marginTop:8, fontWeight:600 }}>
            {directRefs.length >= 3 ? '🎉 Goal reached! Keep growing your team' : `${directGoal - directRefs.length} more to reach your goal`}
          </p>
        </div>

        {/* ── COMMISSION LEVELS ── */}
        <div className="card animate-fade-up" style={{ padding:18, marginBottom:14, animationDelay:'0.1s' }}>
          <h3 style={{ fontSize:14, fontWeight:700, fontFamily:'var(--font-display)', marginBottom:14 }}>Commission Structure</h3>
          {[
            { level:'Level 1',  pct:COMMISSION.L1, count:directRefs.length, earn:l1Earn, color:'var(--green)',   bg:'var(--green-light)',          desc:'Your direct invites'         },
            { level:'Level 2',  pct:COMMISSION.L2, count:level2.length,     earn:l2Earn, color:'#4361ee',       bg:'rgba(67,97,238,0.08)',         desc:"Your invites' invites"       },
            { level:'Level 3',  pct:COMMISSION.L3, count:level3.length,     earn:l3Earn, color:'#7F56D9',       bg:'rgba(127,86,217,0.08)',        desc:'3rd tier of your network'    },
          ].map((l, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px', borderRadius:14, background:l.bg, marginBottom: i<2 ? 10 : 0, border:`1px solid ${l.color}22` }}>
              <div style={{ width:44, height:44, borderRadius:14, background:l.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 4px 12px ${l.color}44` }}>
                <span style={{ fontSize:14, fontWeight:900, color:'white', fontFamily:'var(--font-display)' }}>{l.pct}%</span>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>{l.level}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:1 }}>{l.desc} · {l.count} member{l.count!==1?'s':''}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:14, fontWeight:800, color:l.color, fontFamily:'var(--font-display)' }}>₹{l.earn.toFixed(0)}</div>
                <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>earned</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── TEAM TREE ── */}
        <div className="card animate-fade-up" style={{ padding:18, marginBottom:14, animationDelay:'0.14s' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div>
              <h3 style={{ fontSize:14, fontWeight:700, fontFamily:'var(--font-display)' }}>My Team Tree 🌳</h3>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{totalTeam} member{totalTeam!==1?'s':''} · 3 levels deep</p>
            </div>
            <button onClick={() => { setInviteParent({ id:'root', name:'' }); setShowInvite(true); }}
              className="btn-green" style={{ padding:'7px 14px', borderRadius:100, fontSize:12 }}>
              + Add
            </button>
          </div>

          {directRefs.length === 0 ? (
            <div style={{ textAlign:'center', padding:'28px 0' }}>
              <div style={{ fontSize:44, marginBottom:10 }}>🌱</div>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:6 }}>Start growing your team</div>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16, lineHeight:1.6 }}>
                Add 3 direct members to start earning<br />commissions from their work
              </div>
              <button onClick={() => { setInviteParent({ id:'root', name:'' }); setShowInvite(true); }} className="btn-green" style={{ padding:'10px 24px', borderRadius:100 }}>
                + Invite First Member
              </button>
            </div>
          ) : (
            <div>
              {directRefs.map(member => (
                <MemberNode key={member.id} member={member} level={1} team={team}
                  onAdd={() => { setInviteParent({ id:'root', name:'' }); setShowInvite(true); }}
                  onAddChild={(id, name) => { setInviteParent({ id, name }); setShowInvite(true); }}
                />
              ))}
              {/* Add direct slot if < 3 */}
              {directRefs.length < 3 && (
                <div onClick={() => { setInviteParent({ id:'root', name:'' }); setShowInvite(true); }}
                  style={{ display:'flex', alignItems:'center', gap:10, background:'#f8f9fc', borderRadius:14, padding:'10px 14px', border:'1.5px dashed var(--border-color)', cursor:'pointer', marginTop:6, transition:'all 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor='var(--green)'}
                  onMouseOut={e => e.currentTarget.style.borderColor='var(--border-color)'}
                >
                  <div style={{ width:36, height:36, borderRadius:12, background:'var(--green-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, color:'var(--green)' }}>+</div>
                  <span style={{ fontSize:13, color:'var(--text-muted)', fontWeight:600 }}>Tap to invite another member</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── HOW MLM WORKS ── */}
        <div className="card animate-fade-up" style={{ padding:18, marginBottom:24, animationDelay:'0.18s' }}>
          <h3 style={{ fontSize:14, fontWeight:700, fontFamily:'var(--font-display)', marginBottom:14 }}>How Team Income Works</h3>
          {[
            { icon:'👥', title:'You invite 3 people',                  desc:'They join SkillWork and start completing tasks',     color:'var(--green-light)',        accent:'var(--green)'  },
            { icon:'💼', title:'They earn from tasks',                 desc:'Each of your 3 members earns from PDF editing work', color:'rgba(67,97,238,0.08)',       accent:'#4361ee'       },
            { icon:'💰', title:'You get 10% of their earnings',        desc:'Level 1 earns you 10% commission automatically',     color:'rgba(245,158,11,0.08)',      accent:'#f59e0b'       },
            { icon:'🌳', title:'Your 3 invite 3 more (Level 2)',       desc:'You get 5% from Level 2 members\' task earnings',    color:'rgba(127,86,217,0.08)',      accent:'#7F56D9'       },
            { icon:'🚀', title:'Level 3 adds 2% more',                 desc:'3rd tier gives you 2%  — passive income grows!',     color:'var(--purple-light)',        accent:'#7F56D9'       },
          ].map((s, i) => (
            <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom: i<4?14:0, position:'relative' }}>
              {i < 4 && <div style={{ position:'absolute', left:17, top:38, width:1.5, height:16, background:'var(--border-color)' }} />}
              <div style={{ width:36, height:36, borderRadius:12, background:s.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>{s.title}</div>
                <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2, lineHeight:1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── INVITE MODAL ── */}
      {showInvite && (
        <InviteModal
          parentId={inviteParent.id}
          parentName={inviteParent.name}
          onClose={() => setShowInvite(false)}
          onAdd={handleAddMember}
        />
      )}
    </div>
  );
};

export default ReferTab;
