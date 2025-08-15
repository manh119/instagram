import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

interface OAuth2RedirectProps {
    onSuccess?: (token: string, user: any) => void;
    onError?: (error: string) => void;
    redirectTo?: string;
}

export const OAuth2Redirect: React.FC<OAuth2RedirectProps> = ({
    onSuccess,
    onError,
    redirectTo = '/'
}) => {
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState('Processing authentication...');
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleRedirect = async () => {
            try {
                // Handle OAuth2 redirect from backend
                const result = authService.handleOAuth2Redirect();

                if (result) {
                    const { token, user } = result;

                    // Call the login function from AuthContext to update the state
                    await login(user, token);

                    // Call success callback
                    onSuccess?.(token, user);

                    setStatus('success');
                    setMessage('Authentication successful! Redirecting...');

                    // Redirect after a short delay using React Router
                    setTimeout(() => {
                        navigate(redirectTo);
                    }, 1500);
                } else {
                    // Check for error parameters
                    const urlParams = new URLSearchParams(window.location.search);
                    const error = urlParams.get('error');
                    const errorMessage = urlParams.get('message');

                    if (error) {
                        const errorMsg = errorMessage || 'Authentication failed';
                        setStatus('error');
                        setMessage(errorMsg);

                        onError?.(errorMsg);

                        // Redirect after error using React Router
                        setTimeout(() => {
                            navigate(redirectTo);
                        }, 3000);
                    } else {
                        setStatus('error');
                        setMessage('Authentication failed. Please try again.');

                        onError?.('Authentication failed');

                        // Redirect after error using React Router
                        setTimeout(() => {
                            navigate(redirectTo);
                        }, 3000);
                    }
                }
            } catch (error) {
                console.error('Error handling OAuth2 redirect:', error);
                setStatus('error');
                setMessage('An unexpected error occurred. Please try again.');

                onError?.('Unexpected error');

                // Redirect after error using React Router
                setTimeout(() => {
                    navigate(redirectTo);
                }, 3000);
            }
        };

        handleRedirect();
    }, [onSuccess, onError, redirectTo, login, navigate]);

    const getStatusIcon = () => {
        switch (status) {
            case 'processing':
                return (
                    <div className="spinner" style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #3498db',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                );
            case 'success':
                return (
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#4CAF50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '24px'
                    }}>
                        ✓
                    </div>
                );
            case 'error':
                return (
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#f44336',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '24px'
                    }}>
                        ✗
                    </div>
                );
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'processing':
                return '#3498db';
            case 'success':
                return '#4CAF50';
            case 'error':
                return '#f44336';
        }
    };

    return (
        <div className="oauth2-redirect" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            textAlign: 'center'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                maxWidth: '400px',
                width: '100%'
            }}>
                {getStatusIcon()}

                <h2 style={{
                    marginTop: '20px',
                    marginBottom: '10px',
                    color: getStatusColor()
                }}>
                    {status === 'processing' && 'Processing...'}
                    {status === 'success' && 'Success!'}
                    {status === 'error' && 'Error'}
                </h2>

                <p style={{
                    color: '#666',
                    marginBottom: '20px',
                    lineHeight: '1.5'
                }}>
                    {message}
                </p>

                {status === 'processing' && (
                    <div style={{
                        fontSize: '14px',
                        color: '#999',
                        marginTop: '20px'
                    }}>
                        Please wait while we complete your authentication...
                    </div>
                )}

                {status === 'error' && (
                    <button
                        onClick={() => navigate(redirectTo)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Go Back
                    </button>
                )}

                {/* Test button for debugging */}
                <button
                    onClick={async () => {
                        try {
                            const mockUser = {
                                uid: 'test-user',
                                username: 'testuser',
                                fullName: 'Test User',
                                name: 'Test User',
                                provider: 'test',
                                email: 'test@example.com',
                                picture: '/profilepic.png',
                                profilePicURL: '/profilepic.png',
                                bio: 'Test user for debugging',
                                followers: [],
                                following: []
                            };
                            const mockToken = 'test.jwt.token';

                            await login(mockUser, mockToken);
                            setStatus('success');
                            setMessage('Test login successful! Redirecting...');

                            setTimeout(() => {
                                navigate(redirectTo);
                            }, 1500);
                        } catch (error) {
                            console.error('Test login error:', error);
                            setStatus('error');
                            setMessage('Test login failed: ' + error.message);
                        }
                    }}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#9b59b6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Test Login (Debug)
                </button>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

