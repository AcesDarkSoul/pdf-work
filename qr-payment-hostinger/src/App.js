import React, { useState, useEffect, useRef, useCallback } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import PaymentVerifier from './PaymentVerifier';
import { installErrorHandler } from './errorHandler';

// firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCvoY8P3CUtXOIBRFoXT1nsJHncXtpuhcM",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "eaze-wellness.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "eaze-wellness",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "eaze-wellness.appspot.com",
};

function App() {
  const [userId, setUserId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [amount, setAmount] = useState(null);
  const [coins, setCoins] = useState(null);
  const [upiId, setUpiId] = useState(null);
  const [expiryTime, setExpiryTime] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('Generating QR Code...');
  const [error, setError] = useState(null);
  const [remainingTime, setRemainingTime] = useState('10:00');
  const [currentScreen, setCurrentScreen] = useState('payment'); // 'payment', 'qr', 'success'
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  
  // Form fields for success screen
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  
  const verifierRef = useRef(null);
  const dbRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    installErrorHandler();

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    dbRef.current = firebase.firestore();

    const params = new URLSearchParams(window.location.search);
    let urlUser = params.get('userId');
    let urlOrder = params.get('orderId');
    let urlAmount = parseFloat(params.get('amount')) || null;
    let urlCoins = parseInt(params.get('coins')) || null;

    if (urlUser && urlAmount) {
      setUserId(urlUser);
      if (urlOrder) setOrderId(urlOrder);
      setAmount(urlAmount);
      setCoins(urlCoins);
      initializePayment(urlUser, urlAmount, urlOrder);
    } else {
      window.addEventListener('message', onMessage);
      setLoadingMessage('Waiting for payment details...');
    }
  }, []);

  async function onMessage(event) {
    let data = event.data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch {}
    }
    if (data && data.type === 'initialize') {
      const uid = data.userId;
      const oid = data.orderId;
      const amt = parseFloat(data.amount);
      const c = data.coins || Math.floor(amt);
      if (uid && amt) {
        setUserId(uid);
        if (oid) setOrderId(oid);
        setAmount(amt);
        setCoins(c);
        await initializePayment(uid, amt, oid);
      }
    }
  }

  async function initializePayment(uid, amt, oid) {
    try {
      const doc = await dbRef.current.collection('payment_config').doc('account_details').get();
      if (!doc.exists) throw new Error('UPI ID not configured in Firestore');
      const fetchedUpi = doc.data().upiId;
      setUpiId(fetchedUpi);
      createVerifier(amt, fetchedUpi, oid || uid);
      const expiry = Date.now() + 10 * 60 * 1000;
      setExpiryTime(expiry);
      startExpiryTimer(expiry);
      setLoadingMessage('');
    } catch (err) {
      console.error('Init error:', err);
      setError(err.message);
    }
  }

  function createVerifier(requiredAmount, requiredUpi, oid) {
    verifierRef.current = new PaymentVerifier(dbRef.current, requiredAmount, requiredUpi, oid);
  }

  function generateUpiString() {
    if (!upiId || !amount) return '';
    
    // Create payment message with Order ID if available
    let paymentNote = 'Wallet Recharge';
    if (orderId) {
      // Include Order ID in the payment message
      // This will show up in the payment app when user scans QR
      paymentNote = `Order ID: ${orderId}`;
    } else if (userId) {
      // Fallback to User ID if no Order ID
      paymentNote = `Payment ID: ${userId.substring(0, 10)}`;
    }
    
    // URL encode the note
    const encodedNote = encodeURIComponent(paymentNote);
    
    // UPI payment format: upi://pay?pa=UPI_ID&am=AMOUNT&cu=INR&tn=NOTE
    return `upi://pay?pa=${upiId}&am=${amount.toFixed(2)}&cu=INR&tn=${encodedNote}`;
  }

  function startExpiryTimer(expiry) {
    const tick = () => {
      const now = Date.now();
      const remainingMs = expiry - now;
      if (remainingMs <= 0) {
        setRemainingTime('00:00');
        return;
      }
      const totalSec = Math.floor(remainingMs / 1000);
      const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
      const ss = String(totalSec % 60).padStart(2, '0');
      setRemainingTime(mm + ':' + ss);
      requestAnimationFrame(() => setTimeout(tick, 1000));
    };
    tick();
  }

  const copyUpiId = useCallback(() => {
    if (upiId) {
      navigator.clipboard.writeText(upiId).then(() => {
        alert('UPI ID copied to clipboard!');
      });
    }
  }, [upiId]);

  const handlePaidClick = () => {
    setShowConfirmPopup(true);
  };

  const handleConfirmPaid = () => {
    setShowConfirmPopup(false);
    setCurrentScreen('success');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setScreenshotPreview(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!screenshotFile) {
      alert('Please upload payment screenshot');
      return;
    }

    setVerificationLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        // Pass the full data URL to Tesseract (it needs the data:image prefix)
        const dataUrl = ev.target.result;
        const result = await verifierRef.current.verifyPayment(dataUrl);
        setVerificationResult(result);
        setVerificationLoading(false);
        
        if (result.verified) {
          // Use coins from state (set from URL params or postMessage)
          // Fallback to Math.floor(amount) if coins not provided
          const calculatedCoins = (coins && coins > 0) ? coins : Math.floor(amount) || 0;
          
          console.log('Verification successful!', {
            amount: amount,
            coins: coins,
            calculatedCoins: calculatedCoins,
            orderId: orderId,
            userId: userId
          });
          
          // Notify parent app with proper format
          const message = {
            type: 'verification_complete',
            success: true,
            verified: true,
            amount: amount,
            coins: calculatedCoins,
            orderId: orderId,
            paymentId: orderId || userId,
            status: 'verified'
          };
          
          console.log('Sending verification success message:', message);
          console.log('Message as JSON string:', JSON.stringify(message));
          
          // Try multiple methods to notify Flutter
          if (window.postMessage) {
            window.postMessage(JSON.stringify(message), '*');
          }
          
          // Also try parent.postMessage for iframe scenarios
          if (window.parent && window.parent !== window) {
            try {
              window.parent.postMessage(JSON.stringify(message), '*');
            } catch (e) {
              console.log('parent.postMessage failed:', e);
            }
          }
          
          // Also try top.postMessage
          if (window.top && window.top !== window) {
            try {
              window.top.postMessage(JSON.stringify(message), '*');
            } catch (e) {
              console.log('top.postMessage failed:', e);
            }
          }
          
          alert('Payment verified successfully! Coins will be added to your wallet.');
        } else {
          const errorMessage = {
            type: 'verification_complete',
            success: false,
            verified: false,
            message: result.reason || 'Unknown error',
            status: 'failed'
          };
          
          if (window.postMessage) {
            window.postMessage(JSON.stringify(errorMessage), '*');
          }
          
          alert('Verification failed: ' + (result.reason || 'Unknown error'));
        }
      };
      reader.readAsDataURL(screenshotFile);
    } catch (e) {
      setVerificationLoading(false);
      console.error(e);
      alert('Error verifying payment');
    }
  };

  // Generate order ID if not provided
  const displayOrderId = orderId || (userId ? userId.substring(0, 10) : '6272883939');
  const convenienceFee = 0.00;
  const grandTotal = amount ? (amount + convenienceFee).toFixed(2) : '0.00';

  if (loadingMessage) {
    return (
      <div className="screen active">
        <div className="loading">
          <div className="spinner" />
          {loadingMessage}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="screen active">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="screen active">
      {/* Header */}
      <div className="header-bar">
        <div className="header-content">
          <div className="header-title">Payment & Recharge</div>
          <div className="header-subtitle">Secure activation for your connectx</div>
        </div>
        <button className="change-btn">+ Change</button>
      </div>

      <div className="container">
        {/* Payment Selection Screen */}
        {currentScreen === 'payment' && upiId && amount && (
          <>
            {/* Order Details */}
            <div className="order-card">
              <div className="order-header">
                <div className="order-title">Order Details</div>
                <div className="order-id">{displayOrderId}</div>
              </div>
              <div className="order-content">
                <div className="order-row">
                  <span>Total:</span>
                  <span className="order-value">₹{amount.toFixed(2)}</span>
                </div>
                <div className="order-row">
                  <span>Subtotal:</span>
                  <span className="order-value">₹{amount.toFixed(2)}</span>
                </div>
                <div className="order-row">
                  <span>Convenience Fee:</span>
                  <span className="order-value">₹{convenienceFee.toFixed(2)}</span>
                </div>
                <div className="order-row grand-total">
                  <span>Grand Total:</span>
                  <span className="order-value">₹{grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="payment-options-card">
              <div className="payment-options-title">Payment Options</div>
              <div className="payment-option active" onClick={() => setCurrentScreen('qr')}>
                <div className="upi-logo">💳</div>
                <div>
                  <div className="upi-text">UPI Payment</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Pay via UPI QR</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* QR Code Screen */}
        {currentScreen === 'qr' && upiId && amount && (
          <>
            {/* Order Details */}
            <div className="order-card">
              <div className="order-header">
                <div className="order-title">Order Details</div>
                <div className="order-id">{displayOrderId}</div>
              </div>
              <div className="order-content">
                <div className="order-row">
                  <span>Total:</span>
                  <span className="order-value">₹{amount.toFixed(2)}</span>
                </div>
                <div className="order-row">
                  <span>Subtotal:</span>
                  <span className="order-value">₹{amount.toFixed(2)}</span>
                </div>
                <div className="order-row">
                  <span>Convenience Fee:</span>
                  <span className="order-value">₹{convenienceFee.toFixed(2)}</span>
                </div>
                <div className="order-row grand-total">
                  <span>Grand Total:</span>
                  <span className="order-value">₹{grandTotal}</span>
                </div>
              </div>
            </div>

            {/* QR Code Card */}
            <div className="qr-card">
              <div className="qr-title">Scan QR Code to Pay</div>
              <div className="qr-instruction">Open any UPI app and scan this QR code</div>
              
              <div className="upi-apps">
                <div className="upi-app-icon">Google Pay</div>
                <div className="upi-app-icon">PhonePe</div>
                <div className="upi-app-icon">Paytm</div>
              </div>

              <div className="qr-code-container">
                <QRCode 
                  value={generateUpiString()} 
                  size={250} 
                  level="H" 
                />
              </div>

              <div className="upi-id-section">
                <div className="upi-id-label">TAP TO COPY UPI ID</div>
                <div className="upi-id-value" onClick={copyUpiId}>
                  <span>{upiId}</span>
                  <span className="copy-icon">📋</span>
                </div>
              </div>

              <button className="paid-btn" onClick={handlePaidClick}>
                <span className="check-icon">✓</span>
                I Have Paid
              </button>

              <div className="qr-timer">
                This QR will expire in <span className="expiry-timer">{remainingTime}</span>
              </div>
            </div>
          </>
        )}

        {/* Success Form Screen */}
        {currentScreen === 'success' && (
          <>
            {/* Order Details */}
            <div className="order-card">
              <div className="order-header">
                <div className="order-title">Order Details</div>
                <div className="order-id">{displayOrderId}</div>
              </div>
            </div>

            {/* Verification Form */}
            <div className="verification-form-card">
              <div className="form-field">
                <label className="form-label">Full Legal Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full legal name"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Mobile Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Enter your mobile number"
                />
              </div>

              <div className="form-field">
                <label className="form-label">PAYMENT REFERENCE (UTR)</label>
                <input
                  type="text"
                  className="form-input"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="12-digit UTR number"
                />
                <div className="form-warning">Failed to load immediate account expiration</div>
              </div>

              <div className="form-field">
                <label className="form-label">PAYMENT REFERENCE (UTR)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <div className="file-upload-area" onClick={() => fileInputRef.current?.click()}>
                  <span className="upload-icon">📷</span>
                  <span>{screenshotPreview ? 'Change Screenshot' : 'Payment Screen shot'}</span>
                </div>
                {screenshotPreview && (
                  <img src={screenshotPreview} alt="Screenshot preview" className="preview-image show" />
                )}
                <div className="form-warning">Failed to load immediate account expiration</div>
              </div>

              <button 
                className="submit-btn" 
                onClick={handleSubmit}
                disabled={verificationLoading || !screenshotFile}
              >
                {verificationLoading ? 'VERIFYING...' : 'SUBMIT'}
              </button>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="footer-powered">Powered by UPI</div>
      </div>

      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="popup-overlay active" onClick={() => setShowConfirmPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-icon">⚠️</div>
            <div className="popup-title">Confirm Payout</div>
            <div className="popup-message">
              Your 50% advance payout is ready. Provide the UTR in the next step.
            </div>
            <button className="popup-confirm-btn" onClick={handleConfirmPaid}>
              Yes, I Have Paid
            </button>
            <button className="popup-cancel-btn" onClick={() => setShowConfirmPopup(false)}>
              Wait, Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
