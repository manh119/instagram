import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, AuthState, User } from '../services/authService';

interface AuthContextType extends AuthState {
    login: (token: string, user: User) => void;
    logout: () => void;
    refreshAuth: () => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: true
    });

    // Initialize authentication on app startup
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const state = await authService.initializeAuth();
                setAuthState(state);
            } catch (error) {
                console.error('Error initializing authentication:', error);
                setAuthState({
                    isAuthenticated: false,
                    user: null,
                    token: null,
                    loading: false
                });
            }
        };

        initializeAuth();
    }, []);

    // Set up periodic token validation
    useEffect(() => {
        if (authState.isAuthenticated && authState.token) {
            const interval = setInterval(async () => {
                try {
                    const isValid = await authService.checkAuth();
                    if (!isValid) {
                        setAuthState({
                            isAuthenticated: false,
                            user: null,
                            token: null,
                            loading: false
                        });
                    }
                } catch (error) {
                    console.error('Error checking authentication:', error);
                }
            }, 5 * 60 * 1000); // Check every 5 minutes

            return () => clearInterval(interval);
        }
    }, [authState.isAuthenticated, authState.token]);

    const login = (token: string, user: User) => {
        authService.setAuth(token, user);
        setAuthState({
            isAuthenticated: true,
            user,
            token,
            loading: false
        });
    };

    const logout = () => {
        authService.logout();
        setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false
        });
    };

    const refreshAuth = async () => {
        try {
            const token = authService.getToken();
            if (token) {
                const isValid = await authService.checkAuth();
                if (isValid) {
                    const user = authService.getUser();
                    if (user) {
                        setAuthState({
                            isAuthenticated: true,
                            user,
                            token,
                            loading: false
                        });
                    }
                } else {
                    logout();
                }
            }
        } catch (error) {
            console.error('Error refreshing authentication:', error);
            logout();
        }
    };

    const updateUser = (user: User) => {
        if (authState.token) {
            authService.setAuth(authState.token, user);
            setAuthState(prev => ({
                ...prev,
                user
            }));
        }
    };

    const value: AuthContextType = {
        ...authState,
        login,
        logout,
        refreshAuth,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Hook for protected routes
export const useRequireAuth = (redirectTo: string = '/login') => {
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            window.location.href = redirectTo;
        }
    }, [isAuthenticated, loading, redirectTo]);

    return { isAuthenticated, loading };
};

