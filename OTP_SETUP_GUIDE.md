# GPS App OTP System - Complete Setup Guide

## 🚀 Quick Start

### 1. Backend Server Setup

```bash
# Navigate to OTP server directory
cd otp-server

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your Gmail credentials
# GMAIL_USER=your-email@gmail.com
# GMAIL_APP_PASSWORD=your-app-password

# Start the server
npm start
```

### 2. Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" as the app
   - Copy the generated password
3. **Update .env file** with your credentials

### 3. ngrok Setup (For Mobile Testing)

```bash
# Install ngrok globally
npm install -g ngrok

# Start ngrok tunnel
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update SERVER_URL in EmailVerification.tsx
```

### 4. Update Frontend Configuration

In `components/EmailVerification.tsx`, update the SERVER_URL:

```typescript
// Replace with your ngrok URL
const SERVER_URL = 'https://your-ngrok-url.ngrok.io';
```

## 📱 How It Works

### User Flow:
1. **User enters email** in signup form
2. **Clicks "Verify Email"** button
3. **OTP screen appears** with 4-digit input
4. **OTP sent via email** with 5-minute expiration
5. **User enters OTP** and clicks Verify
6. **Account created** after successful verification

### Features Implemented:
- ✅ **4-digit OTP generation**
- ✅ **Email sending via Gmail SMTP**
- ✅ **5-minute OTP expiration**
- ✅ **1 min 30 sec regeneration cooldown**
- ✅ **3 attempts per day limit**
- ✅ **Rate limiting and security**
- ✅ **Auto-submit on 4 digits**
- ✅ **Visual feedback and animations**
- ✅ **Error handling and validation**

## 🔧 API Endpoints

### Send OTP
```
POST /api/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Verify OTP
```
POST /api/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "1234"
}
```

### Check Status
```
GET /api/verify-status/:email
```

## 🎯 Testing

### Test Email Format:
The email sent will look like:
```
Subject: GPS App - Email Verification OTP

Your OTP is: 1234
Valid until: 12:05 PM

This OTP will expire in 5 minutes. Do not share this code with anyone.
```

### Test Scenarios:
1. **Valid email** → OTP sent successfully
2. **Invalid email** → Error message shown
3. **Wrong OTP** → Error with attempts remaining
4. **Expired OTP** → Error message to request new OTP
5. **Rate limit** → Error after 3 attempts per day

## 🚨 Important Notes

1. **Never commit .env file** with real credentials
2. **Use App Password**, not regular Gmail password
3. **Update ngrok URL** when tunnel restarts
4. **Test on mobile device** for full functionality
5. **Check Gmail spam folder** if OTP not received

## 🔍 Troubleshooting

### Common Issues:
- **"Failed to send OTP"** → Check Gmail credentials
- **"Network error"** → Check ngrok URL and server status
- **"OTP not received"** → Check spam folder, verify email
- **"Too many requests"** → Wait 24 hours or restart server

### Debug Steps:
1. Check server logs: `npm start`
2. Verify ngrok tunnel: `ngrok http 3000`
3. Test API directly: Use Postman or curl
4. Check React Native logs: `npx react-native log-android`

## 📋 Next Steps

1. **Deploy backend** to cloud service (Heroku, AWS, etc.)
2. **Add database** for production OTP storage
3. **Implement SMS backup** for OTP delivery
4. **Add more security** features (IP whitelisting, etc.)
5. **Create admin panel** for OTP management

---

**🎉 Your OTP verification system is now ready!**
