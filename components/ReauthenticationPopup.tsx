import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  TextInput,
  ActivityIndicator
} from 'react-native';
import authService from '../services/authService';

interface ReauthenticationPopupProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  colors: any;
  userEmail?: string;
  authProvider?: string;
}

export const ReauthenticationPopup: React.FC<ReauthenticationPopupProps> = ({
  visible,
  onSuccess,
  onCancel,
  colors,
  userEmail,
  authProvider,
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset form when popup opens
  useEffect(() => {
    if (visible) {
      setPassword('');
      setErrorMessage(null);
    }
  }, [visible]);

  const handleEmailReauth = async () => {
    if (!password.trim()) {
      setErrorMessage('Please enter your password');
      return;
    }

    if (!userEmail) {
      setErrorMessage('User email not found');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log('=== REAUTHENTICATION POPUP - EMAIL REAUTH ===');
      console.log('User email from props:', userEmail);
      console.log('Password length:', password.length);
      
      const result = await authService.reauthenticateWithEmail(userEmail, password);
      
      console.log('Reauthentication result:', result);
      
      if (result.success) {
        console.log('✅ Email reauthentication successful');
        onSuccess();
      } else {
        console.error('❌ Reauthentication failed:', result.error);
        setErrorMessage(result.error || 'Incorrect password');
      }
    } catch (error: any) {
      console.error('❌ Email reauthentication error:', error);
      setErrorMessage('Reauthentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleReauth = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log('=== REAUTHENTICATION POPUP - GOOGLE REAUTH ===');
      console.log('Auth provider:', authProvider);
      
      const result = await authService.reauthenticateWithGoogle();
      
      console.log('Google reauthentication result:', result);
      
      if (result.success) {
        console.log('✅ Google reauthentication successful');
        onSuccess();
      } else {
        console.error('❌ Google reauthentication failed:', result.error);
        setErrorMessage(result.error || 'Google reauthentication failed');
      }
    } catch (error: any) {
      console.error('❌ Google reauthentication error:', error);
      setErrorMessage('Google reauthentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPassword('');
    setErrorMessage(null);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.popup, { backgroundColor: colors.surface }]}>
          {/* Security Icon */}
          <View style={[styles.securityIcon, { backgroundColor: colors.primary }]}>
            <Text style={styles.securityText}>🔒</Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            Confirm Your Identity
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            For security reasons, please confirm your identity to delete your account.
          </Text>

          {/* User Email Display */}
          {userEmail && (
            <View style={styles.emailContainer}>
              <Text style={[styles.emailLabel, { color: colors.textSecondary }]}>
                Account: {userEmail}
              </Text>
            </View>
          )}

          {/* Password Input for Email Users */}
          {authProvider === 'password' && (
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Enter your password
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text
                }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                editable={!isLoading}
                autoFocus
              />
            </View>
          )}

          {/* Error Message */}
          {errorMessage && (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.input }]}
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            {authProvider === 'password' ? (
              <TouchableOpacity
                style={[styles.button, styles.confirmButton, { backgroundColor: colors.primary }]}
                onPress={handleEmailReauth}
                disabled={isLoading || !password.trim()}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    Confirm
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.confirmButton, { backgroundColor: colors.primary }]}
                onPress={handleGoogleReauth}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    Sign in with Google
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  popup: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  securityIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  securityText: {
    fontSize: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  emailContainer: {
    width: '100%',
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  emailLabel: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.3)',
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  confirmButton: {
    // Primary background is set via backgroundColor prop
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
