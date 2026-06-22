const API_BASE = import.meta.env.VITE_API_URL || '';

export async function createRazorpayOrder(amountInRupees, receipt) {
  const amount = Math.round(amountInRupees * 100);

  const response = await fetch(`${API_BASE}/api/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      currency: 'INR',
      receipt,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to create order');
  }

  return data;
}

export async function verifyRazorpayPayment(paymentData) {
  const response = await fetch(`${API_BASE}/api/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Payment verification failed');
  }

  return data;
}

export function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
    document.body.appendChild(script);
  });
}

export function openRazorpayCheckout({ orderId, amount, currency, name, description, userName, userEmail, userPhone, onSuccess, onDismiss, onFailure }) {
  const key = import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!key) {
    throw new Error('Razorpay key is not configured');
  }

  const options = {
    key,
    amount,
    currency,
    name: name || 'SkillWork',
    description: description || 'Pro Upgrade',
    order_id: orderId,
    prefill: {
      name: userName || '',
      email: userEmail || '',
      contact: userPhone || '',
    },
    theme: { color: '#00c37e' },
    handler: onSuccess,
    modal: {
      ondismiss: onDismiss,
    },
  };

  const rzp = new window.Razorpay(options);

  rzp.on('payment.failed', (response) => {
    onFailure?.(response.error);
  });

  rzp.open();
}
