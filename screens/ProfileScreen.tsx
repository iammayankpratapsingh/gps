import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import authService, { UserData } from '../services/authService';
import themeService, { ThemeColors } from '../services/themeService';
import { useStatusBar } from '../hooks/useStatusBar';

const { width, height } = Dimensions.get('window');

interface ProfileScreenProps {
  userData: UserData;
  onBack: () => void;
  onUpdateProfile: (updatedUserData: UserData) => void;
}

export default function ProfileScreen({ userData, onBack, onUpdateProfile }: ProfileScreenProps) {
  const { t } = useTranslation('common');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(userData.profileImageUrl || null);
  const [editedData, setEditedData] = useState({
    fullName: userData.fullName,
    email: userData.email,
    phoneNumber: userData.phoneNumber,
  });
  
  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Error message states
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  
  // Theme states
  const [colors, setColors] = useState<ThemeColors>(themeService.getColors());

  // Function to show error message with auto-hide
  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowError(false);
      setErrorMessage('');
    }, 5000);
  };

  // Theme subscription effect
  useEffect(() => {
    const unsubscribe = themeService.subscribe(() => {
      setColors(themeService.getColors());
    });
    return unsubscribe;
  }, []);
  
  // Professional status bar that matches header color
  useStatusBar({ colors, animated: true });

  // Auto-hide error message effect
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false);
        setErrorMessage('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showError]);

  const handleChangePhoto = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant camera roll permissions to change your profile photo.');
        return;
      }

      // Show action sheet
      Alert.alert(
        'Change Profile Photo',
        'Choose an option',
        [
          { text: 'Camera', onPress: () => takePhotoWithCamera() },
          { text: 'Photo Library', onPress: () => selectFromGallery() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to access camera or photo library.');
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant camera permissions to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const selectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image.');
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    setIsLoading(true);
    try {
      const result = await authService.uploadProfileImage(userData.uid, imageUri);
      if (result.success && result.url) {
        setProfileImage(result.url);
        // Update user data with new profile image URL
        const updatedUserData = { ...userData, profileImageUrl: result.url };
        onUpdateProfile(updatedUserData);
        Alert.alert('Success', 'Profile photo updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to upload profile photo.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload profile photo.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Update user data in database
      const result = await authService.updateUserProfile(userData.uid, {
        fullName: editedData.fullName,
        email: editedData.email,
        phoneNumber: editedData.phoneNumber,
      });

      if (result.success) {
        // Update local user data
        const updatedUserData = {
          ...userData,
          fullName: editedData.fullName,
          email: editedData.email,
          phoneNumber: editedData.phoneNumber,
        };
        
        onUpdateProfile(updatedUserData);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', result.error?.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = () => {
    // Check user's authentication method
    const authProvider = authService.getUserAuthProvider();
    
    if (authProvider === 'google') {
      // Show error message for Google users
      showErrorMessage('You need to change your password from your Google account settings.');
    } else if (authProvider === 'password') {
      // Show password change modal for email/password users
      setShowPasswordModal(true);
    } else {
      // Fallback for unknown providers
      showErrorMessage('Password change is not available for your account type.');
    }
  };

  const handlePasswordChange = async () => {
    // Validate passwords
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password.');
      return;
    }
    
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password.');
      return;
    }
    
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    
    try {
      const result = await authService.changePassword(currentPassword, newPassword);
      
      if (result.success) {
        Alert.alert('Success', 'Password changed successfully!');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', result.error || 'Failed to change password.');
      }
    } catch (error) {
      console.error('Password change error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Error Message Banner */}
      {showError && (
        <View style={[styles.errorBanner, { backgroundColor: colors.error }]}>
          <Text style={styles.errorBannerText}>{errorMessage}</Text>
        </View>
      )}
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={[styles.backIcon, { color: colors.buttonText }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.buttonText }]}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photo Section */}
        <View style={[styles.profileSection, { backgroundColor: colors.primary }]}>
          <TouchableOpacity style={styles.profileImageContainer} onPress={handleChangePhoto}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.buttonText }]}>
                <Text style={[styles.profileImageText, { color: colors.primary }]}>
                  {userData.fullName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={[styles.editIconContainer, { backgroundColor: colors.buttonText, borderColor: colors.primary }]}>
              <Text style={styles.editIcon}>✏️</Text>
            </View>
          </TouchableOpacity>
          <Text style={[styles.userName, { color: colors.buttonText }]}>{userData.fullName}</Text>
        </View>

        {/* User Information Fields */}
        <View style={[styles.fieldsContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Login Id</Text>
            <TextInput
              style={[
                styles.fieldInput, 
                styles.readOnlyField,
                { 
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.textSecondary
                }
              ]}
              value={userData.loginId}
              editable={false}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Display Name</Text>
            <TextInput
              style={[
                styles.fieldInput, 
                !isEditing && styles.readOnlyField,
                { 
                  backgroundColor: isEditing ? colors.input : colors.input,
                  borderColor: colors.border,
                  color: colors.text
                }
              ]}
              value={editedData.fullName}
              onChangeText={(text) => setEditedData(prev => ({ ...prev, fullName: text }))}
              editable={isEditing}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Email Id</Text>
            <TextInput
              style={[
                styles.fieldInput, 
                !isEditing && styles.readOnlyField,
                { 
                  backgroundColor: isEditing ? colors.input : colors.input,
                  borderColor: colors.border,
                  color: colors.text
                }
              ]}
              value={editedData.email}
              onChangeText={(text) => setEditedData(prev => ({ ...prev, email: text }))}
              editable={isEditing}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Phone Number</Text>
            <TextInput
              style={[
                styles.fieldInput, 
                !isEditing && styles.readOnlyField,
                { 
                  backgroundColor: isEditing ? colors.input : colors.input,
                  borderColor: colors.border,
                  color: colors.text
                }
              ]}
              value={editedData.phoneNumber}
              onChangeText={(text) => setEditedData(prev => ({ ...prev, phoneNumber: text }))}
              editable={isEditing}
              keyboardType="phone-pad"
              placeholder={userData.phoneNumber ? undefined : t('enterPhoneNumber')}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Role</Text>
            <TextInput
              style={[
                styles.fieldInput, 
                styles.readOnlyField,
                { 
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.textSecondary
                }
              ]}
              value={t('endUser')}
              editable={false}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.changePasswordButton, { backgroundColor: colors.primary }]} 
            onPress={handleChangePassword}
          >
            <Text style={[styles.buttonText, { color: colors.buttonText }]}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: colors.primary }]} 
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.buttonText} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                {isEditing ? 'Save' : 'Edit'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closePasswordModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Change Password</Text>
            
            <TextInput
              style={[
                styles.modalInput,
                { 
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text
                }
              ]}
              placeholder={t('currentPassword')}
              placeholderTextColor={colors.textSecondary}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={true}
            />
            
            <TextInput
              style={[
                styles.modalInput,
                { 
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text
                }
              ]}
              placeholder={t('newPassword')}
              placeholderTextColor={colors.textSecondary}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={true}
            />
            
            <TextInput
              style={[
                styles.modalInput,
                { 
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text
                }
              ]}
              placeholder={t('confirmNewPassword')}
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.border }]} 
                onPress={closePasswordModal}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton, { backgroundColor: colors.primary }]} 
                onPress={handlePasswordChange}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <ActivityIndicator color={colors.buttonText} />
                ) : (
                  <Text style={[styles.confirmButtonText, { color: colors.buttonText }]}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
  },
  profileImageText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  editIcon: {
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  fieldsContainer: {
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  readOnlyField: {
    // Read-only styling handled dynamically
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 15,
  },
  changePasswordButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  editButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Error Banner Styles
  errorBanner: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    marginTop: 50, // Account for status bar
  },
  errorBannerText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    // Background color handled dynamically
  },
  confirmButton: {
    // Background color handled dynamically
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
