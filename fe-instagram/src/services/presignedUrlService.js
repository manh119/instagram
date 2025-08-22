import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

class PreSignedUrlService {

    /**
     * Get pre-signed URL for post image upload
     */
    async getPostImageUploadUrl(fileName, contentType) {
        try {
            console.log('=== Requesting Post Image Upload URL ===');
            console.log('File Name:', fileName);
            console.log('Content Type:', contentType);

            const response = await fetch(`${API_BASE_URL}/api/presigned/upload/post-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({
                    fileName,
                    contentType
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get upload URL');
            }

            const data = await response.json();
            console.log('=== Post Image Upload URL Received ===');
            console.log('Upload URL:', data.uploadUrl);
            console.log('Object Key:', data.objectKey);
            console.log('Expires In:', data.expiresIn, 'seconds');

            return data;

        } catch (error) {
            console.error('=== Failed to Get Post Image Upload URL ===');
            console.error('Error:', error.message);
            throw error;
        }
    }

    /**
     * Get pre-signed URL for profile image upload
     */
    async getProfileImageUploadUrl(fileName, contentType) {
        try {
            console.log('=== Requesting Profile Image Upload URL ===');
            console.log('File Name:', fileName);
            console.log('Content Type:', contentType);

            const response = await fetch(`${API_BASE_URL}/api/presigned/upload/profile-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({
                    fileName,
                    contentType
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get upload URL');
            }

            const data = await response.json();
            console.log('=== Profile Image Upload URL Received ===');
            console.log('Upload URL:', data.uploadUrl);
            console.log('Object Key:', data.objectKey);
            console.log('Expires In:', data.expiresIn, 'seconds');

            return data;

        } catch (error) {
            console.error('=== Failed to Get Profile Image Upload URL ===');
            console.error('Error:', error.message);
            throw error;
        }
    }

    /**
     * Upload file directly to MinIO using pre-signed URL
     */
    async uploadFileToMinIO(uploadUrl, file, onProgress) {
        try {
            console.log('=== Starting Direct Upload to MinIO ===');
            console.log('Upload URL:', uploadUrl);
            console.log('File:', file.name, file.size, file.type);

            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                // Track upload progress
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable && onProgress) {
                        const percentComplete = (event.loaded / event.total) * 100;
                        onProgress(percentComplete);
                    }
                });

                // Handle response
                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        console.log('=== Direct Upload Success ===');
                        console.log('Response:', xhr.responseText);
                        resolve({
                            success: true,
                            status: xhr.status,
                            response: xhr.responseText
                        });
                    } else {
                        console.error('=== Direct Upload Failed ===');
                        console.error('Status:', xhr.status);
                        console.error('Response:', xhr.responseText);
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                });

                // Handle errors
                xhr.addEventListener('error', () => {
                    console.error('=== Direct Upload Network Error ===');
                    reject(new Error('Network error during upload'));
                });

                xhr.addEventListener('abort', () => {
                    console.warn('=== Direct Upload Aborted ===');
                    reject(new Error('Upload was aborted'));
                });

                // Open and send request
                xhr.open('PUT', uploadUrl);
                xhr.setRequestHeader('Content-Type', file.type);

                // Send file
                xhr.send(file);
            });

        } catch (error) {
            console.error('=== Direct Upload Error ===');
            console.error('Error:', error.message);
            throw error;
        }
    }

    /**
     * Complete upload process: get URL and upload file
     */
    async uploadPostImage(file, onProgress) {
        try {
            // Step 1: Get pre-signed URL
            const uploadData = await this.getPostImageUploadUrl(file.name, file.type);

            // Step 2: Upload file directly to MinIO
            const uploadResult = await this.uploadFileToMinIO(
                uploadData.uploadUrl,
                file,
                onProgress
            );

            // Step 3: Return upload result with object key
            return {
                ...uploadResult,
                objectKey: uploadData.objectKey,
                bucketName: uploadData.bucketName
            };

        } catch (error) {
            console.error('=== Post Image Upload Process Failed ===');
            console.error('Error:', error.message);
            throw error;
        }
    }

    /**
     * Complete upload process for profile image
     */
    async uploadProfileImage(file, onProgress) {
        try {
            // Step 1: Get pre-signed URL
            const uploadData = await this.getProfileImageUploadUrl(file.name, file.type);

            // Step 2: Upload file directly to MinIO
            const uploadResult = await this.uploadFileToMinIO(
                uploadData.uploadUrl,
                file,
                onProgress
            );

            // Step 3: Return upload result with object key
            return {
                ...uploadResult,
                objectKey: uploadData.objectKey,
                bucketName: uploadData.bucketName
            };

        } catch (error) {
            console.error('=== Profile Image Upload Process Failed ===');
            console.error('Error:', error.message);
            throw error;
        }
    }
}

// Create singleton instance
const presignedUrlService = new PreSignedUrlService();

export default presignedUrlService;
