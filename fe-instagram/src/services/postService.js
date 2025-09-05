import presignedUrlService from './presignedUrlService.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

class PostService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Get JWT token from localStorage
    getAuthHeaders() {
        const token = localStorage.getItem('authToken'); // Use same key as authService
        console.log('PostService - Found token:', token ? token.substring(0, 20) + '...' : 'No token');
        console.log('PostService - All localStorage keys:', Object.keys(localStorage));
        console.log('PostService - authToken value:', localStorage.getItem('authToken'));
        console.log('PostService - authUser value:', localStorage.getItem('authUser'));

        if (!token) {
            throw new Error('No authentication token found');
        }

        // Check if token is expired
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            if (payload.exp < currentTime) {
                console.error('PostService - Token expired:', new Date(payload.exp * 1000));
                // Clear expired token
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                throw new Error('Authentication token has expired. Please log in again.');
            }
        } catch (error) {
            console.error('PostService - Error validating token:', error);
            if (error.message.includes('expired')) {
                throw error;
            }
            throw new Error('Invalid authentication token. Please log in again.');
        }

        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    // Convert image file to base64 string
    async imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Send the complete data URL that the backend expects
                // Backend needs this to determine file type and extract base64 data
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Convert video file to base64 string
    async videoToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Send the complete data URL that the backend expects
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Upload image using pre-signed URL
    async uploadImageUsingPresignedUrl(file) {
        try {
            console.log('=== Uploading Image Using Pre-signed URL ===');
            console.log('File:', file.name, file.size, file.type);

            const result = await presignedUrlService.uploadPostImage(file, (progress) => {
                console.log('Image upload progress:', progress + '%');
            });

            console.log('=== Image Upload Complete ===');
            console.log('Result:', result);

            // Return the full URL to the uploaded image
            // Extract just the filename from the object key (remove 'posts/' prefix)
            const filename = result.objectKey.split('/').pop();
            return `${this.baseURL}/images/${filename}`;

        } catch (error) {
            console.error('=== Image Upload Failed ===');
            console.error('Error:', error);
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    }

    // Upload video using pre-signed URL
    async uploadVideoUsingPresignedUrl(file) {
        try {
            console.log('=== Uploading Video Using Pre-signed URL ===');
            console.log('File:', file.name, file.size, file.type);

            // Note: Using uploadPostImage for videos since both images and videos go to the same posts bucket
            const result = await presignedUrlService.uploadPostImage(file, (progress) => {
                console.log('Video upload progress:', progress + '%');
            });

            console.log('=== Video Upload Complete ===');
            console.log('Result:', result);

            // Return the full URL to the uploaded video
            // Extract just the filename from the object key (remove 'posts/' prefix)
            const filename = result.objectKey.split('/').pop();
            return `${this.baseURL}/images/${filename}`;

        } catch (error) {
            console.error('=== Video Upload Failed ===');
            console.error('Error:', error);
            throw new Error(`Failed to upload video: ${error.message}`);
        }
    }

    // Create a new post using pre-signed URLs
    async createPost(postData) {
        try {
            console.log('=== Starting Post Creation with Pre-signed URLs ===');
            console.log('=== DEBUG: postData received ===');
            console.log('postData:', postData);
            console.log('postData.image:', postData.image);
            console.log('postData.image type:', typeof postData.image);
            console.log('postData.image instanceof File:', postData.image instanceof File);
            console.log('postData.video:', postData.video);
            console.log('postData.video type:', typeof postData.video);
            console.log('postData.video instanceof File:', postData.video instanceof File);

            let imageUrl = null;
            let videoUrl = null;

            // Handle image upload using pre-signed URL
            console.log('=== DEBUG: Processing image ===');
            console.log('postData.image exists:', !!postData.image);
            console.log('postData.image instanceof File:', postData.image instanceof File);
            console.log('postData.image type:', typeof postData.image);

            if (postData.image && postData.image instanceof File) {
                console.log('Processing image file:', postData.image.name, postData.image.size);
                imageUrl = await this.uploadImageUsingPresignedUrl(postData.image);
                console.log('Image uploaded successfully, URL:', imageUrl);
            } else if (postData.image && typeof postData.image === 'string' && !postData.image.startsWith('data:')) {
                imageUrl = postData.image;
                console.log('Using existing image URL:', imageUrl);
            } else {
                console.log('Image not processed - conditions not met');
            }

            // Handle video upload using pre-signed URL
            console.log('=== DEBUG: Processing video ===');
            console.log('postData.video exists:', !!postData.video);
            console.log('postData.video instanceof File:', postData.video instanceof File);
            console.log('postData.video type:', typeof postData.video);

            if (postData.video && postData.video instanceof File) {
                console.log('Processing video file:', postData.video.name, postData.video.size);
                videoUrl = await this.uploadVideoUsingPresignedUrl(postData.video);
                console.log('Video uploaded successfully, URL:', videoUrl);
            } else if (postData.video && typeof postData.video === 'string' && !postData.video.startsWith('data:')) {
                videoUrl = postData.video;
                console.log('Using existing video URL:', videoUrl);
            } else {
                console.log('Video not processed - conditions not met');
            }

            const requestBody = {
                caption: postData.caption
            };

            // Add media URLs if they exist
            if (imageUrl) {
                requestBody.imageUrl = imageUrl;
            }
            if (videoUrl) {
                requestBody.videoUrl = videoUrl;
            }

            console.log('Sending post request with URLs:', {
                caption: requestBody.caption,
                hasImage: !!imageUrl,
                hasVideo: !!videoUrl,
                imageUrl: imageUrl,
                videoUrl: videoUrl
            });

            const response = await fetch(`${this.baseURL}/posts`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('=== Post Created Successfully ===');
            console.log('Post result:', result);
            return result;
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    }

    // Get a specific post by ID
    async getPost(postId) {
        try {
            const response = await fetch(`${this.baseURL}/posts/${postId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting post:', error);
            throw error;
        }
    }

    // Get posts by user ID
    async getUserPosts(userId) {
        try {
            const response = await fetch(`${this.baseURL}/posts/user/${userId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting user posts:', error);
            throw error;
        }
    }

    // Get posts liked by a user
    async getLikedPosts(userId) {
        try {
            const response = await fetch(`${this.baseURL}/posts/liked/${userId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting liked posts:', error);
            throw error;
        }
    }

    // Like a post
    async likePost(postId) {
        try {
            console.log('PostService - Liking post:', postId);
            console.log('PostService - Auth headers:', this.getAuthHeaders());

            const response = await fetch(`${this.baseURL}/posts/like/${postId}`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });

            console.log('PostService - Like response status:', response.status);
            console.log('PostService - Like response headers:', response.headers);

            if (!response.ok) {
                if (response.status === 401) {
                    console.error('PostService - Authentication failed. Token may be expired or invalid.');
                    // Clear invalid authentication
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('authUser');
                    throw new Error('Authentication failed. Please log in again.');
                }

                const errorData = await response.json().catch(() => ({}));
                console.error('PostService - Like error response:', errorData);
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('PostService - Like successful:', result);
            return result;
        } catch (error) {
            console.error('PostService - Error liking post:', error);
            throw error;
        }
    }

    // Unlike a post
    async unlikePost(postId) {
        try {
            const response = await fetch(`${this.baseURL}/posts/like/${postId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error unliking post:', error);
            throw error;
        }
    }

    // Delete a post
    async deletePost(postId) {
        try {
            const response = await fetch(`${this.baseURL}/posts/${postId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return true; // Post deleted successfully
        } catch (error) {
            console.error('Error deleting post:', error);
            throw error;
        }
    }

    // Get feed posts (posts from followed users)
    async getFeedPosts(page = 0, limit = 10) {
        try {
            const response = await fetch(`${this.baseURL}/dynamic-feeds?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting feed posts:', error);
            throw error;
        }
    }

    // Get a single post with all relationships (for post detail page)
    async getPostWithRelationships(postId) {
        try {
            const response = await fetch(`${this.baseURL}/posts/${postId}/with-relationships`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting post with relationships:', error);
            throw error;
        }
    }

    // Toggle like/unlike a post (convenience method)
    async toggleLike(postId, isCurrentlyLiked) {
        try {
            if (isCurrentlyLiked) {
                return await this.unlikePost(postId);
            } else {
                return await this.likePost(postId);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            throw error;
        }
    }

    // Create a comment on a post
    async createComment(postId, commentText) {
        try {
            const requestBody = {
                postId: postId,
                comment: commentText
            };

            const response = await fetch(`${this.baseURL}/comments`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating comment:', error);
            throw error;
        }
    }

    // Delete a comment
    async deleteComment(commentId) {
        try {
            const response = await fetch(`${this.baseURL}/comments/${commentId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return true; // Comment deleted successfully
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    }

    // Get suggested users
    async getSuggestedUsers(limit = 10) {
        try {
            const response = await fetch(`${this.baseURL}/users/suggested?limit=${limit}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting suggested users:', error);
            throw error;
        }
    }

    // Follow a user
    async followUser(profileId) {
        try {
            const response = await fetch(`${this.baseURL}/follow`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ profileId })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // Handle empty response body (backend returns ResponseEntity.ok().build())
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return { success: true }; // Return success object for empty responses
            }
        } catch (error) {
            console.error('Error following user:', error);
            throw error;
        }
    }

    // Unfollow a user
    async unfollowUser(profileId) {
        try {
            const response = await fetch(`${this.baseURL}/follow`, {
                method: 'DELETE',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ profileId })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // Handle empty response body (backend returns ResponseEntity.ok().build())
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return { success: true }; // Return success object for empty responses
            }
        } catch (error) {
            console.error('Error unfollowing user:', error);
            throw error;
        }
    }

    // Get a specific post by ID
    async getPostById(postId) {
        try {
            const headers = this.getAuthHeaders();
            const response = await fetch(`${this.baseURL}/posts/${postId}`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching post:', error);
            throw error;
        }
    }
}

export default new PostService();

