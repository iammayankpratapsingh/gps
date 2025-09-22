import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import authService, { UserData } from '../services/authService';
import { useStatusBar } from '../hooks/useStatusBar';

const { width, height } = Dimensions.get('window');

interface AuthScreenProps {
  onLogin: (userData: UserData) => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  // Professional status bar for auth screen
  useStatusBar({ 
    colors: { 
      header: '#0097b2', 
      text: '#ffffff',
      background: '#0097b2',
      primary: '#0097b2',
      surface: '#ffffff',
      input: '#f3f4f6',
      border: '#d1d5db',
      textSecondary: '#6b7280',
      error: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b',
      drawer: '#0097b2',
      drawerText: '#ffffff',
      buttonText: '#ffffff',
      card: '#ffffff',
      borderLight: '#e5e7eb',
      button: '#0097b2',
      inputBorder: '#d1d5db',
      headerText: '#ffffff'
    }, 
    animated: true 
  });
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }

      if (!phoneNumber.trim()) {
        newErrors.phoneNumber = 'Phone number is required';
      } else if (!/^[0-9]{10}$/.test(phoneNumber.replace(/\D/g, ''))) {
        newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
      }

      if (!confirmPassword.trim()) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      let result;
      if (isLogin) {
        result = await authService.signInUser(email, password);
      } else {
        result = await authService.registerUser(fullName, email, phoneNumber, password);
      }

      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        if (result.error?.message?.includes('password') || result.error?.message?.includes('credential')) {
          setErrors({ password: 'Wrong password. Please try again.' });
        } else {
          setErrors({ general: result.error?.message || 'Authentication failed. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrors({});
    
    try {
      console.log('Attempting Google Sign-In...');
      const result = await authService.signInWithGoogle();
      
      if (result.success && result.user) {
        console.log('Google Sign-In successful, calling onLogin');
        onLogin(result.user);
      } else {
        console.log('Google Sign-In failed:', result.error?.message);
        setErrors({ general: result.error?.message || 'Google Sign-In failed. Please try again.' });
      }
    } catch (error) {
      console.error('Unexpected error in Google Sign-In:', error);
      setErrors({ general: 'An unexpected error occurred during Google Sign-In. Please try again.' });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setFullName('');
    setPhoneNumber('');
    setConfirmPassword('');
    setErrors({});
    setIsLoading(false);
    setIsGoogleLoading(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRememberMe(false);
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Blue Background with Grid Pattern - Exact Match to Image */}
      <View style={styles.backgroundPattern}>
        {/* Grid lines */}
        <View style={styles.gridLine1} />
        <View style={styles.gridLine2} />
        <View style={styles.gridLine3} />
        <View style={styles.gridLine4} />
        <View style={styles.gridLine5} />
        <View style={styles.gridLine6} />
        
        {/* Dots pattern - scattered white dots */}
        <View style={styles.dot1} />
        <View style={styles.dot2} />
        <View style={styles.dot3} />
        <View style={styles.dot4} />
        <View style={styles.dot5} />
        <View style={styles.dot6} />
        <View style={styles.dot7} />
        <View style={styles.dot8} />
        <View style={styles.dot9} />
        <View style={styles.dot10} />
        <View style={styles.dot11} />
        <View style={styles.dot12} />
        <View style={styles.dot13} />
        <View style={styles.dot14} />
        <View style={styles.dot15} />
        <View style={styles.dot16} />
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Icon name="location-on" size={30} color="#ffffff" />
              </View>
            </View>
            <Text style={styles.title}>
              {isLogin ? 'Sign in to your Account' : 'Sign Up'}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin 
                ? 'Enter your email and password to log in' 
                : 'Already have an account? Log In'
              }
            </Text>
            {!isLogin && (
              <TouchableOpacity onPress={toggleMode} style={styles.loginLink}>
                <Text style={styles.loginLinkText}>Log In</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Google Sign-In Button */}
            <TouchableOpacity 
              style={[styles.googleButton, isGoogleLoading && styles.googleButtonDisabled]} 
              onPress={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <ActivityIndicator color="#333" />
              ) : (
                <>
                  <View style={styles.googleIconContainer}>
                    <Text style={styles.googleIconText}>G</Text>
                  </View>
                  <Text style={styles.googleButtonText}>
                    {isLogin ? 'Continue with Google' : 'Sign up with Google'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Separator */}
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>Or login with</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Full Name (Signup only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, errors.fullName && styles.inputError]}
                  placeholder="Full Name"
                  placeholderTextColor="#999999"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    clearError('fullName');
                  }}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
              </View>
            )}

            {/* Email */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Email"
                placeholderTextColor="#999999"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearError('email');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Phone Number (Signup only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, errors.phoneNumber && styles.inputError]}
                  placeholder="Phone Number"
                  placeholderTextColor="#999999"
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text);
                    clearError('phoneNumber');
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
              </View>
            )}

            {/* Password */}
            <View style={styles.inputContainer}>
              <View style={[styles.passwordContainer, errors.password && styles.passwordContainerError]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="#999999"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError('password');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon 
                    name={showPassword ? "visibility" : "visibility-off"} 
                    size={20} 
                    color="#666666" 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirm Password (Signup only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <View style={[styles.passwordContainer, errors.confirmPassword && styles.passwordContainerError]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm Password"
                    placeholderTextColor="#999999"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      clearError('confirmPassword');
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Icon 
                      name={showConfirmPassword ? "visibility" : "visibility-off"} 
                      size={20} 
                      color="#666666" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>
            )}

            {/* Remember Me and Forgot Password (Login only) */}
            {isLogin && (
              <View style={styles.optionsRow}>
                <TouchableOpacity 
                  style={styles.rememberMeContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <Icon name="check" size={12} color="#ffffff" />}
                  </View>
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* General Error */}
            {errors.general && (
              <View style={styles.generalErrorContainer}>
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
              onPress={handleAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? 'Log In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link (Login only) */}
            {isLogin && (
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={toggleMode}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0097b2',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  // Grid lines - exact match to image
  gridLine1: {
    position: 'absolute',
    top: '10%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  gridLine2: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  gridLine3: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  gridLine4: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  gridLine5: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  gridLine6: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  // Dots pattern - scattered white dots like stars
  dot1: {
    position: 'absolute',
    top: '8%',
    left: '5%',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  dot2: {
    position: 'absolute',
    top: '12%',
    right: '8%',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dot3: {
    position: 'absolute',
    top: '18%',
    left: '15%',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  dot4: {
    position: 'absolute',
    top: '22%',
    right: '20%',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dot5: {
    position: 'absolute',
    top: '28%',
    left: '8%',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  dot6: {
    position: 'absolute',
    top: '32%',
    right: '12%',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dot7: {
    position: 'absolute',
    top: '38%',
    left: '25%',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  dot8: {
    position: 'absolute',
    top: '42%',
    right: '5%',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dot9: {
    position: 'absolute',
    top: '48%',
    left: '12%',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  dot10: {
    position: 'absolute',
    top: '52%',
    right: '18%',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dot11: {
    position: 'absolute',
    top: '58%',
    left: '6%',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  dot12: {
    position: 'absolute',
    top: '62%',
    right: '25%',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dot13: {
    position: 'absolute',
    top: '68%',
    left: '20%',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  dot14: {
    position: 'absolute',
    top: '72%',
    right: '10%',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dot15: {
    position: 'absolute',
    top: '78%',
    left: '10%',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  dot16: {
    position: 'absolute',
    top: '82%',
    right: '15%',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  keyboardContainer: {
    flex: 1,
    zIndex: 2,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
    textAlign: 'center',
  },
  loginLink: {
    marginTop: 10,
  },
  loginLinkText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 20,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  googleButtonDisabled: {
    backgroundColor: '#f8f9fa',
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  googleButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '500',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e5e9',
  },
  separatorText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#333333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    borderWidth: 0,
  },
  eyeIcon: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  passwordContainerError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0097b2',
    borderColor: '#0097b2',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  forgotPassword: {
    padding: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#0097b2',
    fontWeight: '500',
  },
  generalErrorContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  generalErrorText: {
    color: '#721c24',
    fontSize: 14,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#0097b2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#666666',
  },
  signupLink: {
    fontSize: 14,
    color: '#0097b2',
    fontWeight: '600',
  },
});