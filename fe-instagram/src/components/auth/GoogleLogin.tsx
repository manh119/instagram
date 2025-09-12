import React from 'react';

// Extend ImportMeta interface for Vite environment variables
declare global {
    interface ImportMeta {
        readonly env: {
            readonly VITE_API_BASE_URL?: string;
            readonly VITE_OAUTH2_BASE_URL?: string;
        };
    }
}

interface GoogleLoginProps {
    onLoginSuccess?: (token: string, user: any) => void;
    onLoginError?: (error: string) => void;
}

export const GoogleLogin: React.FC<GoogleLoginProps> = ({ onLoginSuccess, onLoginError }) => {
    const handleGoogleLogin = () => {
        try {
            // Redirect to backend OAuth2 endpoint
            const oauth2BaseUrl = import.meta.env.VITE_OAUTH2_BASE_URL || 'http://localhost:8080';
            const oauth2Url = `${oauth2BaseUrl}/oauth2/authorize/google`;

            console.log('Google Login - OAuth2 Base URL:', oauth2BaseUrl);
            console.log('Google Login - OAuth2 URL:', oauth2Url);

            // Store the current URL to redirect back after OAuth2
            sessionStorage.setItem('oauth2_redirect_uri', window.location.href);

            // Redirect to Google OAuth2
            window.location.href = oauth2Url;
        } catch (error) {
            console.error('Error initiating Google login:', error);
            onLoginError?.('Failed to initiate Google login');
        }
    };

    return (
        <div className="google-login">
            <button
                onClick={handleGoogleLogin}
                className="google-login-button"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '12px 24px',
                    backgroundColor: '#4285f4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#3367d6';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#4285f4';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                </svg>
                Continue with Google
            </button>
        </div>
    );
};

