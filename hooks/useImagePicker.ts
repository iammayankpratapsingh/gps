import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import authService, { UserData } from '../services/authService';

export const useImagePicker = () => {
  const [isUploading, setIsUploading] = useState(false);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const takePhotoWithCamera = async (onImageSelected: (uri: string) => void) => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('Camera photo taken:', result.assets[0].uri);
        onImageSelected(result.assets[0].uri);
      } else {
        console.log('Camera photo canceled or no assets');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const selectFromGallery = async (onImageSelected: (uri: string) => void) => {
    try {
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Photo library permission is required to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('Gallery image selected:', result.assets[0].uri);
        onImageSelected(result.assets[0].uri);
      } else {
        console.log('Gallery selection canceled or no assets');
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const uploadProfileImage = async (userData: UserData, imageUri: string, onSuccess: (url: string) => void) => {
    if (!userData) {
      console.log('No user data available for upload');
      return;
    }
    
    console.log('Starting upload for user:', userData.uid, 'Image URI:', imageUri);
    setIsUploading(true);
    
    try {
      const result = await authService.uploadProfileImage(userData.uid, imageUri);
      console.log('Upload result:', result);
      
      if (result.success && result.url) {
        console.log('Upload successful, updating UI with URL:', result.url);
        onSuccess(result.url);
        Alert.alert('Success', 'Profile photo updated successfully!');
      } else {
        console.log('Upload failed:', result.error);
        Alert.alert('Error', result.error?.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfilePhotoChange = (
    userData: UserData | null,
    onImageSelected: (uri: string) => void,
    onUploadSuccess: (url: string) => void
  ) => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option to update your profile photo',
      [
        { 
          text: 'Camera', 
          onPress: () => takePhotoWithCamera(onImageSelected)
        },
        { 
          text: 'Photo Library', 
          onPress: () => selectFromGallery(onImageSelected)
        },
        { 
          text: 'Test Upload', 
          onPress: () => {
            // Test with a sample image URL
            const testImageUrl = 'https://via.placeholder.com/300x300/007bff/ffffff?text=Test+Image';
            console.log('Testing upload with sample image');
            if (userData) {
              uploadProfileImage(userData, testImageUrl, onUploadSuccess);
            }
          }
        },
        { 
          text: 'Cancel', 
          style: 'cancel' 
        }
      ]
    );
  };

  return {
    isUploading,
    takePhotoWithCamera,
    selectFromGallery,
    uploadProfileImage,
    handleProfilePhotoChange,
  };
};
