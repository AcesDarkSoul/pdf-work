/**
 * PAYMENT VERIFICATION MODULE
 * Verifies payment screenshots against:
 * - UPI ID from Firebase
 * - Payment amount
 * - Timestamp (within last 10 minutes)
 */

class PaymentVerifier {
    constructor(firebaseDb, requiredAmount, requiredUpiId, requiredUserId) {
        this.db = firebaseDb;
        this.requiredAmount = requiredAmount;
        this.requiredUpiId = requiredUpiId;
        this.requiredUserId = requiredUserId;
        this.paymentTimeout = 10 * 60 * 1000; // 10 minutes in milliseconds
    }

    /**
     * Verify payment from screenshot
     * Extracts OCR text and validates against requirements
     * STRICT MODE: Only approves if all payment details are successfully extracted and validated
     */
    async verifyPayment(imageData) {
        try {
            console.log("Starting payment verification (STRICT MODE)...");
            
            // Step 1: Extract text from image using local OCR
            const extractedText = await this.extractTextFromImage(imageData);
            console.log("Extracted text from image:", extractedText);
            
            if (!extractedText || extractedText.trim().length === 0) {
                return {
                    verified: false,
                    reason: "❌ Could not read payment details from screenshot. Please ensure:\n• Screenshot is clear and well-lit\n• Shows complete payment confirmation\n• Contains UPI ID, amount, and time"
                };
            }

            // Step 2: Parse payment details
            const paymentDetails = this.parsePaymentDetails(extractedText);
            console.log("Parsed payment details:", paymentDetails);
            
            if (!paymentDetails) {
                return {
                    verified: false,
                    reason: "❌ Could not extract payment information from screenshot. Payment details must include UPI ID, amount, and time."
                };
            }

            // Step 3: Validate all required fields are present
            const missingFields = this.validateRequiredFields(paymentDetails);
            if (missingFields.length > 0) {
                return {
                    verified: false,
                    reason: `❌ Missing payment details: ${missingFields.join(", ")}.\n\nScreenshot must clearly show:\n• UPI ID or payment recipient\n• Payment Amount (₹)\n• Date & Time`
                };
            }

            // Step 4: Verify UPI ID from Firebase
            if (!paymentDetails.upiId) {
                return {
                    verified: false,
                    reason: "❌ Could not find UPI ID in screenshot. Please ensure the payment recipient/UPI ID is visible."
                };
            }

            const upiVerified = await this.verifyUpiIdFromFirebase(paymentDetails.upiId);
            if (!upiVerified) {
                return {
                    verified: false,
                    reason: `❌ UPI ID mismatch!\nPayment received from: ${paymentDetails.upiId}\nBut expected: ${this.requiredUpiId}\n\nPlease ensure you paid to the correct UPI ID.`
                };
            }

            // Step 5: Verify amount matches
            if (!paymentDetails.amount) {
                return {
                    verified: false,
                    reason: "❌ Could not find payment amount in screenshot. Amount must be clearly visible."
                };
            }

            const amountVerified = this.verifyAmount(paymentDetails.amount);
            if (!amountVerified) {
                return {
                    verified: false,
                    reason: `❌ Amount mismatch!\nYou paid: ₹${paymentDetails.amount}\nRequired: ₹${this.requiredAmount}\n\nPlease pay the exact amount.`
                };
            }

            // Step 6: Verify timestamp (within last 10 minutes)
            if (!paymentDetails.timestamp) {
                return {
                    verified: false,
                    reason: "❌ Could not find payment time in screenshot. Time must be clearly visible (HH:MM format)."
                };
            }

            const timeVerified = this.verifyPaymentTime(paymentDetails.timestamp);
            if (!timeVerified) {
                return {
                    verified: false,
                    reason: `❌ Payment time is outside the 10-minute window!\nPayment time: ${paymentDetails.timeString || 'unknown'}\n\nScreenshot must be taken within 10 minutes of payment.`
                };
            }

            // All validations passed!
            return {
                verified: true,
                details: paymentDetails,
                message: "✅ Payment verified successfully!"
            };

        } catch (error) {
            console.error("Payment verification error:", error);
            return {
                verified: false,
                reason: `❌ Verification error: ${error.message}\n\nPlease try uploading again or contact support.`
            };
        }
    }

    /**
     * Validate that all required payment fields are present
     */
    validateRequiredFields(paymentDetails) {
        const missingFields = [];
        
        if (!paymentDetails.upiId) {
            missingFields.push("UPI ID");
        }
        if (!paymentDetails.amount) {
            missingFields.push("Amount");
        }
        if (!paymentDetails.timestamp && !paymentDetails.timeString) {
            missingFields.push("Time");
        }
        
        return missingFields;
    }

    /**
     * Extract text from image using available OCR methods
     * REQUIRED: Must successfully extract text or return null/fail
     */
    async extractTextFromImage(imageData) {
        try {
            // Method 1: Try using Tesseract.js if available (local OCR)
            if (typeof Tesseract !== 'undefined') {
                console.log("Using Tesseract.js for OCR...");
                const tessResult = await this.extractWithTesseract(imageData);
                if (tessResult && tessResult.trim().length > 0) {
                    console.log("✅ Tesseract.js extraction successful");
                    return tessResult;
                } else {
                    console.warn("Tesseract.js returned empty result");
                }
            } else {
                console.warn("Tesseract.js not loaded - add this to index.html:");
                console.warn("<script src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'></script>");
            }

            console.error("❌ No OCR method available. Cannot extract payment details.");
            return null;

        } catch (error) {
            console.error("Error extracting text:", error);
            return null;
        }
    }

    /**
     * Extract text using Tesseract.js
     * Properly handles async operations and worker initialization
     */
    async extractWithTesseract(imageData) {
        try {
            console.log("Initializing Tesseract worker...");
            
            // Initialize Tesseract worker
            const { createWorker } = Tesseract;
            const worker = await createWorker('eng');
            
            console.log("Running OCR on image...");
            const result = await worker.recognize(imageData);
            
            console.log("Terminating Tesseract worker...");
            await worker.terminate();
            
            const extractedText = result.data.text;
            console.log("Extracted text:", extractedText);
            
            return extractedText;
        } catch (error) {
            console.error("Tesseract OCR error:", error);
            return null;
        }
    }

    /**
     * Convert image data to canvas for processing
     */
    async imageDataToCanvas(imageData) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas);
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = imageData;
        });
    }

    /**
     * Parse payment details from extracted text
     * STRICT MODE: Only returns details if all critical fields found
     * Looks for: UPI ID, Amount, Timestamp
     */
    parsePaymentDetails(text) {
        if (!text || text.trim().length === 0) {
            console.error("No text provided to parse");
            return null;
        }

        const details = {};

        // Extract UPI ID (pattern: xxx@yyy) - REQUIRED
        const upiPattern = /([a-zA-Z0-9._-]+)@([a-zA-Z0-9]+)/i;
        const upiMatch = text.match(upiPattern);
        if (upiMatch) {
            details.upiId = upiMatch[0].toLowerCase();
            console.log("✅ Found UPI ID:", details.upiId);
        } else {
            console.warn("❌ UPI ID not found in text");
        }

        // Extract amount (₹ or Rs symbol followed by number) - REQUIRED
        const amountPattern = /[₹Rs]*\s*([0-9]{1,10}(?:\.[0-9]{1,2})?)/;
        const amountMatch = text.match(amountPattern);
        if (amountMatch) {
            details.amount = parseFloat(amountMatch[1]);
            console.log("✅ Found Amount:", details.amount);
        } else {
            console.warn("❌ Amount not found in text");
        }

        // Extract time (HH:MM in 12-hour or 24-hour format) - REQUIRED FOR VALIDATION
        const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/;
        const timeMatch = text.match(timePattern);
        if (timeMatch) {
            details.timeString = timeMatch[0];
            details.timestamp = this.parseTimestamp(timeMatch);
            console.log("✅ Found Time:", details.timeString, "Parsed timestamp:", details.timestamp);
        } else {
            console.warn("❌ Time not found in text");
        }

        // Extract date if possible (OPTIONAL - for reference)
        const datePattern = /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)[a-z]*,?\s+(\d{4})?/i;
        const dateMatch = text.match(datePattern);
        if (dateMatch) {
            details.dateString = dateMatch[0];
            console.log("✅ Found Date:", details.dateString);
        }

        // Check if critical fields are present
        if (!details.upiId || !details.amount || !details.timestamp) {
            const missing = [];
            if (!details.upiId) missing.push("UPI ID");
            if (!details.amount) missing.push("Amount");
            if (!details.timestamp) missing.push("Time");
            console.error("❌ Missing critical fields:", missing.join(", "));
            return null;
        }

        console.log("✅ All critical payment details extracted successfully");
        return details;
    }

    /**
     * Parse timestamp and return Date object
     */
    parseTimestamp(timeMatch) {
        try {
            let hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);
            const period = timeMatch[3];

            // Convert to 24-hour format if AM/PM provided
            if (period && period.toUpperCase() === 'PM' && hours !== 12) {
                hours += 12;
            } else if (period && period.toUpperCase() === 'AM' && hours === 12) {
                hours = 0;
            }

            const now = new Date();
            const paymentTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
            
            // If time is in future, assume previous day
            if (paymentTime > now) {
                paymentTime.setDate(paymentTime.getDate() - 1);
            }

            return paymentTime;
        } catch (error) {
            console.error("Error parsing timestamp:", error);
            return null;
        }
    }

    /**
     * Verify UPI ID against Firebase
     */
    async verifyUpiIdFromFirebase(extractedUpiId) {
        try {
            if (!extractedUpiId) {
                console.error("No UPI ID extracted from payment");
                return false;
            }

            // Fetch the configured UPI ID from Firebase
            const doc = await this.db.collection("payment_config")
                                     .doc("account_details")
                                     .get();

            if (!doc.exists) {
                console.error("Payment config not found in Firebase");
                return false;
            }

            const configuredUpiId = doc.data().upiId;
            console.log("Comparing UPI IDs - Extracted:", extractedUpiId, "Configured:", configuredUpiId);

            // Verify UPI ID matches
            return (extractedUpiId.toLowerCase() === configuredUpiId.toLowerCase());

        } catch (error) {
            console.error("Error verifying UPI from Firebase:", error);
            return false;
        }
    }

    /**
     * Verify payment amount matches required amount
     * Strict matching with very small tolerance only
     */
    verifyAmount(paymentAmount) {
        if (!paymentAmount) {
            console.error("No payment amount provided");
            return false;
        }

        const tolerance = 0.01; // Allow 1 paise difference only
        const isMatch = Math.abs(paymentAmount - this.requiredAmount) <= tolerance;
        
        console.log("Amount verification:");
        console.log("  Paid: ₹" + paymentAmount.toFixed(2));
        console.log("  Required: ₹" + this.requiredAmount.toFixed(2));
        console.log("  Difference: ₹" + Math.abs(paymentAmount - this.requiredAmount).toFixed(2));
        console.log("  Result:", isMatch ? "✅ MATCHED" : "❌ MISMATCH");
        
        return isMatch;
    }

    /**
     * Verify payment timestamp is within last 10 minutes
     */
    verifyPaymentTime(paymentTimestamp) {
        if (!paymentTimestamp) {
            console.error("No payment timestamp extracted");
            return false;
        }

        const now = Date.now();
        const paymentTime = paymentTimestamp.getTime();
        const timeDifference = now - paymentTime;

        console.log("Time check - Payment time:", paymentTimestamp, "Time diff (ms):", timeDifference, "Timeout (ms):", this.paymentTimeout);

        // Payment must be within last 10 minutes
        return timeDifference >= 0 && timeDifference <= this.paymentTimeout;
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentVerifier;
}
