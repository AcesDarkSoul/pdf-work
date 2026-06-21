import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HomeTab from './tabs/HomeTab';
import TaskTab from './tabs/TaskTab';
import ReferTab from './tabs/ReferTab';
import SettingTab from './tabs/SettingTab';
import BillingsTab from './tabs/BillingsTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import WithdrawSheet from './tabs/WithdrawSheet';
import AchievementsTab from './tabs/AchievementsTab';
import AdminTab from './tabs/AdminTab';
import { useLang } from '../i18n/LangContext';
import LiveNotification from '../components/LiveNotification';
import { getUserProfile, isUserPremium, updateUserTaskCount, updateUserWalletBalance, isFirebaseConfigured, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

/* ─── Language Toggle Button ─────────────────────────────────────────────── */
const LangToggle = () => {
  const { lang, switchLang } = useLang();
  return (
    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.08)', borderRadius: 100, border: '1px solid rgba(255,255,255,0.15)', padding: 2, gap: 2 }}>
      {['en', 'hi'].map(l => (
        <button
          key={l}
          onClick={() => switchLang(l)}
          style={{
            padding: '4px 10px', borderRadius: 100, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 11,
            transition: 'all 0.2s',
            background: lang === l ? 'white' : 'transparent',
            color: lang === l ? 'var(--green)' : 'rgba(255,255,255,0.55)',
            boxShadow: lang === l ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
          }}
        >
          {l === 'en' ? 'EN' : 'हिं'}
        </button>
      ))}
    </div>
  );
};

/* ─── Inner Main (uses lang context) ────────────────────────────────────────── */
const MainInner = () => {
  const { t, lang } = useLang();
  const userName = localStorage.getItem('sw_name') || 'Aman';
  const userId = localStorage.getItem('sw_userId');
  const userPhone = localStorage.getItem('sw_phone');

  const [activeTop, setActiveTop] = useState('Dashboard');
  const [activeBottom, setActiveBottom] = useState('home');
  const [isPro, setIsPro] = useState(() => localStorage.getItem('sw_pro') === 'true');
  const [showWithdraw, setShowWithdraw] = useState(false);

  const [balance, setBalance] = useState(() =>
    parseFloat(localStorage.getItem('sw_balance') || '0')
  );
  const [completedCount, setCompletedCount] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sw_completed') || '[]').length; }
    catch { return 0; }
  });

  // Load user data from Firebase on mount and set up real-time listener
  useEffect(() => {
    if (!isFirebaseConfigured || !userPhone) return;

    const loadUserData = async () => {
      try {
        const userProfile = await getUserProfile(userPhone || userId);
        if (userProfile) {
          // Update premium status
          const premiumStatus = await isUserPremium(userId);
          setIsPro(premiumStatus);
          localStorage.setItem('sw_pro', premiumStatus ? 'true' : 'false');

          // Update balance if stored in Firebase
          if (userProfile.walletBalance !== undefined) {
            setBalance(userProfile.walletBalance);
            localStorage.setItem('sw_balance', String(userProfile.walletBalance));
          }

          // Update task count if stored in Firebase
          if (userProfile.taskCount !== undefined) {
            setCompletedCount(userProfile.taskCount);
          }
        }
      } catch (error) {
        console.error('Failed to load user data from Firebase', error);
      }
    };

    // Initial load
    loadUserData();

    // Set up real-time listener for user document changes
    const normalizedPhone = userPhone.replace(/\D/g, '');
    const userDocRef = doc(db, 'users', normalizedPhone);
    
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        
        // Update premium status if changed
        if (userData.isPremium !== undefined) {
          setIsPro(userData.isPremium);
          localStorage.setItem('sw_pro', userData.isPremium ? 'true' : 'false');
        }

        // Update balance if changed
        if (userData.walletBalance !== undefined) {
          setBalance(userData.walletBalance);
          localStorage.setItem('sw_balance', String(userData.walletBalance));
        }

        // Update task count if changed
        if (userData.taskCount !== undefined) {
          setCompletedCount(userData.taskCount);
        }
      }
    }, (error) => {
      console.error('Failed to listen to user document changes', error);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [userId, userPhone]);

  const handleTaskComplete = async (reward) => {
    const newBal = parseFloat((balance + reward).toFixed(2));
    const newCount = completedCount + 1;
    
    setBalance(newBal);
    setCompletedCount(newCount);
    
    localStorage.setItem('sw_balance', String(newBal));
    
    // Sync to Firebase
    if (isFirebaseConfigured && userPhone) {
      try {
        await updateUserWalletBalance(userPhone, newBal);
        await updateUserTaskCount(userPhone, newCount);
      } catch (error) {
        console.error('Failed to sync task completion to Firebase', error);
      }
    }
  };

  const handleStreakClaim = async (reward) => {
    const newBal = parseFloat((balance + reward).toFixed(2));
    setBalance(newBal);
    localStorage.setItem('sw_balance', String(newBal));
    
    // Sync to Firebase
    if (isFirebaseConfigured && userPhone) {
      try {
        await updateUserWalletBalance(userPhone, newBal);
      } catch (error) {
        console.error('Failed to sync streak claim to Firebase', error);
      }
    }
  };

  const handleWithdraw = async (amount) => {
    const newBal = parseFloat(Math.max(balance - amount, 0).toFixed(2));
    setBalance(newBal);
    localStorage.setItem('sw_balance', String(newBal));
    
    // Sync to Firebase
    if (isFirebaseConfigured && userPhone) {
      try {
        await updateUserWalletBalance(userPhone, newBal);
      } catch (error) {
        console.error('Failed to sync withdrawal to Firebase', error);
      }
    }
  };

  const handleUpgrade = async () => {
    const userId = localStorage.getItem('sw_userId');
    if (!userId) {
      console.error('User not logged in');
      return false;
    }

    // Import the function dynamically to avoid circular dependencies
    const { hasCompletedPremiumPayment, updateUserPremiumStatus } = await import('../firebase');
    const hasPayment = await hasCompletedPremiumPayment(userId);
    
    if (!hasPayment) {
      console.error('Cannot upgrade: No completed payment found');
      // Don't upgrade if payment is not verified
      return false;
    }

    // Only upgrade if payment is verified
    localStorage.setItem('sw_pro', 'true');
    setIsPro(true);
    
    // Sync to Firebase
    if (isFirebaseConfigured && userPhone) {
      try {
        await updateUserPremiumStatus(userPhone, true);
      } catch (error) {
        console.error('Failed to sync premium status to Firebase', error);
      }
    }
    
    return true;
  };
  const handleDowngrade = () => { 
    localStorage.removeItem('sw_pro'); 
    setIsPro(false);
    
    // Sync to Firebase
    if (isFirebaseConfigured && userPhone) {
      updateUserPremiumStatus(userPhone, false).catch(error => {
        console.error('Failed to sync premium status to Firebase', error);
      });
    }
  };

  const handleBottomTab = (key) => {
    setActiveBottom(key);
    const map = { home: 'Dashboard', task: 'Daily Task', refer: 'Dashboard', setting: 'Dashboard' };
    setActiveTop(map[key] || 'Dashboard');
    document.querySelector('.screen-body')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToPayment = () => {
    // Navigate to settings tab and open payment sheet
    setActiveBottom('setting');
    setActiveTop('Dashboard');
    // Store a flag to open payment sheet when SettingTab mounts
    localStorage.setItem('sw_open_payment', 'true');
    document.querySelector('.screen-body')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTopTab = (tab) => {
    setActiveTop(tab);
    if (tab === 'Daily Task') setActiveBottom('task');
    else setActiveBottom('home');
    document.querySelector('.screen-body')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Translated tab labels
  const TOP_TABS = [
    { key: 'Dashboard', label: t('tab_dashboard') },
    { key: 'Daily Task', label: t('tab_task') },
    { key: 'Billings', label: t('tab_billings') },
    { key: 'Analytics', label: t('tab_analytics') },
    { key: 'Achievements', label: t('tab_achievements') },
    { key: 'Admin', label: 'Admin' },
  ];
  const BOTTOM_TABS = [
    { key: 'home', label: t('nav_home'), icon: '🏠' },
    { key: 'task', label: t('nav_task'), icon: '📋' },
    { key: 'refer', label: t('nav_refer'), icon: '↗️' },
    { key: 'setting', label: t('nav_setting'), icon: '⚙️' },
  ];

  const renderContent = () => {
    if (activeBottom === 'refer') return <ReferTab userName={userName} />;
    if (activeBottom === 'setting') return <SettingTab userName={userName} isPro={isPro} onUpgrade={handleUpgrade} onDowngrade={handleDowngrade} />;

    if (activeTop === 'Daily Task') return <TaskTab userName={userName} isPro={isPro} onUpgrade={handleUpgrade} onTaskComplete={handleTaskComplete} onNavigateToPayment={handleNavigateToPayment} />;
    if (activeTop === 'Billings') return <BillingsTab isPro={isPro} onUpgrade={handleUpgrade} onDowngrade={handleDowngrade} onNavigateToPayment={handleNavigateToPayment} />;
    if (activeTop === 'Analytics') return <AnalyticsTab isPro={isPro} completedCount={completedCount} />;
    if (activeTop === 'Achievements') return <AchievementsTab isPro={isPro} />;
    if (activeTop === 'Admin') return <AdminTab />;

    return (
      <HomeTab
        userName={userName} isPro={isPro} balance={balance} completedCount={completedCount}
        onStartWork={() => { setActiveBottom('task'); setActiveTop('Daily Task'); }}
        onWithdraw={() => setShowWithdraw(true)}
        onStreakClaim={handleStreakClaim}
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}
    >
      {/* ── HEADER ── */}
      <div className="app-header">
        <div className="header-profile">
          <div className="avatar">{userName.charAt(0).toUpperCase()}</div>
          <div className="header-text">
            <h4>{t('welcome_back')}</h4>
            <span>{userName}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isPro && (
            <span style={{ fontSize: 11, background: 'linear-gradient(135deg,#7F56D9,#FF6B6B)', color: 'white', fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>
              👑 Pro
            </span>
          )}
          {/* ── LANGUAGE TOGGLE ── */}
          <LangToggle />
          <button className="notification-btn">
            <span className="bell-animate">🔔</span>
          </button>
        </div>
      </div>

      {/* ── TOP TABS ── */}
      <div className="top-tabs">
        {TOP_TABS.map(tab => (
          <button
            key={tab.key}
            className={`top-tab ${activeTop === tab.key ? 'active' : ''}`}
            onClick={() => handleTopTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── SCREEN BODY ── */}
      <div className="screen-body">
        {renderContent()}
      </div>

      {/* ── WITHDRAW SHEET ── */}
      {showWithdraw && (
        <WithdrawSheet
          balance={balance}
          onClose={() => setShowWithdraw(false)}
          onWithdraw={(amt) => { handleWithdraw(amt); setShowWithdraw(false); }}
        />
      )}

      {/* ── BOTTOM NAV ── */}
      <div className="bottom-nav">
        {BOTTOM_TABS.map(tab => (
          <button
            key={tab.key}
            className={`nav-item ${activeBottom === tab.key ? 'active' : ''}`}
            onClick={() => handleBottomTab(tab.key)}
            style={{ color: activeBottom === tab.key ? 'var(--green)' : 'var(--text-secondary)' }}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── LIVE NOTIFICATIONS ── */}
      <LiveNotification />
    </motion.div>
  );
};

/* ─── Main export ───────────────────────────────────────────────────────── */
// LangProvider is at App.jsx root — no need to wrap here again
export default MainInner;
