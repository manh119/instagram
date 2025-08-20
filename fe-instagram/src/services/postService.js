const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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

    // Create a new post
    async createPost(postData) {
        try {
            let base64Image = null;
            let base64Video = null;

            // Convert image to base64 if it's a file
            if (postData.image && postData.image instanceof File) {
                base64Image = await this.imageToBase64(postData.image);
                console.log('Image converted to base64, length:', base64Image.length);
            } else if (postData.image) {
                base64Image = postData.image;
            }

            // Convert video to base64 if it's a file
            if (postData.video && postData.video instanceof File) {
                base64Video = await this.videoToBase64(postData.video);
                console.log('Video converted to base64, length:', base64Video.length);
            } else if (postData.video) {
                base64Video = postData.video;
            }

            const requestBody = {
                caption: postData.caption
            };

            // Only add media fields if they exist
            if (base64Image) {
                requestBody.base64ImageString = base64Image;
            }
            if (base64Video) {
                requestBody.base64VideoString = base64Video;
            }

            console.log('Sending post request:', {
                caption: requestBody.caption,
                hasImage: !!base64Image,
                hasVideo: !!base64Video
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
            console.log('Post created successfully:', result);
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
}

export default new PostService();

