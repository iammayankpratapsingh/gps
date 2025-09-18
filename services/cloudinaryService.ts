// Cloudinary configuration
const CLOUDINARY_URL = 'cloudinary://296983231939789:r7R8_fLoQ6QtVMTA9p_NXZHQV5k@dh4baadaa';

// Parse Cloudinary URL to get configuration
const parseCloudinaryUrl = (url: string) => {
  const match = url.match(/cloudinary:\/\/(\d+):([^@]+)@([^\/]+)/);
  if (!match) {
    throw new Error('Invalid Cloudinary URL');
  }
  
  return {
    cloudName: match[3],
    apiKey: match[1],
    apiSecret: match[2]
  };
};

const config = parseCloudinaryUrl(CLOUDINARY_URL);

export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

export interface CloudinaryDeleteResult {
  success: boolean;
  error?: string;
}

class CloudinaryService {
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.cloudName = config.cloudName;
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
  }

  // Upload image to Cloudinary using unsigned upload
  async uploadImage(imageUri: string, folder: string = 'gps-tracker', userId?: string): Promise<CloudinaryUploadResult> {
    try {
      const formData = new FormData();
      
      // Determine file type from URI
      const fileExtension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = this.getMimeType(fileExtension);
      
      formData.append('file', {
        uri: imageUri,
        type: mimeType,
        name: `profile_${userId || 'user'}.${fileExtension}`,
      } as any);
      
      // Using unsigned upload with preset (you need to create this preset in Cloudinary dashboard)
      formData.append('upload_preset', 'gps_tracker_preset'); // Create this preset in Cloudinary
      formData.append('folder', folder);
      
      // Add transformations for profile images
      if (folder.includes('profiles')) {
        formData.append('transformation', 'w_400,h_400,c_fill,g_face,q_auto,f_auto');
      }

      console.log('Uploading to Cloudinary:', {
        folder,
        userId,
        cloudName: this.cloudName
      });

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const result = await uploadResponse.json();

      console.log('Cloudinary upload response:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        result: result
      });

      if (result.secure_url) {
        console.log('✅ Cloudinary upload successful:', result.secure_url);
        return {
          success: true,
          url: result.secure_url,
          publicId: result.public_id
        };
      } else {
        console.error('❌ Cloudinary upload failed:', {
          error: result.error,
          message: result.error?.message,
          fullResult: result
        });
        return {
          success: false,
          error: result.error?.message || result.error || 'Upload failed'
        };
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // Get MIME type from file extension
  private getMimeType(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'bmp': 'image/bmp'
    };
    return mimeTypes[extension] || 'image/jpeg';
  }

  // Delete image from Cloudinary
  // Note: For production, you should implement this on your backend for security
  async deleteImage(publicId: string): Promise<CloudinaryDeleteResult> {
    try {
      // For now, we'll just return success since delete requires server-side implementation
      // In production, you should call your backend API to delete the image
      console.log(`Would delete image with public_id: ${publicId}`);
      
      // TODO: Implement backend API call for deletion
      // For development, we'll just return success
      return { success: true };
      
      /* Production implementation would be:
      const response = await fetch('YOUR_BACKEND_API/delete-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicId: publicId,
        }),
      });
      
      const result = await response.json();
      return { success: result.success };
      */
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }


  // Extract public ID from Cloudinary URL
  extractPublicId(url: string): string | null {
    const match = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)$/);
    return match ? match[1] : null;
  }
}

export default new CloudinaryService();
