import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';
import webSocketService from '../services/websocketService';
import useNotificationToast from './useNotificationToast.jsx';

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

    // Initialize WebSocket connection
    useEffect(() => {
        console.log('=== NEW CODE RUNNING ===');
        console.log('useNotifications: useEffect triggered, authUser:', authUser);
        console.log('useNotifications: webSocketService object:', webSocketService);
        console.log('useNotifications: webSocketService methods:', Object.getOwnPropertyNames(Object.getOwnPropertyDescriptor(webSocketService, 'connect') ? webSocketService : Object.getPrototypeOf(webSocketService)));
        // Use uid instead of id since that's what the authUser object has
        const userId = authUser?.uid || authUser?.id;
        console.log('Extracted userId:', userId);
        if (authUser && userId) {
            console.log('useNotifications: Setting up WebSocket for user:', userId);

            // Set up WebSocket callbacks (only once)
            console.log('useNotifications: Setting up WebSocket callbacks...');

            webSocketService.onNotification((notification) => {
                console.log('=== WebSocket Notification Callback Fired ===');
                console.log('useNotifications: Received WebSocket notification:', notification);
                console.log('Current notifications state length:', notifications.length);
                handleWebSocketNotification(notification);
                console.log('After handleWebSocketNotification call');
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

            // Connect to WebSocket (only if not already connected to this user)
            if (!webSocketService.isConnectedToUser(userId)) {
                console.log('useNotifications: Calling webSocketService.connect...');
                webSocketService.connect(userId);
            } else {
                console.log('useNotifications: WebSocket already connected to user:', userId, 'skipping connection');
            }

            // Debug current WebSocket state
            webSocketService.debugState();

            // Check connection health
            const health = webSocketService.checkConnectionHealth();
            if (!health.isConnected && !health.connecting) {
                console.log('useNotifications: WebSocket not connected, attempting manual connection...');
                webSocketService.forceReset();
                setTimeout(() => {
                    webSocketService.connect(userId);
                }, 1000);
            }

            // Cleanup on unmount
            return () => {
                console.log('useNotifications: Cleaning up WebSocket connection');
                webSocketService.disconnect();
            };
        } else {
            console.log('useNotifications: No authUser or userId, skipping WebSocket setup. authUser:', authUser, 'userId:', userId);
        }
    }, [authUser]);

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

    // Handle incoming WebSocket notifications
    const handleWebSocketNotification = useCallback((notification) => {
        console.log('=== handleWebSocketNotification called ===');
        console.log('Notification to add:', notification);
        console.log('Current notifications state:', notifications);

        setNotifications(prev => {
            console.log('setNotifications callback - prev state:', prev);
            // Check if notification already exists
            const exists = prev.some(n => n.id === notification.id);
            console.log('Notification exists check:', exists);

            if (!exists) {
                const newState = [notification, ...prev];
                console.log('New notifications state:', newState);
                return newState;
            }
            console.log('Notification already exists, returning prev state');
            return prev;
        });

        // Update unread count if notification is unread
        if (!notification.isRead) {
            console.log('Updating unread count, current:', unreadCount);
            setUnreadCount(prev => {
                const newCount = prev + 1;
                console.log('New unread count:', newCount);
                return newCount;
            });
        }

        // Show enhanced toast for new notifications
        if (!notification.isRead) {
            console.log('Showing enhanced notification toast');
            showNotificationToast(notification);
        }

        console.log('=== handleWebSocketNotification completed ===');
    }, [showToast, notifications, unreadCount]);

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
