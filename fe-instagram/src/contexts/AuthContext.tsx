import { createContext, useContext, useEffect, useState } from 'react';
import { authService, User } from '../services/authService';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (userData: User, token: string) => Promise<void>;
    logout: () => void;
    updateUser: (userData: User) => void;
    checkAuth: () => Promise<boolean>;
    authService: typeof authService;
}

const AuthContext = createContext < AuthContextType | undefined > (undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState < User | null > (null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Initialize authentication state
    useEffect(() => {
        const initAuth = async () => {
            try {
                const authState = await authService.initializeAuth();
                if (authState.isAuthenticated) {
                    setUser(authState.user);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                authService.logout();
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // Login function
    const login = async (userData: User, token: string) => {
        try {
            authService.setAuth(token, userData);
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // Logout function
    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    // Update user function
    const updateUser = (userData: User) => {
        const token = authService.getToken();
        if (token) {
            authService.setAuth(token, userData);
        }
        setUser(userData);
    };

    // Check if user is authenticated
    const checkAuth = async () => {
        const isAuth = await authService.checkAuth();
        setIsAuthenticated(isAuth);
        return isAuth;
    };

    const value: AuthContextType = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser,
        checkAuth,
        authService
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

