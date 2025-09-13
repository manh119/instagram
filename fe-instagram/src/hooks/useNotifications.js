import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';
import webSocketService from '../services/websocketService';
import useNotificationToast from './useNotificationToast.jsx';
import { authService } from '../services/authService';

const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
    const { user: authUser } = useAuth();
    const { showNotificationToast, showToast } = useNotificationToast();

    const limit = 20;

    // Handle incoming WebSocket notifications
    const handleWebSocketNotification = useCallback((notification) => {
        console.log('=== handleWebSocketNotification called ===');
        console.log('Notification to add:', notification);
        console.log('Current notifications state:', notifications);

        setNotifications(prev => {
            console.log('setNotifications callback - prev state:', prev);
            console.log('Checking for duplicate notification with ID:', notification.id);

            // Check if notification already exists
            const exists = prev.some(n => n.id === notification.id);
            if (exists) {
                console.log('Notification already exists, skipping...');
                return prev;
            }

            console.log('Adding new notification to state');
            const newNotifications = [notification, ...prev];
            console.log('New notifications state:', newNotifications);
            return newNotifications;
        });

        // Update unread count
        if (!notification.isRead) {
            setUnreadCount(prev => {
                console.log('Updating unread count from', prev, 'to', prev + 1);
                return prev + 1;
            });
        }

        // Show notification toast
        if (!notification.isRead) {
            console.log('Showing enhanced notification toast');
            showNotificationToast(notification);
        }

        console.log('=== handleWebSocketNotification completed ===');
    }, [showNotificationToast, notifications]);

    // Initialize WebSocket connection - only run once per user
    useEffect(() => {
        console.log('=== useNotifications: useEffect triggered ===');
        console.log('authUser:', authUser);

        if (authUser) {
            // Get profile ID for WebSocket subscription
            const getProfileId = async () => {
                try {
                    // Use the same pattern as userProfileService
                    const baseURL = import.meta.env.VITE_API_BASE_URL;
                    const response = await fetch(`${baseURL}/profiles/me`, {
                        headers: {
                            'Authorization': `Bearer ${authService.getToken()}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const profileId = data.profile?.id;
                        console.log('Profile ID for WebSocket:', profileId);
                        return profileId;
                    } else {
                        console.error('Failed to get profile ID: HTTP', response.status, response.statusText);
                    }
                } catch (error) {
                    console.error('Failed to get profile ID:', error);
                }
                return null;
            };

            getProfileId().then(profileId => {
                if (profileId) {
                    console.log('useNotifications: Setting up WebSocket for profile:', profileId);

                    // Register this component with the WebSocket service
                    webSocketService.registerComponent();

                    // Set up WebSocket callbacks (only once per component instance)
                    console.log('useNotifications: Setting up WebSocket callbacks...');

                    webSocketService.onNotification((notification) => {
                        console.log('=== WebSocket Notification Callback Fired ===');
                        console.log('useNotifications: Received WebSocket notification:', notification);
                        handleWebSocketNotification(notification);
                    });

                    webSocketService.onUnreadCount((count) => {
                        console.log('=== WebSocket Unread Count Callback Fired ===');
                        console.log('useNotifications: Received WebSocket unread count:', count);
                        setUnreadCount(count);
                    });

                    webSocketService.onConnectionChange((connected) => {
                        console.log('=== WebSocket Connection Change Callback Fired ===');
                        console.log('useNotifications: WebSocket connection changed:', connected);
                        setIsWebSocketConnected(connected);
                    });

                    console.log('useNotifications: WebSocket callbacks set up successfully');

                    // Only connect if not already connected to this profile
                    if (!webSocketService.isConnectedToUser(profileId)) {
                        console.log('useNotifications: Calling webSocketService.connect with profile ID:', profileId);
                        webSocketService.connect(profileId).then(() => {
                            console.log('useNotifications: WebSocket connection completed for profile:', profileId);
                        }).catch(error => {
                            console.error('useNotifications: WebSocket connection failed for profile:', profileId, error);
                        });
                    } else {
                        console.log('useNotifications: WebSocket already connected to profile:', profileId, 'skipping connection');
                    }

                    // Debug current WebSocket state
                    webSocketService.debugState();
                } else {
                    console.log('useNotifications: Failed to get profile ID, skipping WebSocket setup');
                }
            }).catch(error => {
                console.error('useNotifications: Error fetching profile ID:', error);
            });

            // Cleanup on unmount
            return () => {
                console.log('useNotifications: Component unmounting, unregistering from WebSocket service');
                webSocketService.unregisterComponent();
            };
        } else {
            console.log('useNotifications: No authUser, skipping WebSocket setup');
        }
    }, [authUser, handleWebSocketNotification]); // Include handleWebSocketNotification in dependencies

    // Debug notifications state changes
    useEffect(() => {
        console.log('=== Notifications state changed ===');
        console.log('New notifications state:', notifications);
        console.log('Notifications count:', notifications.length);
    }, [notifications]);

    // Debug unread count state changes
    useEffect(() => {
        console.log('=== Unread count state changed ===');
        console.log('New unread count:', unreadCount);
    }, [unreadCount]);


    // Fetch notifications (fallback for initial load)
    const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
        if (!authUser) return;

        setIsLoading(true);
        try {
            const response = await notificationService.getNotifications(pageNum, limit);
            const newNotifications = response.notifications || [];

            if (append) {
                setNotifications(prev => [...prev, ...newNotifications]);
            } else {
                setNotifications(newNotifications);
            }

            setHasMore(newNotifications.length === limit);
            setPage(pageNum);
        } catch (error) {
            showToast("Error", "Failed to fetch notifications", "error");
        } finally {
            setIsLoading(false);
        }
    }, [authUser, showToast]);

    // Fetch unread count (fallback for initial load)
    const fetchUnreadCount = useCallback(async () => {
        if (!authUser) return;

        try {
            const response = await notificationService.getUnreadCount();
            setUnreadCount(response.count || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, [authUser]);

    // Load more notifications
    const loadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            fetchNotifications(page + 1, true);
        }
    }, [isLoading, hasMore, page, fetchNotifications]);

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);

            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, isRead: true }
                        : notif
                )
            );

            // Update unread count
            setUnreadCount(prev => Math.max(0, prev - 1));

            // Acknowledge via WebSocket
            webSocketService.acknowledgeNotification(notificationId);

            showToast("Success", "Notification marked as read", "success");
        } catch (error) {
            showToast("Error", "Failed to mark notification as read", "error");
        }
    }, [showToast]);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.markAllAsRead();

            // Update local state
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, isRead: true }))
            );

            // Reset unread count
            setUnreadCount(0);

            showToast("Success", "All notifications marked as read", "success");
        } catch (error) {
            showToast("Error", "Failed to mark all notifications as read", "error");
        }
    }, [showToast]);

    // Delete notification
    const deleteNotification = useCallback(async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);

            // Update local state
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));

            // Update unread count if notification was unread
            const deletedNotif = notifications.find(notif => notif.id === notificationId);
            if (deletedNotif && !deletedNotif.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            showToast("Success", "Notification deleted", "success");
        } catch (error) {
            showToast("Error", "Failed to delete notification", "error");
        }
    }, [notifications, showToast]);

    // Delete all read notifications
    const deleteAllRead = useCallback(async () => {
        try {
            await notificationService.deleteAllRead();

            // Keep only unread notifications
            setNotifications(prev => prev.filter(notif => !notif.isRead));

            showToast("Success", "All read notifications deleted", "success");
        } catch (error) {
            showToast("Error", "Failed to delete read notifications", "error");
        }
    }, [showToast]);

    // Refresh notifications
    const refreshNotifications = useCallback(() => {
        setPage(1);
        fetchNotifications(1, false);
        fetchUnreadCount();
    }, [fetchNotifications, fetchUnreadCount]);

    // Initial load (only if WebSocket is not connected)
    useEffect(() => {
        if (authUser && !isWebSocketConnected) {
            fetchNotifications(1, false);
            fetchUnreadCount();
        }
    }, [authUser, isWebSocketConnected, fetchNotifications, fetchUnreadCount]);

    return {
        notifications,
        unreadCount,
        isLoading,
        hasMore,
        isWebSocketConnected,
        loadMore,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllRead,
        refreshNotifications
    };
};

export default useNotifications;
