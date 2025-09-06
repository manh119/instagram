const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class UserSearchService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    async searchUsers(query, limit = 10) {
        try {
            console.log('userSearchService - Searching users:', query);

            const response = await fetch(`${this.baseURL}/users/search?query=${encodeURIComponent(query)}&limit=${limit}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('userSearchService - Search results:', data);
            return data.users || [];
        } catch (error) {
            console.error('userSearchService - Error searching users:', error);
            throw error;
        }
    }

    async getSuggestedUsers(limit = 10) {
        try {
            console.log('userSearchService - Getting suggested users');

            const response = await fetch(`${this.baseURL}/users/suggested?limit=${limit}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('userSearchService - Suggested users:', data);
            return data || [];
        } catch (error) {
            console.error('userSearchService - Error getting suggested users:', error);
            throw error;
        }
    }
}

export default new UserSearchService();
