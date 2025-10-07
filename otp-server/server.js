const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting: Allow more requests per IP (100 per 15 minutes)
// But we'll enforce 5 OTPs per email separately
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Allow more requests per IP
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Store OTPs temporarily (in production, use Redis or database)
const otpStorage = new Map();
const emailOtpCounts = new Map(); // Track OTP count per email

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStorage.entries()) {
    if (now - data.timestamp > 5 * 60 * 1000) { // 5 minutes
      otpStorage.delete(email);
      console.log(`Cleaned up expired OTP for ${email}`);
    }
  }
  // Note: We don't reset emailOtpCounts here to maintain the 5-per-email limit
}, 5 * 60 * 1000);

// Generate 4-digit OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Send OTP endpoint
app.post('/api/send-otp', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Check if email has already used 5 OTPs
    const emailCount = emailOtpCounts.get(email) || 0;
    if (emailCount >= 5) {
      return res.status(429).json({
        success: false,
        error: 'Maximum OTP limit reached for this email. Please try again later.',
        otpsRemaining: 0
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with timestamp
    otpStorage.set(email, {
      otp,
      timestamp: Date.now(),
      attempts: 0
    });

    // Increment email OTP count
    emailOtpCounts.set(email, emailCount + 1);

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0097b2;">Email Verification</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #0097b2; font-size: 32px; margin: 0; letter-spacing: 8px;">${otp}</h1>
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`OTP sent to ${email}: ${otp}`);
    console.log(`OTP count for ${email}: ${emailCount + 1}/5`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      otpsRemaining: 5 - (emailCount + 1)
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP. Please try again.'
    });
  }
});

// Verify OTP endpoint
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required'
      });
    }

    const storedData = otpStorage.get(email);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        error: 'OTP not found or expired. Please request a new OTP.'
      });
    }

    // Check if OTP is expired (5 minutes)
    if (Date.now() - storedData.timestamp > 5 * 60 * 1000) {
      otpStorage.delete(email);
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new OTP.'
      });
    }

    // Check attempts (max 3 attempts per OTP)
    if (storedData.attempts >= 3) {
      otpStorage.delete(email);
      return res.status(400).json({
        success: false,
        error: 'Too many incorrect attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts++;
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP. Please try again.'
      });
    }

    // OTP is correct
    otpStorage.delete(email);
    console.log(`OTP verified successfully for ${email}`);

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP. Please try again.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'OTP Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OTP Server running on port ${PORT}`);
  console.log(`📧 Email service: ${process.env.EMAIL_USER || 'your-email@gmail.com'}`);
  console.log(`⏱️  Rate limiting: 100 requests per 15 minutes per IP`);
  console.log(`📊 Per-email limit: 5 OTPs per email address`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
