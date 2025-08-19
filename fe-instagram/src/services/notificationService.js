// Notification Service using fetch API
class NotificationService {
    constructor() {
        this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    }

    // Get JWT token from localStorage
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');

        if (!token) {
            throw new Error('No authentication token found');
        }

        // Check if token is expired
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            if (payload.exp < currentTime) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                throw new Error('Authentication token has expired. Please log in again.');
            }
        } catch (error) {
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

    // Get all notifications for the current user
    async getNotifications(page = 1, limit = 20) {
        try {
            const response = await fetch(`${this.baseURL}/api/notifications?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    // Get unread notifications count
    async getUnreadCount() {
        try {
            const response = await fetch(`${this.baseURL}/api/notifications/unread/count`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching unread count:', error);
            throw error;
        }
    }

    // Mark a notification as read
    async markAsRead(notificationId) {
        try {
            const response = await fetch(`${this.baseURL}/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    // Mark all notifications as read
    async markAllAsRead() {
        try {
            const response = await fetch(`${this.baseURL}/api/notifications/read-all`, {
                method: 'PUT',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    // Delete a notification
    async deleteNotification(notificationId) {
        try {
            const response = await fetch(`${this.baseURL}/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    // Delete all read notifications
    async deleteAllRead() {
        try {
            const response = await fetch(`${this.baseURL}/api/notifications/read`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting read notifications:', error);
            throw error;
        }
    }
}

export default new NotificationService();
