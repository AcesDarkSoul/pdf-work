window.addEventListener("load", async function(){

/* 🔹 FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyCvoY8P3CUtXOIBRFoXT1nsJHncXtpuhcM",
  authDomain: "eaze-wellness.firebaseapp.com",
  projectId: "eaze-wellness",
  // Use standard Firebase Storage bucket name (appspot.com)
  storageBucket: "eaze-wellness.appspot.com",
};

firebase.initializeApp(firebaseConfig);
console.log("Firebase initialized");

const db = firebase.firestore();

/* 🔹 GET URL PARAMS OR LISTEN FOR POSTMESSAGE */
let userId = null;
let amount = null;
let coins = null;
let expiryTime = null;          // timestamp when this payment link expires
let activePaymentId = null;     // last created payment verification id
let unsubscribePaymentListener = null; // Firestore listener cleanup

const params = new URLSearchParams(window.location.search);
userId = params.get("userId");
amount = parseFloat(params.get("amount")) || null;
coins = parseInt(params.get("coins")) || null;

// If no URL params, wait for postMessage from Flutter
if(!userId || !amount){
    console.log("No URL params, waiting for postMessage...");
    
    window.addEventListener("message", async function(event){
        console.log("Received message:", event.data);
        
        let data = event.data;
        if(typeof data === "string"){
            try{ data = JSON.parse(data); }catch(e){ return; }
        }
        
        if(data && data.type === "initialize"){
            userId = data.userId;
            amount = parseFloat(data.amount);
            coins = data.coins || Math.floor(amount);
            
            if(userId && amount){
                await initializePayment();
            }
        }
    });
    
    // Show waiting message
    document.getElementById("loading").innerHTML = `
        <div class="spinner"></div>
        Waiting for payment details...
    `;
    return;
}

// Initialize with URL params
await initializePayment();

/* 🔹 INITIALIZE PAYMENT */
async function initializePayment(){
    try{
        console.log("Initializing payment:", { userId, amount, coins });
        
        /* 🔹 LOAD UPI FROM FIRESTORE */
        const doc = await db.collection("payment_config")
                            .doc("account_details")
                            .get();

        if(!doc.exists) throw new Error("UPI ID not configured in Firestore");

        const upiId = doc.data().upiId;
        console.log("UPI ID loaded:", upiId);

        generateQR(upiId, amount);

        document.getElementById("amountText").innerText = amount.toFixed(2);
        const userIdTextEl = document.getElementById("userIdText");
        if(userIdTextEl){ userIdTextEl.innerText = userId; }
        const userIdTextInfoEl = document.getElementById("userIdTextInfo");
        if(userIdTextInfoEl){ userIdTextInfoEl.innerText = userId; }

        // 10 minute validity window from initialization
        expiryTime = Date.now() + 10 * 60 * 1000;
        startExpiryTimer();

        document.getElementById("loading").style.display = "none";
        document.getElementById("content").style.display = "block";

    }catch(err){
        console.error("Init error:", err);
        showError(err.message);
    }
}
/* 🔹 40‑MINUTE EXPIRY TIMER */
function startExpiryTimer(){
    const timerEl = document.getElementById("expiryTimer");
    const uploadBtn = document.getElementById("uploadBtn");
    const status = document.getElementById("status");

    function tick(){
        if(!expiryTime){
            return;
        }
        const remainingMs = expiryTime - Date.now();
        if(remainingMs <= 0){
            timerEl.innerText = "00:00";
            uploadBtn.disabled = true;
            uploadBtn.innerText = "Link expired – request new link in app";
            status.className = "status error";
            status.innerText = "⏰ Payment link expired. Please create a new payment from the app and try again.";
            return;
        }
        const totalSec = Math.floor(remainingMs / 1000);
        const mm = String(Math.floor(totalSec / 60)).padStart(2,"0");
        const ss = String(totalSec % 60).padStart(2,"0");
        timerEl.innerText = mm + ":" + ss;
        requestAnimationFrame(()=>{
            setTimeout(tick,1000);
        });
    }
    tick();
}

/* 🔹 GENERATE QR */
function generateQR(upiId, amount){
    const upiString = `upi://pay?pa=${upiId}&am=${amount}&cu=INR&tn=Wallet%20Recharge`;
    console.log("UPI String:", upiString);

    const qrContainer = document.getElementById("qrcode");
    qrContainer.innerHTML = "";

    new QRCode(qrContainer, {
        text: upiString,
        width: 250,
        height: 250,
        colorDark: "#1a1a1a",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    console.log("QR Code generated");
}

/* 🔹 IMAGE PICK */
window.pickImage = function(){
    // Check if Flutter WebView channel exists
    if(window.pickImage && window.pickImage.postMessage){
        window.pickImage.postMessage("");
    } else {
        document.getElementById("fileInput").click();
    }
}

/* 🔹 SET IMAGE FROM FLUTTER */
window.setSelectedImage = function(base64Data){
    if(!base64Data) return;
    
    const preview = document.getElementById("previewImage");
    preview.src = "data:image/jpeg;base64," + base64Data;
    preview.style.display = "block";
    
    uploadImage(base64Data);
}

/* 🔹 IMAGE UPLOAD FROM FILE INPUT */
document.getElementById("fileInput")
.addEventListener("change", async function(e){

    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onload = async function(event){
        const base64 = event.target.result;
        const preview = document.getElementById("previewImage");

        preview.src = base64;
        preview.style.display = "block";

        await uploadImage(base64.split(",")[1]);
    };

    reader.readAsDataURL(file);
});

/* 🔹 CREATE VERIFICATION WITHOUT UPLOADING IMAGE (LOCAL CHECK ONLY) */
async function uploadImage(base64Data){
    const btn = document.getElementById("uploadBtn");
    const status = document.getElementById("status");

    try{
        // Block uploads after expiry
        if(expiryTime && Date.now() > expiryTime){
            status.className = "status error";
            status.innerText = "⏰ Payment link expired. Please create a new payment from the app.";
            btn.disabled = true;
            btn.innerText = "Link expired";
            return;
        }

        btn.disabled = true;
        btn.innerText = "Analyzing Payment...";
        status.className = "status";
        status.innerText = "🔍 Scanning payment screenshot and verifying details...";

        const now = Date.now();
        const paymentId = `PAY_${now}_${Math.random().toString(36).substr(2,9)}`;
        activePaymentId = paymentId;

        // Load payment verification module configuration
        const docConfig = await db.collection("payment_config")
                                  .doc("account_details")
                                  .get();
        
        if(!docConfig.exists) {
            throw new Error("Payment configuration not found");
        }

        const configuredUpiId = docConfig.data().upiId;

        // Initialize payment verifier
        const verifier = new PaymentVerifier(
            db,
            amount,           // Required amount
            configuredUpiId,  // Required UPI ID from Firebase
            userId            // Required user ID
        );

        // Verify the payment screenshot
        console.log("Starting payment verification with PaymentVerifier...");
        const verificationResult = await verifier.verifyPayment(base64Data);
        console.log("Verification result:", verificationResult);

        // Determine verification status
        let paymentStatus = "pending";
        let rejectionReason = null;

        if(verificationResult.verified) {
            paymentStatus = "approved";
            console.log("✅ Payment verification APPROVED");
        } else {
            paymentStatus = "rejected";
            rejectionReason = verificationResult.reason || "Payment verification failed";
            console.log("❌ Payment verification REJECTED:", rejectionReason);
        }

        // Create Firestore verification record with verification result
        const firestorePromise = db.collection("payment_verifications").doc(paymentId).set({
            id: paymentId,
            userId: userId,
            amount: amount,
            coins: coins || Math.floor(amount),
            screenshotUrl: null,           // No image stored
            status: paymentStatus,         // "approved", "rejected", or "pending"
            createdAt: new Date().toISOString(),
            expiresAt: expiryTime ? new Date(expiryTime).toISOString() : null,
            verifiedAt: paymentStatus !== "pending" ? new Date().toISOString() : null,
            rejectionReason: rejectionReason,
            verificationDetails: {
                extractedUpiId: verificationResult.details?.upiId || null,
                extractedAmount: verificationResult.details?.amount || null,
                extractedTime: verificationResult.details?.timeString || null,
                method: "ocr_verification"
            }
        });

        const firestoreTimeout = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error("Failed to save verification request. Please try again."));
            }, 10000);
        });

        await Promise.race([firestorePromise, firestoreTimeout]);

        console.log("Payment verification submitted:", paymentId, "Status:", paymentStatus);

        // Show result to user
        if(paymentStatus === "approved") {
            status.className = "status success";
            status.innerHTML = "✅ <b>Payment Verified Successfully!</b><br>UPI ID matched, amount verified, and timestamp confirmed.<br>Coins will be added to your wallet.";
            btn.innerText = "✅ Payment Verified";
            btn.disabled = true;
        } else {
            status.className = "status error";
            // Format rejection reason with line breaks
            const formattedReason = rejectionReason.replace(/\n/g, "<br>");
            status.innerHTML = "<b>Payment Verification Failed</b><br>" + formattedReason;
            btn.disabled = false;
            btn.innerText = "📷 Upload Payment Screenshot";
        }

        // Notify Flutter app
        notifyApp({
            type: "upload_complete",
            paymentId: paymentId,
            status: paymentStatus,
            verified: paymentStatus === "approved",
            message: paymentStatus === "approved" 
                ? "Payment verified successfully" 
                : rejectionReason
        });

        // Listen for any status updates (in case admin overrides)
        listenForVerificationStatus(paymentId);

    }catch(err){
        console.error("Payment verification error:", err);

        let errorMessage = "Failed to process screenshot. Please try again.";
        if(err?.message){
            errorMessage = "❌ " + err.message;
        }

        status.className = "status error";
        status.innerText = errorMessage;
        btn.disabled = false;
        btn.innerText = "📷 Upload Payment Screenshot";

        notifyApp({
            type: "upload_error",
            error: errorMessage
        });
    }
}
/* 🔹 NOTIFY APP - Multiple callback mechanisms for Flutter WebView */
function notifyApp(data){
    const message = JSON.stringify(data);
    console.log("Notifying app:", message);
    
    // Method 1: webview_flutter JavaScript Channel (primary method)
    // This works with addJavaScriptChannel('onVerificationComplete', ...)
    if(window.onVerificationComplete){
        if(typeof window.onVerificationComplete === "function"){
            window.onVerificationComplete(message);
        } else if(window.onVerificationComplete.postMessage){
            window.onVerificationComplete.postMessage(message);
        }
    }
    
    // Method 2: Flutter InAppWebView (if using flutter_inappwebview package)
    if(window.flutter_inappwebview && window.flutter_inappwebview.callHandler){
        window.flutter_inappwebview.callHandler("onVerificationComplete", message).catch(err => {
            console.log("flutter_inappwebview callback failed:", err);
        });
    }
    
    // Method 3: Standard postMessage (for WebView/iframe scenarios)
    if(window.postMessage){
        window.postMessage(message, "*");
    }
    
    // Method 4: Android/iOS WebView interface (native WebView)
    if(window.Android && window.Android.onVerificationComplete){
        window.Android.onVerificationComplete(message);
    }
    if(window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.onVerificationComplete){
        window.webkit.messageHandlers.onVerificationComplete.postMessage(message);
    }
}

/* 🔹 LISTEN FOR VERIFICATION RESULT & NOTIFY APP */
function listenForVerificationStatus(paymentId){
    console.log("Starting listener for payment:", paymentId);
    
    // Clean up any previous listener
    if(unsubscribePaymentListener){
        unsubscribePaymentListener();
        unsubscribePaymentListener = null;
    }
    const statusEl = document.getElementById("status");
    const btn = document.getElementById("uploadBtn");

    try {
        unsubscribePaymentListener = db.collection("payment_verifications")
            .doc(paymentId)
            .onSnapshot(function(doc){
                console.log("Firestore snapshot received for:", paymentId, doc.exists);
                
                if(!doc.exists){
                    console.error("Verification record not found:", paymentId);
                    statusEl.className = "status error";
                    statusEl.innerText = "❌ Verification record not found. Please contact support.";
                    notifyApp({
                        type: "verification_complete",
                        success: false,
                        paymentId: paymentId,
                        status: "not_found",
                        message: "Verification record not found"
                    });
                    return;
                }
                
                const data = doc.data();
                const currentStatus = (data.status || "").toLowerCase();
                console.log("Current verification status:", currentStatus);

                if(currentStatus === "pending"){
                    // Still waiting, keep showing pending message
                    console.log("Still pending, waiting...");
                    return;
                }

                // Stop listening once we have final status
                if(unsubscribePaymentListener){
                    unsubscribePaymentListener();
                    unsubscribePaymentListener = null;
                    console.log("Stopped listener after final status");
                }

                if(currentStatus === "approved" || currentStatus === "success"){
                    console.log("Payment approved!");
                    statusEl.className = "status success";
                    statusEl.innerHTML = "🎉 <b>Payment verified successfully!</b> Coins will be added to your wallet shortly.";
                    btn.disabled = true;
                    btn.innerText = "Payment Verified";

                    // Final success callback for app to credit wallet
                    notifyApp({
                        type: "verification_complete",
                        success: true,
                        paymentId: paymentId,
                        status: "approved",
                        amount: data.amount,
                        coins: data.coins || Math.floor(data.amount)
                    });
                } else {
                    // Rejected / failed / expired
                    const reason = data.rejectionReason || "Payment could not be verified. If amount was debited, please contact support with your transaction details.";
                    console.log("Payment rejected:", reason);
                    statusEl.className = "status error";
                    statusEl.innerText = "❌ " + reason;
                    btn.disabled = false;
                    btn.innerText = "📷 Upload Payment Screenshot";

                    notifyApp({
                        type: "verification_complete",
                        success: false,
                        paymentId: paymentId,
                        status: currentStatus,
                        message: reason
                    });
                }
            }, function(error){
                console.error("Firestore listener error:", error);
                statusEl.className = "status error";
                
                let errorMsg = "❌ Error listening for verification. Please check your connection.";
                if(error && error.message) {
                    const errMsg = error.message.toLowerCase();
                    if(errMsg.includes("permission") || errMsg.includes("unauthorized")) {
                        errorMsg = "❌ Permission denied. Please check Firebase permissions.";
                    } else if(errMsg.includes("network") || errMsg.includes("connection")) {
                        errorMsg = "❌ Network error. Please check your connection.";
                    } else {
                        errorMsg = "❌ " + error.message;
                    }
                }
                statusEl.innerText = errorMsg;
                
                // Fallback: Poll for status every 5 seconds
                console.log("Starting fallback polling...");
                startPollingForStatus(paymentId);
            });
    } catch(err) {
        console.error("Error setting up listener:", err);
        statusEl.className = "status error";
        
        let errorMsg = "❌ Error setting up verification listener. Using fallback polling.";
        if(err && err.message) {
            errorMsg = "❌ " + err.message;
        }
        statusEl.innerText = errorMsg;
        startPollingForStatus(paymentId);
    }
}

/* 🔹 FALLBACK: Poll for verification status if listener fails */
let pollingInterval = null;
function startPollingForStatus(paymentId){
    if(pollingInterval){
        clearInterval(pollingInterval);
    }
    
    const statusEl = document.getElementById("status");
    let pollCount = 0;
    const maxPolls = 60; // Poll for 5 minutes (60 * 5 seconds)
    
    pollingInterval = setInterval(async function(){
        pollCount++;
        if(pollCount > maxPolls){
            clearInterval(pollingInterval);
            pollingInterval = null;
            statusEl.className = "status error";
            statusEl.innerText = "⏰ Verification is taking longer than expected. Please check back later or contact support.";
            return;
        }
        
        try {
            const doc = await db.collection("payment_verifications").doc(paymentId).get();
            if(!doc.exists){
                return; // Keep polling
            }
            
            const data = doc.data();
            const currentStatus = (data.status || "").toLowerCase();
            
            if(currentStatus === "pending"){
                return; // Keep polling
            }
            
            // Got final status, stop polling
            clearInterval(pollingInterval);
            pollingInterval = null;
            
            const btn = document.getElementById("uploadBtn");
            
            if(currentStatus === "approved" || currentStatus === "success"){
                statusEl.className = "status success";
                statusEl.innerHTML = "🎉 <b>Payment verified successfully!</b> Coins will be added to your wallet shortly.";
                btn.disabled = true;
                btn.innerText = "Payment Verified";
                
                notifyApp({
                    type: "verification_complete",
                    success: true,
                    paymentId: paymentId,
                    status: "approved",
                    amount: data.amount,
                    coins: data.coins || Math.floor(data.amount)
                });
            } else {
                const reason = data.rejectionReason || "Payment could not be verified.";
                statusEl.className = "status error";
                statusEl.innerText = "❌ " + reason;
                btn.disabled = false;
                btn.innerText = "📷 Upload Payment Screenshot";
                
                notifyApp({
                    type: "verification_complete",
                    success: false,
                    paymentId: paymentId,
                    status: currentStatus,
                    message: reason
                });
            }
        } catch(err) {
            console.error("Polling error:", err);
            if(pollCount === maxPolls) {
                statusEl.className = "status error";
                let errorMsg = "❌ Failed to check verification status. Please contact support.";
                if(err && err.message) {
                    errorMsg = "❌ " + err.message;
                }
                statusEl.innerText = errorMsg;
            }
        }
    }, 5000); // Poll every 5 seconds
}

/* 🔹 ERROR */
function showError(msg){
    document.getElementById("error").innerText = msg;
    document.getElementById("error").style.display = "block";
    document.getElementById("loading").style.display = "none";
}

/* 🔹 SHOW STATUS (called from Flutter) */
window.showStatus = function(msg){
    document.getElementById("status").innerText = msg;
}

/* 🔹 HIDE STATUS */
window.hideStatus = function(){
    document.getElementById("status").innerText = "";
}

});
