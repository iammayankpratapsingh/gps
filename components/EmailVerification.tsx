import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

interface EmailVerificationProps {
  email: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    success: string;
    border: string;
  };
}

interface OTPResponse {
  success: boolean;
  message?: string;
  error?: string;
  expiresAt?: string;
  canRegenerate?: boolean;
  attemptsRemaining?: number;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerificationSuccess,
  onBack,
  colors,
}) => {
  // State management
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [canRegenerate, setCanRegenerate] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

  // Refs
  const otpInputRef = useRef<TextInput>(null);
  const checkmarkAnimation = useRef(new Animated.Value(0)).current;

  // Server URL - Using your ngrok URL
  const SERVER_URL = 'https://maire-unflouted-sharee.ngrok-free.dev';

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setCanRegenerate(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRemaining]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Send OTP function
  const sendOTP = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${SERVER_URL}/api/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ email }),
      });

      const data: OTPResponse = await response.json();

      if (data.success) {
        // Calculate time remaining (5 minutes = 300 seconds)
        setTimeRemaining(300);
        setCanRegenerate(false);
        Alert.alert('OTP Sent', `A 4-digit OTP has been sent to ${email}`);
      } else {
        setErrorMessage(data.error || 'Failed to send OTP');
        if (data.canRegenerate) {
          setCanRegenerate(true);
        }
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setErrorMessage('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP function
  const verifyOTP = async () => {
    if (otp.length !== 4) {
      setErrorMessage('Please enter a 4-digit OTP');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${SERVER_URL}/api/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data: OTPResponse = await response.json();

      if (data.success) {
        setIsVerified(true);
        setErrorMessage('');
        
        // Animate checkmark
        Animated.spring(checkmarkAnimation, {
          toValue: 1,
          useNativeDriver: true,
        }).start();

        // Call success callback after animation
        setTimeout(() => {
          onVerificationSuccess();
        }, 1500);
      } else {
        setErrorMessage(data.error || 'Invalid OTP');
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        setOtp(''); // Clear OTP on error
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setErrorMessage('Network error. Please check your connection.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (text: string) => {
    // Only allow digits and limit to 4 characters
    const cleanText = text.replace(/[^0-9]/g, '').slice(0, 4);
    setOtp(cleanText);
    setErrorMessage('');

    // Auto-submit when 4 digits are entered
    if (cleanText.length === 4) {
      verifyOTP();
    }
  };

  // Regenerate OTP
  const regenerateOTP = () => {
    if (canRegenerate) {
      sendOTP();
    }
  };

  // Auto-focus OTP input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      otpInputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Email Verification
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Email Display */}
        <View style={[styles.emailContainer, { backgroundColor: colors.surface }]}>
          <Icon name="email" size={20} color={colors.primary} />
          <Text style={[styles.emailText, { color: colors.text }]}>{email}</Text>
        </View>

        {/* Instructions */}
        <Text style={[styles.instructions, { color: colors.textSecondary }]}>
          We've sent a 4-digit verification code to your email address.
        </Text>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          <TextInput
            ref={otpInputRef}
            style={[
              styles.otpInput,
              {
                backgroundColor: colors.surface,
                borderColor: errorMessage ? colors.error : colors.border,
                color: colors.text,
              },
            ]}
            value={otp}
            onChangeText={handleOtpChange}
            placeholder="0000"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            maxLength={4}
            textAlign="center"
            editable={!isVerified}
          />
          
          {/* Checkmark Animation */}
          {isVerified && (
            <Animated.View
              style={[
                styles.checkmarkContainer,
                {
                  transform: [
                    {
                      scale: checkmarkAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Icon name="check-circle" size={32} color={colors.success} />
            </Animated.View>
          )}
        </View>

        {/* Error Message */}
        {errorMessage ? (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errorMessage}
          </Text>
        ) : null}

        {/* Timer */}
        {timeRemaining > 0 && (
          <Text style={[styles.timerText, { color: colors.textSecondary }]}>
            OTP expires in: {formatTime(timeRemaining)}
          </Text>
        )}

        {/* Regenerate Button */}
        {canRegenerate && !isVerified && (
          <TouchableOpacity
            style={[styles.regenerateButton, { borderColor: colors.primary }]}
            onPress={regenerateOTP}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Icon name="refresh" size={16} color={colors.primary} />
                <Text style={[styles.regenerateText, { color: colors.primary }]}>
                  Resend OTP
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Verify Button */}
        {!isVerified && (
          <TouchableOpacity
            style={[
              styles.verifyButton,
              {
                backgroundColor: otp.length === 4 ? colors.primary : colors.border,
              },
            ]}
            onPress={verifyOTP}
            disabled={otp.length !== 4 || isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Icon name="verified" size={20} color="white" />
                <Text style={styles.verifyButtonText}>Verify</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Success Message */}
        {isVerified && (
          <View style={styles.successContainer}>
            <Text style={[styles.successText, { color: colors.success }]}>
              ✅ Email verified successfully!
            </Text>
            <Text style={[styles.successSubtext, { color: colors.textSecondary }]}>
              You can now create your account.
            </Text>
          </View>
        )}

        {/* Attempts Remaining */}
        {attemptsRemaining < 3 && !isVerified && (
          <Text style={[styles.attemptsText, { color: colors.textSecondary }]}>
            Attempts remaining: {attemptsRemaining}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  emailText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  otpContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  otpInput: {
    width: 120,
    height: 60,
    borderWidth: 2,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 8,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: -40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  timerText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 24,
  },
  regenerateText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  attemptsText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default EmailVerification;
