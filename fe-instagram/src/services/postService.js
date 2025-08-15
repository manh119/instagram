const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

class PostService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Get JWT token from localStorage
    getAuthHeaders() {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            throw new Error('No authentication token found');
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

    // Create a new post
    async createPost(postData) {
        try {
            // Convert image to base64 if it's a file
            let base64Image = postData.image;
            if (postData.image instanceof File) {
                base64Image = await this.imageToBase64(postData.image);
                console.log('Image converted to base64, length:', base64Image.length);
                console.log('Base64 starts with:', base64Image.substring(0, 50));
            }

            const requestBody = {
                caption: postData.caption,
                base64ImageString: base64Image
            };

            console.log('Sending post request:', {
                caption: requestBody.caption,
                imageLength: requestBody.base64ImageString.length,
                imageStart: requestBody.base64ImageString.substring(0, 50)
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
            const response = await fetch(`${this.baseURL}/posts/like/${postId}`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error liking post:', error);
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

            return await response.json();
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    }
}

export default new PostService();

