import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';
import useShowToast from './useShowToast';

const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const { user: authUser } = useAuth();
    const showToast = useShowToast();

    const limit = 20;

    // Fetch notifications
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

    // Fetch unread count
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

    // Initial load
    useEffect(() => {
        if (authUser) {
            fetchNotifications(1, false);
            fetchUnreadCount();
        }
    }, [authUser, fetchNotifications, fetchUnreadCount]);

    return {
        notifications,
        unreadCount,
        isLoading,
        hasMore,
        fetchNotifications,
        fetchUnreadCount,
        loadMore,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllRead,
        refreshNotifications
    };
};

export default useNotifications;
