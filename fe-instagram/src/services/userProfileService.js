const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

class UserProfileService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Get JWT token from localStorage
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');

        console.log('userProfileService - getAuthHeaders called');
        console.log('userProfileService - Token found:', !!token);
        console.log('userProfileService - Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
        console.log('userProfileService - All localStorage keys:', Object.keys(localStorage));

        if (!token) {
            throw new Error('No authentication token found');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        console.log('userProfileService - Headers being sent:', headers);

        return headers;
    }

    // Transform backend profile data to frontend format
    transformProfileData(backendProfile) {
        if (!backendProfile) return null;

        // Handle both old format (direct profile) and new format (profile with counts)
        const profile = backendProfile.profile || backendProfile;
        const counts = backendProfile.profile ? backendProfile : {};

        return {
            id: profile.id,
            uid: profile.userId,
            username: profile.username,
            fullName: profile.displayName,
            bio: profile.bio,
            profilePicURL: profile.profileImageUrl,
            followersCount: counts.followersCount || 0,
            followingCount: counts.followingCount || 0,
            postsCount: counts.postsCount || 0
        };
    }

    // Get user profile by ID
    async getUserProfileById(userId) {
        try {
            console.log('userProfileService - Getting profile by ID:', userId);
            console.log('userProfileService - API URL:', `${this.baseURL}/profiles/${userId}`);

            const response = await fetch(`${this.baseURL}/profiles/${userId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            console.log('userProfileService - Response status:', response.status);
            console.log('userProfileService - Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                if (response.status === 404) {
                    console.log('userProfileService - User not found (404)');
                    return null; // User not found
                }
                const errorData = await response.json().catch(() => ({}));
                console.log('userProfileService - Error response:', errorData);
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('userProfileService - Success response:', data);
            return this.transformProfileData(data.profile);
        } catch (error) {
            console.error('userProfileService - Error getting user profile by ID:', error);

            // Handle connection refused errors more gracefully
            if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
                console.warn('userProfileService - Backend server appears to be offline');
                return null; // Return null instead of throwing error
            }

            throw error;
        }
    }

    // Get user profile by username (keeping for backward compatibility if needed)
    async getUserProfileByUsername(username) {
        try {
            console.log('userProfileService - Getting profile by username:', username);
            console.log('userProfileService - API URL:', `${this.baseURL}/profiles/username/${username}`);

            const response = await fetch(`${this.baseURL}/profiles/username/${username}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            console.log('userProfileService - Response status:', response.status);
            console.log('userProfileService - Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                if (response.status === 404) {
                    console.log('userProfileService - User not found (404)');
                    return null; // User not found
                }
                const errorData = await response.json().catch(() => ({}));
                console.log('userProfileService - Error response:', errorData);
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('userProfileService - Success response:', data);
            return this.transformProfileData(data.profile);
        } catch (error) {
            console.error('userProfileService - Error getting user profile by username:', error);

            // Handle connection refused errors more gracefully
            if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
                console.warn('userProfileService - Backend server appears to be offline');
                return null; // Return null instead of throwing error
            }

            throw error;
        }
    }

    // Get current user profile
    async getCurrentUserProfile() {
        try {
            const response = await fetch(`${this.baseURL}/profiles/me`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.transformProfileData(data.profile);
        } catch (error) {
            console.error('Error getting current user profile:', error);
            throw error;
        }
    }

    // Update user profile
    async updateUserProfile(profileData) {
        try {
            const response = await fetch(`${this.baseURL}/profiles`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.transformProfileData(data.profile);
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

    // Update profile image
    async updateProfileImage(imageFile) {
        try {
            // Convert image to base64
            const base64Image = await this.imageToBase64(imageFile);

            const requestBody = {
                base64ImageString: base64Image
            };

            const response = await fetch(`${this.baseURL}/profiles/profile-image`, {
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
            console.error('Error updating profile image:', error);
            throw error;
        }
    }

    // Convert image file to base64 string
    async imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
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

            return { success: true };
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

            return { success: true };
        } catch (error) {
            console.error('Error unfollowing user:', error);
            throw error;
        }
    }
}

export default new UserProfileService();
