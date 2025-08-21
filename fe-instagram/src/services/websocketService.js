// WebSocket Service for real-time notifications
import { Client } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.subscriptions = new Map();
        this.onNotificationCallback = null;
        this.onUnreadCountCallback = null;
        this.onConnectionChangeCallback = null;
        this.userId = null;
    }

    /**
     * Initialize WebSocket connection
     */
    async connect(userId) {
        if (this.isConnected) {
            console.log('WebSocket already connected');
            return;
        }

        this.userId = userId;
        console.log('Attempting to connect to WebSocket for user:', userId);

        try {
            // Create STOMP client with native WebSocket
            const wsUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/ws`.replace('http', 'ws');
            console.log('Connecting to WebSocket URL:', wsUrl);

            this.stompClient = new Client({
                brokerURL: wsUrl,
                debug: (str) => {
                    if (import.meta.env.DEV) {
                        console.log('STOMP Debug:', str);
                    }
                },
                reconnectDelay: this.reconnectDelay,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                connectHeaders: {
                    // Add any headers if needed
                }
            });

            // Set up event handlers
            this.stompClient.onConnect = this.onConnect.bind(this);
            this.stompClient.onDisconnect = this.onDisconnect.bind(this);
            this.stompClient.onStompError = this.onStompError.bind(this);
            this.stompClient.onWebSocketError = this.onWebSocketError.bind(this);

            // Connect to WebSocket
            console.log('Activating STOMP client...');
            await this.stompClient.activate();

        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
            this.handleReconnect();
        }
    }

    /**
     * Handle successful connection
     */
    onConnect(frame) {
        console.log('WebSocket connected successfully:', frame);
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Authenticate user
        this.authenticate();

        // Subscribe to user-specific channels
        this.subscribeToUserChannels();

        // Start ping interval
        this.startPingInterval();

        // Notify connection change
        if (this.onConnectionChangeCallback) {
            this.onConnectionChangeCallback(true);
        }
    }

    /**
     * Handle disconnection
     */
    onDisconnect() {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.clearSubscriptions();
        this.stopPingInterval();

        // Notify connection change
        if (this.onConnectionChangeCallback) {
            this.onConnectionChangeCallback(false);
        }

        // Attempt to reconnect
        this.handleReconnect();
    }

    /**
     * Handle STOMP errors
     */
    onStompError(frame) {
        console.error('STOMP error:', frame);
        this.isConnected = false;

        // Notify connection change
        if (this.onConnectionChangeCallback) {
            this.onConnectionChangeCallback(false);
        }
    }

    /**
     * Handle WebSocket errors
     */
    onWebSocketError(error) {
        console.error('WebSocket error:', error);
        this.isConnected = false;

        // Notify connection change
        if (this.onConnectionChangeCallback) {
            this.onConnectionChangeCallback(false);
        }
    }

    /**
     * Authenticate user with WebSocket
     */
    authenticate() {
        if (this.stompClient && this.isConnected && this.userId) {
            console.log('Authenticating user with WebSocket:', this.userId);
            this.stompClient.publish({
                destination: '/app/auth',
                body: JSON.stringify({ userId: this.userId })
            });
        }
    }

    /**
     * Subscribe to user-specific notification channels
     */
    subscribeToUserChannels() {
        if (!this.stompClient || !this.isConnected || !this.userId) {
            console.log('Cannot subscribe: client not ready or user not set');
            return;
        }

        console.log('Subscribing to user channels for user:', this.userId);

        // Subscribe to notifications
        const notificationSubscription = this.stompClient.subscribe(
            `/user/${this.userId}/queue/notifications`,
            (message) => {
                try {
                    console.log('Received notification message:', message);
                    const notification = JSON.parse(message.body);
                    if (this.onNotificationCallback) {
                        this.onNotificationCallback(notification);
                    }
                } catch (error) {
                    console.error('Failed to parse notification:', error);
                }
            }
        );

        // Subscribe to unread count updates
        const unreadCountSubscription = this.stompClient.subscribe(
            `/user/${this.userId}/queue/unread-count`,
            (message) => {
                try {
                    console.log('Received unread count message:', message);
                    const update = JSON.parse(message.body);
                    if (this.onUnreadCountCallback) {
                        this.onUnreadCountCallback(update.count);
                    }
                } catch (error) {
                    console.error('Failed to parse unread count update:', error);
                }
            }
        );

        // Store subscriptions for cleanup
        this.subscriptions.set('notifications', notificationSubscription);
        this.subscriptions.set('unread-count', unreadCountSubscription);

        console.log('Successfully subscribed to user channels');
    }

    /**
     * Start ping interval to keep connection alive
     */
    startPingInterval() {
        this.pingInterval = setInterval(() => {
            if (this.stompClient && this.isConnected) {
                this.stompClient.publish({
                    destination: '/app/ping',
                    body: JSON.stringify({ timestamp: Date.now() })
                });
            }
        }, 30000); // Ping every 30 seconds
    }

    /**
     * Stop ping interval
     */
    stopPingInterval() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    /**
     * Handle reconnection attempts
     */
    handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

        setTimeout(() => {
            if (this.userId) {
                this.connect(this.userId);
            }
        }, this.reconnectDelay * this.reconnectAttempts);
    }

    /**
     * Clear all subscriptions
     */
    clearSubscriptions() {
        this.subscriptions.forEach((subscription) => {
            if (subscription) {
                subscription.unsubscribe();
            }
        });
        this.subscriptions.clear();
    }

    /**
     * Disconnect WebSocket
     */
    disconnect() {
        console.log('Disconnecting WebSocket...');
        if (this.stompClient) {
            this.stompClient.deactivate();
        }
        this.isConnected = false;
        this.userId = null;
        this.clearSubscriptions();
        this.stopPingInterval();
    }

    /**
     * Set notification callback
     */
    onNotification(callback) {
        this.onNotificationCallback = callback;
    }

    /**
     * Set unread count callback
     */
    onUnreadCount(callback) {
        this.onUnreadCountCallback = callback;
    }

    /**
     * Set connection change callback
     */
    onConnectionChange(callback) {
        this.onConnectionChangeCallback = callback;
    }

    /**
     * Get connection status
     */
    getConnectionStatus() {
        return this.isConnected;
    }

    /**
     * Acknowledge notification
     */
    acknowledgeNotification(notificationId) {
        if (this.stompClient && this.isConnected) {
            this.stompClient.publish({
                destination: '/app/notifications/ack',
                body: JSON.stringify({ notificationId })
            });
        }
    }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
