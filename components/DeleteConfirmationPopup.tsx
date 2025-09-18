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

interface DeleteConfirmationPopupProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  colors: any;
  isLoading?: boolean;
  errorMessage?: string;
}

export const DeleteConfirmationPopup: React.FC<DeleteConfirmationPopupProps> = ({
  visible,
  onConfirm,
  onCancel,
  colors,
  isLoading = false,
  errorMessage,
}) => {
  const [deleteText, setDeleteText] = useState('');
  const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(null);

  // Reset form when popup opens
  useEffect(() => {
    if (visible) {
      setDeleteText('');
      setLocalErrorMessage(null);
    }
  }, [visible]);

  const handleConfirm = () => {
    if (deleteText.trim().toUpperCase() !== 'DELETE') {
      setLocalErrorMessage('Please type "DELETE" to confirm');
      return;
    }
    onConfirm();
  };

  const handleCancel = () => {
    setDeleteText('');
    setLocalErrorMessage(null);
    onCancel();
  };

  const isDeleteTextValid = deleteText.trim().toUpperCase() === 'DELETE';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.popup, { backgroundColor: colors.surface }]}>
          {/* Warning Icon */}
          <View style={[styles.warningIcon, { backgroundColor: colors.error }]}>
            <Text style={styles.warningText}>⚠</Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            Final Confirmation
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            This action cannot be undone. Type <Text style={{ fontWeight: 'bold', color: colors.error }}>DELETE</Text> to confirm account deletion.
          </Text>

          {/* Type DELETE Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Type "DELETE" to confirm
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.input,
                borderColor: isDeleteTextValid ? colors.error : colors.border,
                color: colors.text
              }]}
              value={deleteText}
              onChangeText={setDeleteText}
              placeholder="Type DELETE here"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              editable={!isLoading}
              autoFocus
            />
          </View>

          {/* Error Message */}
          {(localErrorMessage || errorMessage) && (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {localErrorMessage || errorMessage}
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

            <TouchableOpacity
              style={[
                styles.button, 
                styles.confirmButton, 
                { 
                  backgroundColor: isDeleteTextValid ? colors.error : colors.textSecondary,
                  opacity: isDeleteTextValid ? 1 : 0.5
                }
              ]}
              onPress={handleConfirm}
              disabled={isLoading || !isDeleteTextValid}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  Delete Account
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Retry Button (shown when there's an error) */}
          {errorMessage && !isLoading && (
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={handleConfirm}
            >
              <Text style={[styles.retryButtonText, { color: 'white' }]}>Retry Delete</Text>
            </TouchableOpacity>
          )}
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
  warningIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
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
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  confirmButton: {
    // Background color is set via backgroundColor prop
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
  retryButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
