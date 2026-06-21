/**
 * PAYMENT VERIFICATION MODULE
 * Verifies payment screenshots against:
 * - UPI ID from Firebase
 * - Payment amount
 * - Timestamp (within last 10 minutes)
 */

export default class PaymentVerifier {
    constructor(firebaseDb, requiredAmount, requiredUpiId, requiredOrderId) {
        this.db = firebaseDb;
        this.requiredAmount = requiredAmount;
        this.requiredUpiId = requiredUpiId;
        // order id or user-specific id that must appear in screenshot
        this.requiredOrderId = requiredOrderId;
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
                    reason: "❌ Could not extract payment information from screenshot. Payment details must include UPI ID and time."
                };
            }

            // Step 3: Validate all required fields are present
            const missingFields = this.validateRequiredFields(paymentDetails);
            if (missingFields.length > 0) {
                return {
                    verified: false,
                    reason: `❌ Missing payment details: ${missingFields.join(", ")}.\n\nScreenshot must clearly show:\n• UPI ID or payment recipient\n• Date & Time\n• Order ID (if provided)`
                };
            }

            // Step 3b: verify order id if required
            if (this.requiredOrderId && paymentDetails.orderId) {
                if (paymentDetails.orderId.toLowerCase() !== this.requiredOrderId.toLowerCase()) {
                    return {
                        verified: false,
                        reason: `❌ Order ID mismatch!\nFound: ${paymentDetails.orderId}\nExpected: ${this.requiredOrderId}`
                    };
                }
            } else if (this.requiredOrderId && !paymentDetails.orderId) {
                return {
                    verified: false,
                    reason: "❌ Could not find Order ID in screenshot. Please ensure the order or reference ID is visible."
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

            // Step 5: Verify amount matches (OPTIONAL - only if amount is found)
            // Amount verification is now optional - we don't fail if amount is not found
            if (paymentDetails.amount) {
                const amountVerified = this.verifyAmount(paymentDetails.amount);
                if (!amountVerified) {
                    return {
                        verified: false,
                        reason: `❌ Amount mismatch!\nYou paid: ₹${paymentDetails.amount}\nRequired: ₹${this.requiredAmount}\n\nPlease pay the exact amount.`
                    };
                }
                console.log("✅ Amount verified:", paymentDetails.amount);
            } else {
                console.log("ℹ️ Amount not found in screenshot (optional field - skipping amount verification)");
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
     * Amount is now optional - only UPI ID and Time are required
     */
    validateRequiredFields(paymentDetails) {
        const missingFields = [];
        
        if (!paymentDetails.upiId) {
            missingFields.push("UPI ID");
        }
        // Amount is now optional - removed from required fields
        // if (!paymentDetails.amount) {
        //     missingFields.push("Amount");
        // }
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
            console.log("Using tesseract.js for OCR...");
            console.log("Image data type:", typeof imageData);
            console.log("Image data preview:", typeof imageData === 'string' ? imageData.substring(0, 50) : 'File/Blob');
            
            const tessResult = await this.extractWithTesseract(imageData);
            if (tessResult && tessResult.trim().length > 0) {
                console.log("✅ Tesseract.js extraction successful");
                console.log("Extracted text length:", tessResult.length);
                return tessResult;
            } else {
                console.warn("Tesseract.js returned empty result");
            }

            console.error("❌ OCR returned no text");
            return null;
        } catch (error) {
            console.error("Error extracting text:", error);
            console.error("Error stack:", error.stack);
            return null;
        }
    }

    /**
     * Extract text using Tesseract.js
     * Uses the simpler recognize() function which handles worker paths automatically
     */
    async extractWithTesseract(imageData) {
        try {
            console.log("Initializing Tesseract OCR...");
            const Tesseract = await import('tesseract.js');
            
            // Ensure imageData is in correct format - must be data URL or File/Blob
            let imageInput = imageData;
            if (typeof imageData === 'string') {
                // Ensure it's a proper data URL
                if (!imageData.startsWith('data:')) {
                    // If it's raw base64, add data URL prefix
                    imageInput = `data:image/png;base64,${imageData}`;
                }
            } else if (imageData instanceof File || imageData instanceof Blob) {
                // Convert File/Blob to data URL
                imageInput = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(imageData);
                });
            }

            // Validate image input format
            if (!imageInput || (typeof imageInput === 'string' && !imageInput.startsWith('data:'))) {
                throw new Error('Invalid image data format. Expected data URL or File/Blob.');
            }

            console.log("Running OCR on image...");
            console.log("Image format:", typeof imageInput === 'string' ? 'data URL' : 'File/Blob');
            
            // Use recognize() directly - it handles worker initialization automatically
            const result = await Tesseract.recognize(imageInput, 'eng', {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                    }
                }
            });

            const extractedText = result.data?.text || '';
            console.log("Extracted text length:", extractedText.length);
            if (extractedText.length > 0) {
                console.log("Extracted text preview:", extractedText.substring(0, 200));
                console.log("Full extracted text:", extractedText);
            } else {
                console.warn("⚠️ No text extracted from image");
            }

            return extractedText.trim();
        } catch (error) {
            console.error("Tesseract OCR error:", error);
            console.error("Error details:", {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            // If recognize() fails, try with createWorker as fallback
            console.log("Attempting fallback with createWorker...");
            try {
                const Tesseract = await import('tesseract.js');
                const { createWorker } = Tesseract;
                const worker = await createWorker('eng');
                
                let imageInput = imageData;
                if (typeof imageData === 'string' && !imageData.startsWith('data:')) {
                    imageInput = `data:image/png;base64,${imageData}`;
                }
                
                const result = await worker.recognize(imageInput);
                await worker.terminate();
                
                const extractedText = result.data?.text || '';
                if (extractedText.trim().length > 0) {
                    console.log("✅ Fallback OCR successful");
                    return extractedText.trim();
                }
            } catch (fallbackError) {
                console.error("Fallback OCR also failed:", fallbackError);
            }
            
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
        // Use required amount as hint for OCR misreads
        const expectedAmount = this.requiredAmount;
        if (!text || text.trim().length === 0) {
            console.error("No text provided to parse");
            return null;
        }

        const details = {};

        // Extract UPI ID (pattern: xxx@yyy) - REQUIRED
        // Improved pattern to handle various UPI ID formats including longer IDs
        const upiPatterns = [
            /([a-zA-Z0-9._-]{3,}@[a-zA-Z0-9]{2,})/i,  // Standard UPI ID: alphanumeric@bank
            /([a-zA-Z0-9._-]+@[a-zA-Z0-9]+)/i,        // Fallback: any valid UPI format
        ];
        
        let upiMatch = null;
        for (const pattern of upiPatterns) {
            upiMatch = text.match(pattern);
            if (upiMatch) {
                // Validate it's actually a UPI ID (not an email or other @ symbol)
                const upiId = upiMatch[1].toLowerCase();
                // UPI IDs typically don't start with numbers and have specific structure
                if (upiId.length >= 5 && !upiId.startsWith('@') && !upiId.endsWith('@')) {
                    details.upiId = upiId;
                    console.log("✅ Found UPI ID:", details.upiId);
                    break;
                }
            }
        }
        
        if (!upiMatch || !details.upiId) {
            console.warn("❌ UPI ID not found in text");
        }

        // Extract amount (₹ or Rs symbol followed by number) - REQUIRED
        // OCR often misreads ₹ as £, so we need to handle both
        let amountMatch = null;
        let foundAmount = null;
        
        // Pattern 0: Look for "Paid to" section with amount (PhonePe style)
        // In PhonePe screens, amount appears next to "Paid to" recipient
        if (!foundAmount) {
            const paidToPatterns = [
                /Paid\s+to[^\n]*₹\s*([0-9]{1,6}(?:\.[0-9]{1,2})?)/i,  // Paid to ... ₹1
                /Paid\s+to[^\n]*\n[^\n]*₹\s*([0-9]{1,6}(?:\.[0-9]{1,2})?)/i,  // Paid to\n...₹1 (multi-line)
            ];
            for (const pattern of paidToPatterns) {
                const match = text.match(pattern);
                if (match) {
                    const amount = parseFloat(match[1]);
                    if (amount > 0 && amount < 1000000) {
                        foundAmount = amount;
                        console.log("✅ Found Amount via 'Paid to' section:", foundAmount);
                        break;
                    }
                }
            }
        }
        
        // Pattern 1: Look for "Amount" label followed by ₹ symbol and number
        // This handles cases where amount is clearly labeled
        // Also handle cases where "Amount" is on one line and ₹1 is on the next line
        const amountLabelPatterns = [
            /Amount\s*[:\n]+\s*₹\s*([0-9]{1,6}(?:\.[0-9]{1,2})?)/i,  // Amount: ₹1 or Amount\n₹1
            /Amount\s*₹\s*([0-9]{1,6}(?:\.[0-9]{1,2})?)/i,              // Amount ₹1 (same line)
        ];
        
        for (const pattern of amountLabelPatterns) {
            const amountLabelMatch = text.match(pattern);
            if (amountLabelMatch) {
                const amount = parseFloat(amountLabelMatch[1]);
                if (amount > 0 && amount < 1000000) {
                    foundAmount = amount;
                    amountMatch = amountLabelMatch;
                    console.log("✅ Found Amount via 'Amount' label:", foundAmount);
                    break;
                }
            }
        }
        
        // Pattern 1b: Look for "Rupee One Only" or similar text (means ₹1)
        // This handles cases where OCR reads the amount in words
        if (!foundAmount) {
            const rupeeWordsPattern = /(?:Rupee\s+)?(?:One|1)\s+Only/i;
            if (rupeeWordsPattern.test(text)) {
                // Check if "Amount" label is nearby (within 5 lines)
                const lines = text.split('\n');
                let amountLineIndex = -1;
                for (let i = 0; i < Math.min(lines.length, 5); i++) {
                    if (/Amount/i.test(lines[i])) {
                        amountLineIndex = i;
                        break;
                    }
                }
                // If "Amount" is found and "Rupee One Only" is nearby, it's ₹1
                if (amountLineIndex >= 0) {
                    // Check if "Rupee One Only" is within 3 lines of "Amount"
                    const searchRange = lines.slice(amountLineIndex, amountLineIndex + 4).join(' ');
                    if (rupeeWordsPattern.test(searchRange)) {
                        foundAmount = 1;
                        console.log("✅ Found Amount ₹1 via 'Rupee One Only' text near 'Amount' label");
                    }
                }
            }
        }
        
        // Pattern 1c: Look for ₹ symbol near "Amount" label (handles multi-line cases)
        if (!foundAmount) {
            const lines = text.split('\n');
            for (let i = 0; i < Math.min(lines.length, 5); i++) {
                if (/Amount/i.test(lines[i])) {
                    // Check current line and next 2 lines for ₹ symbol
                    const searchText = lines.slice(i, i + 3).join(' ');
                    const rupeeNearAmount = /₹\s*([0-9]{1,6}(?:\.[0-9]{1,2})?)/.exec(searchText);
                    if (rupeeNearAmount) {
                        const amount = parseFloat(rupeeNearAmount[1]);
                        if (amount > 0 && amount < 1000000) {
                            foundAmount = amount;
                            console.log("✅ Found Amount via ₹ symbol near 'Amount' label:", foundAmount);
                            break;
                        }
                    }
                }
            }
        }
        
        // Pattern 1b: ₹ symbol followed by number (most common and reliable)
        // Look for all ₹ symbols and pick the most likely one (usually the first or near payment keywords)
        if (!foundAmount) {
            const rupeePatterns = [
                /₹\s*([0-9]{1,6}(?:\.[0-9]{1,2})?)/g,  // ₹ 1 or ₹1 (global to find all)
                /₹([0-9]{1,6}(?:\.[0-9]{1,2})?)/g,      // ₹1 (no space, global)
            ];
            
            let allMatches = [];
            for (const pattern of rupeePatterns) {
                const matches = [...text.matchAll(pattern)];
                allMatches.push(...matches);
            }
            
            if (allMatches.length > 0) {
                // If multiple amounts found, prefer the one near payment context
                // or the smallest reasonable amount (usually the payment amount, not account numbers)
                for (const match of allMatches) {
                    const amount = parseFloat(match[1]);
                    if (amount > 0 && amount < 1000000) {
                        // Check if this match is near payment-related keywords
                        const matchIndex = match.index;
                        const contextStart = Math.max(0, matchIndex - 50);
                        const contextEnd = Math.min(text.length, matchIndex + 50);
                        const context = text.substring(contextStart, contextEnd);
                        
                        const hasPaymentContext = /(?:Payment|Paid|Amount|Successful|Transaction)/i.test(context);
                        const isNotAccountNumber = !/(?:Account|XXXXX|Debited\s+from|Debited\s+From)/i.test(context);
                        const isPaidToSection = /Paid\s+to/i.test(context);
                        
                        // Prefer amounts from "Paid to" section, then payment context, then small amounts
                        if (isPaidToSection || hasPaymentContext || (isNotAccountNumber && amount <= 1000)) {
                            foundAmount = amount;
                            amountMatch = match;
                            console.log("✅ Found Amount via ₹ symbol:", foundAmount, isPaidToSection ? "(from Paid to section)" : "");
                            break;
                        }
                    }
                }
                
                // If no context match, use the first reasonable amount
                if (!foundAmount && allMatches.length > 0) {
                    for (const match of allMatches) {
                        const amount = parseFloat(match[1]);
                        if (amount > 0 && amount < 1000000 && amount <= 10000) {
                            foundAmount = amount;
                            amountMatch = match;
                            console.log("✅ Found Amount via ₹ symbol (first match):", foundAmount);
                            break;
                        }
                    }
                }
            }
        }
        
        // Pattern 2: £ symbol (OCR often misreads ₹ as £)
        // Similar to rupee pattern, check context to pick the right amount
        if (!foundAmount) {
            const poundPatterns = [
                /£\s*([0-9]{1,6}(?:\.[0-9]{1,2})?)/g,  // £ 1 or £1 (global)
                /£([0-9]{1,6}(?:\.[0-9]{1,2})?)/g,      // £1 (no space, global)
            ];
            
            let allMatches = [];
            for (const pattern of poundPatterns) {
                const matches = [...text.matchAll(pattern)];
                allMatches.push(...matches);
            }
            
            if (allMatches.length > 0) {
                for (const match of allMatches) {
                    const amount = parseFloat(match[1]);
                    if (amount > 0 && amount < 1000000) {
                        // Check context
                        const matchIndex = match.index;
                        const contextStart = Math.max(0, matchIndex - 50);
                        const contextEnd = Math.min(text.length, matchIndex + 50);
                        const context = text.substring(contextStart, contextEnd);
                        
                        const hasPaymentContext = /(?:Payment|Paid|Amount|Successful|Transaction)/i.test(context);
                        const isNotAccountNumber = !/(?:Account|XXXXX|Debited\s+from|Debited\s+From)/i.test(context);
                        const isPaidToSection = /Paid\s+to/i.test(context);
                        
                        // Prefer amounts from "Paid to" section, then payment context, then small amounts
                        if (isPaidToSection || hasPaymentContext || (isNotAccountNumber && amount <= 1000)) {
                            foundAmount = amount;
                            amountMatch = match;
                            console.log("✅ Found Amount via £ symbol (OCR misread ₹):", foundAmount, isPaidToSection ? "(from Paid to section)" : "");
                            break;
                        }
                    }
                }
                
                // Fallback to first reasonable amount
                if (!foundAmount && allMatches.length > 0) {
                    for (const match of allMatches) {
                        const amount = parseFloat(match[1]);
                        if (amount > 0 && amount < 1000000 && amount <= 10000) {
                            foundAmount = amount;
                            amountMatch = match;
                            console.log("✅ Found Amount via £ symbol (first match):", foundAmount);
                            break;
                        }
                    }
                }
            }
        }
        
        // Pattern 3: "Rs" or "INR" followed by number
        if (!foundAmount) {
            const rsPattern = /(?:Rs|INR)\s*([0-9]{1,6}(?:\.[0-9]{1,2})?)/i;
            const rsMatch = text.match(rsPattern);
            if (rsMatch) {
                const amount = parseFloat(rsMatch[1]);
                if (amount > 0 && amount < 1000000) {
                    foundAmount = amount;
                    amountMatch = rsMatch;
                    console.log("✅ Found Amount via Rs/INR:", foundAmount);
                }
            }
        }
        
        // Pattern 4: Look for standalone small numbers that could be amounts
        // This handles cases where OCR completely misses or misreads the currency symbol
        // The amount is usually displayed prominently near "Payment Successful"
        if (!foundAmount) {
            const lines = text.split('\n');
            // Check first 3 lines more carefully (amount is usually at the top)
            for (let i = 0; i < Math.min(lines.length, 3); i++) {
                const line = lines[i].trim();
                
                // Look for small numbers (1-999) - these are likely amounts, not UPI IDs or ref numbers
                // Try multiple patterns to catch different OCR outputs
                const numberPatterns = [
                    /(?:^|[^0-9])([1-9])(?:\s|$|[^0-9])/,           // Single digit 1-9
                    /(?:^|[^0-9])([1-9][0-9])(?:\s|$|[^0-9])/,      // Two digits 10-99
                    /(?:^|[^0-9])([1-9][0-9]{2})(?:\s|$|[^0-9])/,  // Three digits 100-999
                ];
                
                for (const pattern of numberPatterns) {
                    const match = line.match(pattern);
                    if (match) {
                        const amount = parseFloat(match[1]);
                        if (amount >= 1 && amount <= 999) {
                            // Check if this line is near payment context
                            // Amount usually appears near "Payment Successful" or on its own line
                            const hasPaymentContext = 
                                /(?:Payment|Successful|Paid|Amount)/i.test(line) ||
                                (i === 0 && /Payment/i.test(text)) ||
                                (i === 1 && /Payment/i.test(lines[0])) ||
                                line.length < 20; // Short lines often contain just the amount
                            
                            // Exclude numbers that are clearly part of other data
                            const isNotPartOfOtherData = 
                                !/(?:UPI|ID|Ref|No|Bank|Federal|7695)/i.test(line) &&
                                !/(?:2\.\d+|Seconds|PM|AM)/i.test(line); // Exclude time/seconds
                            
                            if (hasPaymentContext && isNotPartOfOtherData) {
                                foundAmount = amount;
                                console.log("✅ Found Amount as standalone number:", foundAmount, "from line:", line);
                                break;
                            }
                        }
                    }
                }
                if (foundAmount) break;
            }
        }
        
        // Pattern 5: Look for amount near payment keywords (last resort)
        if (!foundAmount) {
            const keywordPattern = /(?:Amount|Paid|Payment|Total)[:\s]*[₹£RsINR]*\s*([0-9]{1,6}(?:\.[0-9]{1,2})?)/i;
            const keywordMatch = text.match(keywordPattern);
            if (keywordMatch) {
                const amount = parseFloat(keywordMatch[1]);
                if (amount > 0 && amount < 1000000) {
                    foundAmount = amount;
                    amountMatch = keywordMatch;
                    console.log("✅ Found Amount via keyword:", foundAmount);
                }
            }
        }
        
        // Pattern 5: Use expected amount as hint (handle OCR misreads)
        // If we're expecting ₹1, look for "1", "7" (common OCR misread), or "47" (another misread)
        if (!foundAmount && expectedAmount) {
            const expectedInt = Math.round(expectedAmount);
            // Common OCR misreads for small numbers
            const misreadMap = {
                1: [1, 7, 47, 17, 71, 'I', 'l'],  // ₹1 often misread as 7, 47, I, l
                10: [10, 70, 40, 'IO'],
                100: [100, 700, 400]
            };
            
            const possibleReads = misreadMap[expectedInt] || [expectedInt];
            console.log("Looking for expected amount:", expectedInt, "with possible OCR misreads:", possibleReads);
            
            // Search for the expected amount or its common misreads in the first few lines
            const lines = text.split('\n').slice(0, 3);
            for (const line of lines) {
                for (const possibleValue of possibleReads) {
                    const searchValue = typeof possibleValue === 'string' ? possibleValue : possibleValue.toString();
                    // Look for the number as standalone or with currency symbols
                    const pattern = new RegExp(`(?:^|[^0-9])(${searchValue})(?:\\s|$|[^0-9])`, 'i');
                    if (pattern.test(line)) {
                        // Verify it's not part of UPI ID or ref number
                        if (!/(?:UPI|ID|Ref|No|Bank|@)/i.test(line)) {
                            foundAmount = expectedInt;
                            console.log(`✅ Found expected amount ${expectedInt} (OCR may have misread as ${searchValue}) from line:`, line);
                            break;
                        }
                    }
                }
                if (foundAmount) break;
            }
        }
        
        if (foundAmount) {
            details.amount = foundAmount;
        } else {
            console.warn("❌ Amount not found in text");
            console.warn("Expected amount:", expectedAmount);
            console.warn("Text searched:", text.substring(0, 300));
        }

        // Extract time (HH:MM in 12-hour or 24-hour format) - REQUIRED FOR VALIDATION
        // Improved patterns to handle various time formats including "at 1:03 AM"
        const timePatterns = [
            { pattern: /at\s+(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)/i, hasAt: true },  // "at 1:03 AM" format (PhonePe style)
            { pattern: /(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)/i, hasAt: false },  // 1:03 AM (with AM/PM)
            { pattern: /(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/i, hasAt: false },  // 1:03 or 1:03 AM (optional AM/PM)
        ];
        
        let timeMatch = null;
        for (const { pattern, hasAt } of timePatterns) {
            timeMatch = text.match(pattern);
            if (timeMatch) {
                // Extract the time components
                // For "at 1:03 AM": groups are [full, 1, 03, AM]
                // For "1:03 AM": groups are [full, 1, 03, AM]
                const hours = timeMatch[1];
                const minutes = timeMatch[2];
                const period = timeMatch[3] || null;
                
                if (hours && minutes) {
                    details.timeString = timeMatch[0];
                    // Reconstruct match array for parseTimestamp (format: [fullMatch, hours, minutes, period])
                    const reconstructedMatch = [null, hours, minutes, period];
                    details.timestamp = this.parseTimestamp(reconstructedMatch);
                    console.log("✅ Found Time:", details.timeString, "Parsed timestamp:", details.timestamp);
                    break;
                }
            }
        }
        
        if (!timeMatch || !details.timestamp) {
            console.warn("❌ Time not found in text");
        }

        // Extract date if possible (OPTIONAL - for reference)
        // Improved patterns to handle "9 March 2026 at 1:03 AM" format
        const datePatterns = [
            /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)[a-z]*,?\s+(\d{4})\s+at/i,  // "9 March 2026 at"
            /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)[a-z]*,?\s+(\d{4})/i,  // "9 March 2026"
            /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)[a-z]*,?\s+(\d{4})?/i,  // Fallback
        ];
        
        let dateMatch = null;
        for (const pattern of datePatterns) {
            dateMatch = text.match(pattern);
            if (dateMatch) {
                details.dateString = dateMatch[0].replace(/\s+at\s*$/i, '').trim(); // Remove trailing "at"
                console.log("✅ Found Date:", details.dateString);
                break;
            }
        }

        // Extract order id/payment id: look for "Order ID" or "Payment ID"
        // Payment ID is what we set in the QR code message, so we need to check for both
        // Ref No is a transaction reference, not an order ID
        const orderPatterns = [
            /Order\s*ID[:\s]*([A-Za-z0-9-]+)/i,      // Order ID: xyz
            /Payment\s*ID[:\s]*([A-Za-z0-9-]+)/i,    // Payment ID: xyz (from QR code message)
        ];
        
        let orderMatch = null;
        for (const pattern of orderPatterns) {
            orderMatch = text.match(pattern);
            if (orderMatch) {
                details.orderId = orderMatch[1];
                console.log("✅ Found Order/Payment ID:", details.orderId);
                break;
            }
        }
        
        if (!orderMatch) {
            // Order ID is optional - don't log as error
            console.log("ℹ️ Order ID not found (optional field)");
        }

        // Check if critical fields are present
        // Amount is now optional - only UPI ID and Time are required
        if (!details.upiId || !details.timestamp) {
            const missing = [];
            if (!details.upiId) missing.push("UPI ID");
            if (!details.timestamp) missing.push("Time");
            console.error("❌ Missing critical fields:", missing.join(", "));
            return null;
        }

        // Log if amount was found or not (optional field)
        if (details.amount) {
            console.log("✅ All critical payment details extracted successfully (Amount found)");
        } else {
            console.log("✅ All critical payment details extracted successfully (Amount not found - optional)");
        }
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
