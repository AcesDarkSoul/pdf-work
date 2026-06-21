import { useState } from 'react';

// ─── Task Data ────────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    name: 'Document Digitization', emoji: '📄', category: 'Basic',
    banner: 'linear-gradient(135deg,#7F56D9 0%,#9B72EF 100%)',
    accentColor: '#7F56D9', bgLight: 'rgba(127,86,217,0.08)',
    reward: 100, avgTime: '15 mins',
    tagline: 'Convert scanned images into editable PDF format.',
    description: 'You will be given a scanned document. Type out the content into a clean, well-formatted PDF and upload it back.',
    pdfUrl: '/pdfs/task-digitization.pdf',
    steps: ['Download the scanned document PDF below','Open in Adobe Acrobat, Smallpdf, or ILovePDF','Type out the content with correct formatting','Export as PDF and upload your edited file'],
  },
  {
    name: 'Legal Watermarking', emoji: '⚖️', category: 'Legal',
    banner: 'linear-gradient(135deg,#027A48 0%,#12B76A 100%)',
    accentColor: '#027A48', bgLight: 'rgba(2,122,72,0.08)',
    reward: 150, avgTime: '10 mins',
    tagline: 'Add "Confidential" watermarks to legal contracts.',
    description: 'Download the contract PDF. Add a diagonal semi-transparent "CONFIDENTIAL" watermark on every page and re-upload.',
    pdfUrl: '/pdfs/task-watermarking.pdf',
    steps: ['Download the contract PDF below','Open in any editor that supports watermarking (Smallpdf, PDF24)','Add diagonal semi-transparent "CONFIDENTIAL" text watermark','Export and upload the watermarked PDF'],
  },
  {
    name: 'Invoice Correction', emoji: '🧾', category: 'Finance',
    banner: 'linear-gradient(135deg,#B54708 0%,#F79009 100%)',
    accentColor: '#B54708', bgLight: 'rgba(181,71,8,0.08)',
    reward: 120, avgTime: '20 mins',
    tagline: 'Fix misaligned text and data errors in tax invoices.',
    description: `Download the invoice PDF. Correct all misaligned columns, fix totals, and ensure GST details are properly spaced. Re-upload the corrected file.`,
    pdfUrl: '/pdfs/task-invoice.pdf',
    steps: ['Download the invoice PDF below','Open in a PDF editor and identify all alignment errors','Fix column widths, row heights, and totals','Export corrected PDF and upload below'],
  },
  {
    name: 'Resume Formatting', emoji: '📝', category: 'Career',
    banner: 'linear-gradient(135deg,#175CD3 0%,#2E90FA 100%)',
    accentColor: '#175CD3', bgLight: 'rgba(23,92,211,0.08)',
    reward: 130, avgTime: '25 mins',
    tagline: 'Polish layouts, margins and fonts for resumes.',
    description: `Download the resume PDF. Fix fonts to Inter/Arial 11pt, set 1-inch margins, bold section headings, and align bullet points. Re-upload.`,
    pdfUrl: '/pdfs/task-resume.pdf',
    steps: ['Download the resume PDF below','Set fonts to Inter/Arial 11pt, margins 1 inch all sides','Ensure headings are bold and bullets are aligned','Export as PDF and upload the polished version'],
  },
  {
    name: 'Medical Redaction', emoji: '🏥', category: 'Medical',
    banner: 'linear-gradient(135deg,#C11574 0%,#EE46BC 100%)',
    accentColor: '#C11574', bgLight: 'rgba(193,21,116,0.08)',
    reward: 200, avgTime: '30 mins',
    tagline: 'Redact sensitive patient info from medical reports.',
    description: `Download the medical report PDF. Black-out all personally identifiable information using solid black rectangles. Ensure no PII is visible and re-upload.`,
    pdfUrl: '/pdfs/task-medical.pdf',
    steps: ['Download the medical report PDF below','Identify all PII: name, DOB, ID numbers, address','Apply solid black redaction blocks over each PII field','Export and upload — confirm no PII visible'],
  },
  {
    name: 'Signature Page Setup', emoji: '✍️', category: 'Legal',
    banner: 'linear-gradient(135deg,#344054 0%,#667085 100%)',
    accentColor: '#344054', bgLight: 'rgba(52,64,84,0.08)',
    reward: 110, avgTime: '12 mins',
    tagline: 'Add signature placeholders to contract PDFs.',
    description: 'Download the contract PDF and add properly formatted signature blocks on the last page as per instructions. Re-upload.',
    pdfUrl: '/pdfs/task-signature.pdf',
    steps: ['Download the contract PDF below','Locate or add a signature section on the last page','Insert formatted signature placeholder blocks for both parties','Export and upload the updated PDF'],
  },
  {
    name: 'Brochure Layout Fix', emoji: '🖼️', category: 'Design',
    banner: 'linear-gradient(135deg,#D92D8A 0%,#F97066 100%)',
    accentColor: '#D92D8A', bgLight: 'rgba(217,45,138,0.08)',
    reward: 160, avgTime: '20 mins',
    tagline: 'Fix overlapping text and images in brochure PDFs.',
    description: 'Download the brochure PDF. Reposition any overlapping images and text boxes so nothing overlaps. Re-upload the corrected file.',
    pdfUrl: '/pdfs/task-brochure.pdf',
    steps: ['Download the brochure PDF below','Open in PDF editor and identify overlapping regions','Adjust element positions so nothing overlaps','Export and upload the corrected brochure'],
  },
  {
    name: 'Table Extraction', emoji: '📊', category: 'Finance',
    banner: 'linear-gradient(135deg,#0086C9 0%,#36BFFA 100%)',
    accentColor: '#0086C9', bgLight: 'rgba(0,134,201,0.08)',
    reward: 140, avgTime: '18 mins',
    tagline: 'Extract and reformat table data from scanned PDFs.',
    description: 'Download the scanned PDF containing tables. Recreate each table in a new structured PDF with proper alignment and borders.',
    pdfUrl: '/pdfs/task-table.pdf',
    steps: ['Download the scanned PDF below','Identify all tables and their data','Recreate tables with proper borders and alignment in a PDF editor','Upload the re-created structured PDF'],
  },
  {
    name: 'Certificate Generation', emoji: '🏆', category: 'Basic',
    banner: 'linear-gradient(135deg,#DC6803 0%,#FDB022 100%)',
    accentColor: '#DC6803', bgLight: 'rgba(220,104,3,0.08)',
    reward: 90, avgTime: '10 mins',
    tagline: 'Fill in names and details on certificate templates.',
    description: 'Download the certificate template PDF. Fill in the provided name and details using a PDF editor. Export and upload.',
    pdfUrl: '/pdfs/task-certificate.pdf',
    steps: ['Download the certificate template PDF below','Fill in the name and details as required','Ensure font and alignment match the template style','Export and upload the completed certificate'],
  },
  {
    name: 'Form Completion', emoji: '📋', category: 'Basic',
    banner: 'linear-gradient(135deg,#099250 0%,#3CCB7F 100%)',
    accentColor: '#099250', bgLight: 'rgba(9,146,80,0.08)',
    reward: 80, avgTime: '8 mins',
    tagline: 'Fill out standard form templates with provided data.',
    description: 'Download the blank form PDF. Fill in all fields with the sample data provided in the task description. Upload the completed form.',
    pdfUrl: '/pdfs/task-form.pdf',
    steps: ['Download the blank form PDF below','Fill every field with the exact values listed','Double-check no fields are left blank','Save and upload the completed form PDF'],
  },
];

const FREE_LIMIT = 15;
const PRO_LIMIT  = 50;

const TASKS = Array.from({ length: PRO_LIMIT }, (_, i) => {
  const t = TEMPLATES[i % TEMPLATES.length];
  const v = Math.floor(i / TEMPLATES.length) + 1;
  return { ...t, id: i + 1, likes: (i * 7 + 3) % 22 + 1, name: v > 1 ? `${t.name} (Part ${v})` : t.name, reward: t.reward + (v - 1) * 10 };
});

const CATEGORY_COLORS = {
  Basic: '#7F56D9', Legal: '#027A48', Finance: '#B54708',
  Career: '#175CD3', Medical: '#C11574', Design: '#D92D8A',
};

// ─── Upgrade Modal ────────────────────────────────────────────────────────────
const UpgradeModal = ({ onClose, onUpgrade, onNavigateToPayment }) => {
  const handleUpgradeClick = async () => {
    const success = await onUpgrade();
    if (!success) {
      // If upgrade failed (no payment), show message and navigate to payment
      onNavigateToPayment();
    } else {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ paddingBottom: 36 }}>
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          {/* Crown glow */}
          <div style={{ width: 80, height: 80, margin: '0 auto 16px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(127,86,217,0.15),rgba(255,107,107,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, border: '2px solid rgba(127,86,217,0.2)' }}>
            👑
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: 8 }}>Upgrade to Pro</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
            Unlock <strong style={{ color: '#7F56D9' }}>50 PDF tasks/day</strong> and earn up to{' '}
            <strong style={{ color: 'var(--green)' }}>₹5,000 daily</strong>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {[
              { icon: '📋', label: '50 tasks/day',     sub: 'vs 15 on Free'      },
              { icon: '💰', label: '₹5,000/day max',   sub: 'vs ₹1,500 on Free'  },
              { icon: '⚡', label: '24-hr payouts',    sub: 'vs 48 hrs on Free'   },
              { icon: '🎯', label: 'Priority tasks',   sub: 'Higher reward tasks' },
            ].map((c, i) => (
              <div key={i} style={{ background: '#f8f9fc', borderRadius: 14, padding: '14px 12px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{c.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{c.sub}</div>
              </div>
            ))}
          </div>

          <button onClick={handleUpgradeClick} className="btn-purple" style={{ marginBottom: 10 }}>
            👑 Upgrade Now — ₹399 Lifetime
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-sans)', width: '100%', padding: '8px' }}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Task Detail Modal ────────────────────────────────────────────────────────
const TaskDetailModal = ({ task, onClose, onTaskComplete }) => {
  const [phase,      setPhase]      = useState('info'); // info|downloaded|uploading|done
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileError,    setFileError]    = useState('');

  // Persist completed task to localStorage
  const saveCompletion = () => {
    const prev = JSON.parse(localStorage.getItem('sw_completed') || '[]');
    prev.push({
      id:       task.id,
      name:     task.name,
      category: task.category,
      reward:   task.reward,
      date:     new Date().toISOString().slice(0, 10),
      ts:       Date.now(),
      uploadedFile: uploadedFile ? { name: uploadedFile.name, size: uploadedFile.size } : null,
    });
    localStorage.setItem('sw_completed', JSON.stringify(prev));
    // Mark this task ID as permanently done (lock it)
    const done = JSON.parse(localStorage.getItem('sw_done_ids') || '[]');
    if (!done.includes(task.id)) done.push(task.id);
    localStorage.setItem('sw_done_ids', JSON.stringify(done));
    const bal = parseFloat(localStorage.getItem('sw_balance') || '0');
    localStorage.setItem('sw_balance', (bal + task.reward).toFixed(2));
  };

  // Real download: create link and click it
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = task.pdfUrl || '/pdfs/task-sample.pdf';
    const fileName = task.name.replace(/\s+/g, '-').toLowerCase() + '.pdf';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setPhase('downloaded');
  };

  // Real file input handler
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    setFileError('');
    setUploadedFile(null);
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setFileError('❌ Only PDF files are accepted. Please select a .pdf file.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setFileError('❌ File too large. Maximum size is 20 MB.');
      return;
    }
    setUploadedFile(file);
  };

  // Submit with real file
  const handleSubmit = () => {
    if (!uploadedFile) { setFileError('❌ Please select your edited PDF first.'); return; }
    setPhase('uploading');
    // Simulate upload (replace with real API call here)
    setTimeout(() => {
      saveCompletion();
      if (onTaskComplete) onTaskComplete(task.reward);
      setPhase('done');
    }, 2200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ paddingBottom: 36 }}>

        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: '#f0f2f8', border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--text-secondary)' }}>✕</button>
        </div>

        {/* Hero banner */}
        <div style={{ background: task.banner, borderRadius: 20, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, bottom: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', left: -20, top: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 52, marginBottom: 4 }}>{task.emoji}</div>
            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 100, padding: '3px 12px', display: 'inline-block' }}>
              <span style={{ fontSize: 11, color: 'white', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{task.category}</span>
            </div>
          </div>
          {/* Reward badge */}
          <div style={{ position: 'absolute', top: 12, right: 14, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)', borderRadius: 100, padding: '5px 14px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-display)' }}>₹{task.reward}</span>
          </div>
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, fontFamily: 'var(--font-display)' }}>{task.name}</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>{task.description}</p>

        {/* Info row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          {[
            { icon: '⏱️', label: 'Est. Time', value: `~${task.avgTime}` },
            { icon: '💰', label: 'Reward', value: `₹${task.reward}` },
            { icon: '👍', label: 'Likes', value: task.likes },
          ].map((m, i) => (
            <div key={i} style={{ flex: 1, background: '#f8f9fc', borderRadius: 12, padding: '10px 8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{m.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{m.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1, fontWeight: 600 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Steps */}
        {phase !== 'done' && (
          <div style={{ marginBottom: 18 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Steps to Complete</h4>
            {task.steps.map((step, i) => {
              const isDone = (phase === 'downloaded' && i === 0) || (phase === 'uploading' && i <= 1) || (uploadedFile && i <= 2);
              return (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: isDone ? 'var(--green)' : (i === 0 ? task.accentColor+'22' : '#f0f2f8'), color: isDone ? 'white' : (i === 0 ? task.accentColor : 'var(--text-muted)'), fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.3s', boxShadow: isDone ? 'var(--green-glow)' : 'none' }}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── PHASE: info — Download button ── */}
        {phase === 'info' && (
          <button className="btn-blue" onClick={handleDownload}>
            ⬇️&nbsp; Download PDF File
          </button>
        )}

        {/* ── PHASE: downloaded — Upload section ── */}
        {(phase === 'downloaded' || phase === 'uploading') && (
          <div>
            {phase === 'downloaded' && (
              <div style={{ background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '1px solid #fcd34d', borderRadius: 14, padding: '12px 14px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 22 }}>✅</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#78350f' }}>PDF Downloaded!</div>
                  <div style={{ fontSize: 12, color: '#92400e', marginTop: 1 }}>Edit it, then select your edited file below to upload.</div>
                </div>
              </div>
            )}

            {/* File picker */}
            {phase === 'downloaded' && (
              <div>
                <label htmlFor="pdf-upload" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: `2px dashed ${uploadedFile ? 'var(--green)' : 'var(--border-color)'}`,
                  borderRadius: 16, padding: '22px 16px', cursor: 'pointer', marginBottom: 10,
                  background: uploadedFile ? 'var(--green-light)' : '#fafbfd', transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: 34, marginBottom: 8 }}>{uploadedFile ? '✅' : '📂'}</span>
                  {uploadedFile ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', marginBottom: 3 }}>{uploadedFile.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(uploadedFile.size / 1024).toFixed(0)} KB · PDF ready to submit</div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>Select your edited PDF</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tap here to browse files · PDF only · max 20 MB</div>
                    </div>
                  )}
                </label>
                <input
                  id="pdf-upload" type="file" accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                {fileError && (
                  <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 12px', marginBottom: 10, fontSize: 12, color: '#991b1b', fontWeight: 600 }}>
                    {fileError}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!uploadedFile}
                  style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 15, cursor: uploadedFile ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                    background: uploadedFile ? 'var(--grad-green)' : '#e5e7eb',
                    color: uploadedFile ? 'white' : 'var(--text-muted)',
                    boxShadow: uploadedFile ? 'var(--green-glow)' : 'none',
                  }}
                >
                  {uploadedFile ? '⬆️  Submit Edited PDF' : 'Select a PDF file to continue'}
                </button>
              </div>
            )}

            {/* Uploading spinner */}
            {phase === 'uploading' && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: 48, height: 48, border: '4px solid var(--green-light)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 14px' }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Uploading your PDF…</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Please wait while we verify your file</div>
              </div>
            )}
          </div>
        )}

        {/* ── PHASE: done ── */}
        {phase === 'done' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg,rgba(0,195,126,0.08),rgba(0,232,150,0.04))', border: '1.5px solid var(--green-border)', borderRadius: 20, padding: '28px 20px', marginBottom: 16, textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 28, boxShadow: 'var(--green-glow)' }}>✓</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--green)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>Task Submitted! 🎉</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                📄 {uploadedFile?.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Your PDF is under QA review.<br />
                <strong style={{ color: 'var(--text-primary)' }}>₹{task.reward}</strong> will be credited within 24 hrs.
              </div>
            </div>
            <button className="btn-green" style={{ width: '100%', borderRadius: 14 }} onClick={onClose}>
              Back to Tasks 👍
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Task Card ────────────────────────────────────────────────────────────────
const TaskCard = ({ task, locked, claimed, onPress }) => (
  <div
    onClick={() => !claimed && onPress(task, locked)}
    style={{
      background: claimed ? '#f8fdf8' : 'white',
      borderRadius: 20, overflow: 'hidden',
      border: claimed ? '1.5px solid var(--green-border)' : '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-card)',
      cursor: claimed ? 'default' : 'pointer',
      marginBottom: 14, opacity: locked ? 0.72 : 1,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
    onMouseOver={e => { if (!locked && !claimed) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'; } }}
    onMouseOut={e  => { e.currentTarget.style.transform = 'translateY(0)';  e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
  >
    {/* Gradient banner */}
    <div style={{ background: (claimed || locked) ? 'linear-gradient(135deg,#d1d5db,#e5e7eb)' : task.banner, height: 88, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', right: -20, top: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
      <div style={{ position: 'absolute', left: -10, bottom: -20, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
      <span style={{ fontSize: 34, filter: (claimed || locked) ? 'grayscale(1) brightness(0.8)' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))', position: 'relative', zIndex: 1 }}>{task.emoji}</span>
      {/* Category pill */}
      <div style={{ position: 'absolute', left: 12, top: 10, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(6px)', borderRadius: 100, padding: '3px 10px', border: '1px solid rgba(255,255,255,0.15)' }}>
        <span style={{ fontSize: 10, color: 'white', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{task.category}</span>
      </div>
      {/* Status badge */}
      <div style={{ position: 'absolute', right: 12, top: 10, background: claimed ? 'rgba(0,195,126,0.85)' : 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)', borderRadius: 100, padding: '4px 12px', border: '1px solid rgba(255,255,255,0.15)' }}>
        <span style={{ fontSize: 12, color: 'white', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
          {claimed ? '✅ Claimed' : locked ? '🔒 Pro' : `₹${task.reward}`}
        </span>
      </div>
    </div>
    {/* Card body */}
    <div style={{ padding: '14px 16px' }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: (claimed || locked) ? 'var(--text-secondary)' : 'var(--text-primary)', marginBottom: 4, fontFamily: 'var(--font-display)' }}>{task.name}</div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>{task.tagline}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f8f9fc', borderRadius: 100, padding: '5px 10px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: 12 }}>⏱️</span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>~{task.avgTime}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f8f9fc', borderRadius: 100, padding: '5px 10px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: 12 }}>👍</span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{task.likes}</span>
        </div>
        <div style={{ marginLeft: 'auto', padding: '5px 14px', borderRadius: 100,
          background: claimed ? 'var(--green-light)' : locked ? 'rgba(127,86,217,0.1)' : 'var(--green-light)',
          border: `1px solid ${claimed ? 'var(--green-border)' : locked ? 'rgba(127,86,217,0.2)' : 'var(--green-border)'}`,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: claimed ? 'var(--green)' : locked ? '#7F56D9' : 'var(--green)' }}>
            {claimed ? '✔ Done' : locked ? 'Upgrade →' : 'Start →'}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// ─── Main Task Tab ────────────────────────────────────────────────────────────
const TaskTab = ({ userName, isPro, onUpgrade, onTaskComplete }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [showUpgrade,  setShowUpgrade]  = useState(false);
  const [doneIds,      setDoneIds]      = useState(() => {
    try { return JSON.parse(localStorage.getItem('sw_done_ids') || '[]'); } catch { return []; }
  });

  const handleSelectTask = (task, locked) => {
    const body = document.querySelector('.screen-body');
    if (body) body.scrollTo({ top: 0, behavior: 'smooth' });
    locked ? setShowUpgrade(true) : setSelectedTask(task);
  };

  const handleTaskDone = (reward) => {
    try { setDoneIds(JSON.parse(localStorage.getItem('sw_done_ids') || '[]')); } catch {}
    if (onTaskComplete) onTaskComplete(reward);
  };

  const handleUpgrade = () => { onUpgrade(); setShowUpgrade(false); };

  return (
    <div>
      {/* ── HERO HEADER ── */}
      <div style={{
        background: 'linear-gradient(160deg,#0f1220 0%,#1a2040 55%,#1a3260 100%)',
        padding: '28px 20px 44px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Blobs */}
        <div style={{ position:'absolute', top:-40, right:-30, width:160, height:160, borderRadius:'50%', background:'rgba(67,97,238,0.2)' }} />
        <div style={{ position:'absolute', bottom:-40, left:-20, width:120, height:120, borderRadius:'50%', background:'rgba(0,195,126,0.15)' }} />
        <div style={{ position:'absolute', top:30, right:60, width:60, height:60, borderRadius:'50%', background:'rgba(127,86,217,0.2)' }} />

        <div style={{ position:'relative', zIndex:1 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', fontFamily: 'var(--font-display)', marginBottom: 6, letterSpacing: '-0.3px' }}>
            Daily PDF Tasks
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 18, lineHeight: 1.5 }}>
            Download · Edit · Upload · Get Paid by{' '}
            <span style={{ color: '#4ade80', fontWeight: 700 }}>SkillWork</span>
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { icon: '🪙', label: '₹100+', sub: 'Per task' },
              { icon: '📋', label: isPro ? '50' : '15', sub: 'Tasks/day' },
              { icon: '⚡', label: '24hrs', sub: 'Payout' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '10px 8px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: 18, marginBottom: 2 }}>{s.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)' }}>{s.label}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: '0 16px', marginTop: -20 }}>

        {/* How to use card */}
        <div className="card animate-fade-up" style={{ padding: 18, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>How To Use</h3>
            <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, background: 'var(--green-light)', padding: '3px 10px', borderRadius: 100, border: '1px solid var(--green-border)' }}>
              {isPro ? '👑 Pro' : '🆓 Free'}
            </span>
          </div>

          {/* Step row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { n: '1', label: 'Pick Task', icon: '📋' },
              { n: '→', label: '', icon: '' },
              { n: '2', label: 'Download', icon: '⬇️' },
              { n: '→', label: '', icon: '' },
              { n: '3', label: 'Edit & Upload', icon: '⬆️' },
            ].map((s, i) => s.n === '→'
              ? <div key={i} style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: 16, paddingTop: 6 }}>›</div>
              : <div key={i} style={{ flex: 1, background: '#f8f9fc', borderRadius: 12, padding: '10px 6px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)' }}>{s.label}</div>
                </div>
            )}
          </div>

          {/* Reward + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--green-light)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--green-border)', marginBottom: 14 }}>
            <span style={{ fontSize: 24 }}>🪙</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>₹100 Per Work</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Earn up to ₹{isPro ? '5,000' : '1,500'} daily</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--green-glow)' }}
                 onClick={() => handleSelectTask(TASKS[0], false)}>
              <span style={{ fontSize: 20, color: 'white' }}>⬇️</span>
            </div>
          </div>

          <button className="btn-blue" onClick={() => handleSelectTask(TASKS[0], false)}>
            🚀 Start Working Now
          </button>
        </div>

        {/* Task list header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>PDF Editing Tasks</h3>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
              {isPro ? '50 tasks available today' : `15 free · ${PRO_LIMIT - FREE_LIMIT} locked (Pro)`}
            </p>
          </div>
          {!isPro && (
            <button onClick={() => setShowUpgrade(true)} style={{ background: 'var(--grad-purple)', border: 'none', borderRadius: 100, padding: '6px 14px', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12, color: 'white', boxShadow: 'var(--purple-glow)' }}>
              👑 Upgrade
            </button>
          )}
        </div>

        {/* Task cards */}
        {TASKS.map((task, idx) => {
          const locked = !isPro && idx >= FREE_LIMIT;
          return (
            <div key={task.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(idx, 8) * 0.05}s` }}>
              <TaskCard task={task} idx={idx} locked={locked} claimed={doneIds.includes(task.id)} onPress={handleSelectTask} />
            </div>
          );
        })}

        {/* Pro upgrade banner */}
        {!isPro && (
          <div className="animate-fade-up" style={{ background: 'linear-gradient(160deg,#0f1220 0%,#2d1b69 100%)', borderRadius: 22, padding: '24px 20px', marginBottom: 24, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(127,86,217,0.25)' }} />
            <div style={{ position: 'absolute', bottom: -20, left: -10, width: 80, height: 80, borderRadius: '50%', background: 'rgba(0,195,126,0.2)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>👑</div>
              <div style={{ color: 'white', fontWeight: 900, fontSize: 18, marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                Unlock 35 More Tasks
              </div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>
                Upgrade to Pro and earn up to <span style={{ color: '#4ade80', fontWeight: 700 }}>₹5,000/day</span>
              </div>
              <button onClick={() => setShowUpgrade(true)} style={{ background: 'linear-gradient(135deg,#00c37e,#00e896)', border: 'none', borderRadius: 100, padding: '12px 28px', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 14, color: 'white', boxShadow: 'var(--green-glow)' }}>
                Upgrade to Pro →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} onTaskComplete={handleTaskDone} />}
      {showUpgrade   && <UpgradeModal   onClose={() => setShowUpgrade(false)} onUpgrade={handleUpgrade} onNavigateToPayment={onNavigateToPayment} />}
    </div>
  );
};

export default TaskTab;
