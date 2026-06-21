# Deployment Instructions for Fixing X-Frame-Options Error

## Problem
The payment page is being blocked from loading in an iframe due to `X-Frame-Options: sameorigin` header.

## Solution
Two `.htaccess` files have been updated to allow iframe embedding. You need to deploy **BOTH** files to your Hostinger server.

## Files to Deploy

### File 1: Root `.htaccess`
**Location:** `D:\funz\qr-payment-hostinger\.htaccess`

**Deploy to:** Root directory of `payment.itechvertical.in` (or `/payment/` directory)

### File 2: Public `.htaccess` (IMPORTANT - This was the culprit!)
**Location:** `D:\funz\qr-payment-hostinger\public\.htaccess`

**Deploy to:** `public/` directory on your server (or wherever your built files are)

## Deployment Steps

### Option 1: Using Hostinger File Manager

1. **Log into Hostinger Control Panel**
   - Go to your hosting account
   - Open File Manager

2. **Navigate to your payment site directory**
   - Find where `payment.itechvertical.in` is hosted
   - Usually in `/public_html/` or `/payment/` or similar

3. **Upload/Replace `.htaccess` files:**
   - Upload `D:\funz\qr-payment-hostinger\.htaccess` to the root directory
   - Upload `D:\funz\qr-payment-hostinger\public\.htaccess` to the `public/` directory (if it exists)

4. **Verify file permissions:**
   - `.htaccess` files should have permissions `644` or `755`
   - Make sure they're readable by the web server

### Option 2: Using FTP/SFTP

1. **Connect to your server via FTP**
   - Use FileZilla, WinSCP, or similar
   - Connect to `payment.itechvertical.in`

2. **Upload both files:**
   ```bash
   # Upload root .htaccess
   D:\funz\qr-payment-hostinger\.htaccess → /public_html/.htaccess
   
   # Upload public .htaccess (if public directory exists)
   D:\funz\qr-payment-hostinger\public\.htaccess → /public_html/public/.htaccess
   ```

3. **Set correct permissions:**
   - Right-click files → Properties → Set to `644`

## Verification

After deploying, verify the headers are correct:

### Method 1: Browser DevTools
1. Open `https://payment.itechvertical.in/index.html` in browser
2. Press F12 → Network tab
3. Reload page
4. Click on `index.html` request
5. Check Response Headers:
   - ✅ Should see: `Content-Security-Policy: frame-ancestors *`
   - ❌ Should NOT see: `X-Frame-Options: sameorigin`

### Method 2: PowerShell/Command Line
```powershell
$response = Invoke-WebRequest -Uri "https://payment.itechvertical.in/index.html" -Method Head
$response.Headers

# Check for:
# - Content-Security-Policy: frame-ancestors *
# - No X-Frame-Options header
```

### Method 3: Online Header Checker
Use tools like:
- https://securityheaders.com/
- https://observatory.mozilla.org/

Enter your URL and check the headers.

## Important Notes

1. **Both files must be deployed** - The `public/.htaccess` file was the one causing the issue
2. **Clear browser cache** - After deployment, clear your browser cache or use incognito mode
3. **Wait a few minutes** - Server changes may take 1-5 minutes to propagate
4. **Check server logs** - If it still doesn't work, check Apache error logs

## If It Still Doesn't Work

### Check 1: Server-Level Configuration
Some hosting providers set headers at the server level. Contact Hostinger support and ask them to:
- Remove `X-Frame-Options: sameorigin` header
- Add `Content-Security-Policy: frame-ancestors *` header

### Check 2: mod_headers Module
The `.htaccess` file requires `mod_headers` to be enabled. Contact Hostinger support to verify it's enabled.

### Check 3: Multiple .htaccess Files
Check if there are other `.htaccess` files in parent directories that might be overriding your settings.

### Check 4: Application Code
If you're using PHP or other server-side code, check if headers are being set in the code itself (e.g., `header('X-Frame-Options: sameorigin')`).

## Testing After Deployment

1. ✅ **Test iframe loading:**
   - Open your Flutter web app
   - Navigate to payment screen
   - Check browser console - should NOT see "refused to connect"
   - Iframe should display the payment page

2. ✅ **Test URL parameters:**
   - Open: `https://payment.itechvertical.in/index.html?userId=test&amount=100`
   - Should load and show QR code with amount ₹100

3. ✅ **Test postMessage:**
   - Check browser console for "postMessage sent successfully"
   - Should not see postMessage errors

## Quick Checklist

- [ ] Root `.htaccess` file uploaded to server
- [ ] Public `.htaccess` file uploaded to server (if public directory exists)
- [ ] File permissions set correctly (644 or 755)
- [ ] Headers verified using browser DevTools or command line
- [ ] Browser cache cleared
- [ ] Tested in Flutter web app - iframe loads successfully
- [ ] No X-Frame-Options errors in browser console

## Support

If you continue to have issues after deploying both files:
1. Check Hostinger server logs
2. Contact Hostinger support with the error message
3. Ask them to verify `mod_headers` is enabled
4. Ask them to check for server-level header configuration
