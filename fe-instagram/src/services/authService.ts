// Authentication Service for JWT and Google OAuth2
// This service handles authentication state, JWT tokens, and OAuth2 flows

export interface User {
    uid: string;
    username: string;
    fullName?: string;
    name?: string;
    picture?: string;
    profilePicURL?: string;
    bio?: string;
    email?: string;
    provider?: string;
    providerId?: string;
    followers?: User[];
    following?: User[];
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    loading: boolean;
}

class AuthService {
    private tokenKey = 'authToken';
    private userKey = 'authUser';
    private baseUrl = import.meta.env.VITE_API_BASE_URL;

    // Get current authentication state
    getAuthState(): AuthState {
        const token = localStorage.getItem(this.tokenKey);
        const userStr = localStorage.getItem(this.userKey);

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                return {
                    isAuthenticated: true,
                    user,
                    token,
                    loading: false
                };
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                this.clearAuth();
            }
        }

        return {
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false
        };
    }

    // Store authentication data
    setAuth(token: string, user: User): void {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    // Clear authentication data
    clearAuth(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    // Get stored token
    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    // Get stored user
    getUser(): User | null {
        const userStr = localStorage.getItem(this.userKey);
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                return null;
            }
        }
        return null;
    }

    // Check if token is expired
    isTokenExpired(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp < currentTime;
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return true;
        }
    }

    // Validate token with backend
    async validateToken(token: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/auth/validate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.ok;
        } catch (error) {
            console.error('Error validating token:', error);
            return false;
        }
    }

    // Refresh token
    async refreshToken(token: string): Promise<string | null> {
        try {
            const response = await fetch(`${this.baseUrl}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });

            if (response.ok) {
                const data = await response.json();
                return data.token;
            }
            return null;
        } catch (error) {
            console.error('Error refreshing token:', error);
            return null;
        }
    }

    // Get current user info from backend
    async getCurrentUser(): Promise<User | null> {
        const token = this.getToken();
        if (!token) return null;

        try {
            const response = await fetch(`${this.baseUrl}/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const user = await response.json();
                // Update stored user data
                this.setAuth(token, user);
                return user;
            }
            return null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // Logout user
    logout(): void {
        this.clearAuth();
        // Redirect to home page or login page
        window.location.href = '/';
    }

    // Handle OAuth2 redirect from backend
    handleOAuth2Redirect(): { token: string; user: User } | null {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const username = urlParams.get('username');
        const provider = urlParams.get('provider');
        const error = urlParams.get('error');

        if (error) {
            console.error('OAuth2 error:', error);
            return null;
        }

        if (token && username) {
            const user: User = {
                uid: username, // Use username as uid for now
                username,
                fullName: username, // Use username as fullName for now
                name: username,
                provider: provider || undefined,
                providerId: urlParams.get('providerId') || undefined,
                email: urlParams.get('email') || undefined,
                picture: urlParams.get('picture') || undefined,
                profilePicURL: urlParams.get('picture') || undefined,
                bio: '',
                followers: [],
                following: []
            };

            // Store authentication data
            this.setAuth(token, user);

            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);

            return { token, user };
        }

        return null;
    }

    // Get authorization headers for API calls
    getAuthHeaders(): Record<string, string> {
        const token = this.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    // Check if user is authenticated and token is valid
    async checkAuth(): Promise<boolean> {
        const token = this.getToken();
        if (!token) return false;

        // Check if token is expired
        if (this.isTokenExpired(token)) {
            // Try to refresh token
            const newToken = await this.refreshToken(token);
            if (newToken) {
                const user = this.getUser();
                if (user) {
                    this.setAuth(newToken, user);
                    return true;
                }
            }
            this.clearAuth();
            return false;
        }

        // Validate token with backend
        const isValid = await this.validateToken(token);
        if (!isValid) {
            this.clearAuth();
            return false;
        }

        return true;
    }

    // Initialize authentication on app startup
    async initializeAuth(): Promise<AuthState> {
        const authState = this.getAuthState();

        if (authState.isAuthenticated && authState.token) {
            // Check if token is still valid
            const isValid = await this.checkAuth();
            if (!isValid) {
                return {
                    isAuthenticated: false,
                    user: null,
                    token: null,
                    loading: false
                };
            }
        }

        return authState;
    }
}

// Create singleton instance
export const authService = new AuthService();

