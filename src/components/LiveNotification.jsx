import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAMES = ['Bhavna', 'Rahul', 'Priya', 'Amit', 'Neha', 'Vikas', 'Pooja', 'Anjali', 'Kunal', 'Rohan', 'Sneha', 'Deepak'];

const LiveNotification = () => {
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const triggerRandomNotification = () => {
            const name = NAMES[Math.floor(Math.random() * NAMES.length)];
            const minutes = Math.floor(Math.random() * 8) + 1; // 1 to 8 mins ago

            // Generate realistic amounts between 5000 and 8000
            const amount = Math.floor(Math.random() * 3001) + 5000;
            setNotification({ name, amount, minutes, id: Date.now() });

            // Auto dismiss after 4 seconds
            setTimeout(() => {
                setNotification(null);
            }, 4000);
        };

        // Trigger first notification after 3 seconds
        const initialTimer = setTimeout(triggerRandomNotification, 3000);

        // Then trigger periodically every 15-20 seconds
        const interval = setInterval(() => {
            triggerRandomNotification();
        }, Math.floor(Math.random() * 10000) + 15000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: '24px', // From top
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 9999,
            padding: '0 20px'
        }}>
            <AnimatePresence>
                {notification && (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: -50, scale: 0.9 }} // Drop from top
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        style={{
                            background: 'rgba(15, 18, 32, 0.85)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)', // for safari
                            borderRadius: '24px',
                            padding: '12px 20px 12px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            boxShadow: '0 12px 32px rgba(15, 18, 32, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            minWidth: '280px',
                            maxWidth: '350px'
                        }}
                    >
                        {/* Green Icon Box */}
                        <div style={{
                            width: '52px',
                            height: '52px',
                            background: 'linear-gradient(135deg, #00c37e, #00e896)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(0, 195, 126, 0.3)'
                        }}>
                            {/* Custom SVG bill icon matching the screenshot */}
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" color="white" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.5 7.5C2.5 6.11929 3.61929 5 5 5H19C20.3807 5 21.5 6.11929 21.5 7.5V16.5C21.5 17.8807 20.3807 19 19 19H5C3.61929 19 2.5 17.8807 2.5 16.5V7.5ZM5.5 8C5.5 8.82843 4.82843 9.5 4 9.5V14.5C4.82843 14.5 5.5 15.1716 5.5 16H18.5C18.5 15.1716 19.1716 14.5 20 14.5V9.5C19.1716 9.5 18.5 8.82843 18.5 8H5.5ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
                            </svg>
                        </div>

                        {/* Text Content */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ fontSize: '16px', color: 'white', whiteSpace: 'nowrap' }}>
                                <span style={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>{notification.name}</span>
                                <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}> withdraw </span>
                                <span style={{ color: '#00e896', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
                                    ₹{notification.amount?.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                                {notification.minutes} mins ago
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LiveNotification;
