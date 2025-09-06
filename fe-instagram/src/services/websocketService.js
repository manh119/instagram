// WebSocket Service for real-time notifications
import { Client } from '@stomp/stompjs';
import { authService } from './authService';

class WebSocketService {
    constructor() {
        // Prevent multiple instances
        if (WebSocketService.instance) {
            console.log('Returning existing WebSocketService instance');
            return WebSocketService.instance;
        }

        console.log('Creating new WebSocketService instance');

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
        this.connecting = false;
        this.receivedNotificationIds = new Set(); // Track received notification IDs

        // Store the instance
        WebSocketService.instance = this;
        console.log('WebSocketService instance stored:', WebSocketService.instance);
    }

    /**
     * Initialize WebSocket connection
     */
    async connect(userId) {
        console.log('=== WebSocketService.connect called ===');
        console.log('WebSocketService.connect called with userId:', userId);
        console.log('Current instance:', this);
        console.log('Singleton instance:', WebSocketService.instance);

        // Prevent multiple connections for the same user
        if (this.isConnected && this.userId === userId) {
            console.log('WebSocket already connected for user:', userId);
            return;
        }

        // If connecting to a different user, disconnect first
        if (this.isConnected && this.userId !== userId) {
            console.log('Disconnecting from previous user before connecting to new user');
            this.disconnect();
        }

        // Add connection guard to prevent race conditions
        if (this.connecting) {
            console.log('WebSocket connection already in progress, skipping...');
            return;
        }

        // If we have a failed connection, allow retry after some time
        if (this.lastConnectionAttempt && Date.now() - this.lastConnectionAttempt < 5000) {
            console.log('Connection attempt too recent, skipping...');
            return;
        }

        this.connecting = true;
        this.lastConnectionAttempt = Date.now();
        this.userId = userId;
        console.log('Attempting to connect to WebSocket for user:', userId);
        console.log('User ID type:', typeof userId, 'Value:', userId);

        try {
            // Create STOMP client with native WebSocket
            const baseUrl = import.meta.env.VITE_API_BASE_URL;
            const wsUrl = `${baseUrl}/ws`.replace('http', 'ws');
            console.log('Base URL from env:', baseUrl);
            console.log('WebSocket URL constructed:', wsUrl);
            console.log('Environment variables:', import.meta.env);

            // Get JWT token for authentication
            const token = authService.getToken();
            const connectHeaders = {};

            if (token) {
                connectHeaders.Authorization = `Bearer ${token}`;
                console.log('Adding Authorization header to WebSocket connection');
            } else {
                console.warn('No JWT token available for WebSocket authentication');
            }

            console.log('Creating STOMP Client with config:', {
                brokerURL: wsUrl,
                reconnectDelay: this.reconnectDelay,
                connectHeaders: Object.keys(connectHeaders)
            });

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
                connectHeaders
            });

            console.log('STOMP Client created:', this.stompClient);

            // Set up event handlers
            console.log('Setting up STOMP event handlers...');
            this.stompClient.onConnect = this.onConnect.bind(this);
            this.stompClient.onDisconnect = this.onDisconnect.bind(this);
            this.stompClient.onStompError = this.onStompError.bind(this);
            this.stompClient.onWebSocketError = this.onWebSocketError.bind(this);
            console.log('Event handlers set up successfully');

            // Add connection state change listener
            this.stompClient.onWebSocketClose = () => {
                console.log('WebSocket connection closed');
                this.isConnected = false;
                this.connecting = false;
            };

            // Connect to WebSocket with timeout
            console.log('Activating STOMP client...');

            const connectionPromise = this.stompClient.activate();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('WebSocket connection timeout')), 10000)
            );

            await Promise.race([connectionPromise, timeoutPromise]);
            console.log('STOMP client activation completed');

            // Wait a bit for the connection to establish
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check if connection actually succeeded
            if (!this.isConnected) {
                console.error('STOMP client activation completed but connection failed');
                this.connecting = false;
                throw new Error('WebSocket connection failed after activation');
            }

            this.connecting = false;

        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
            console.error('Error details:', error.message, error.stack);
            this.connecting = false;
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
        console.error('STOMP error details:', frame.headers, frame.body);
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
        console.error('WebSocket error details:', error.message, error.type);
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

        // Clear existing subscriptions to prevent duplicates
        this.clearSubscriptions();

        console.log('Subscribing to user channels for user:', this.userId);

        // Subscribe to notifications
        const notificationSubscription = this.stompClient.subscribe(
            `/user/${this.userId}/queue/notifications`,
            (message) => {
                try {
                    console.log('Received notification message:', message);
                    const notification = JSON.parse(message.body);

                    // Deduplicate notifications by ID
                    if (this.receivedNotificationIds.has(notification.id)) {
                        console.log('Duplicate notification detected, skipping:', notification.id);
                        return;
                    }

                    // Add to received set
                    this.receivedNotificationIds.add(notification.id);

                    // Clean up old IDs (keep only last 100)
                    if (this.receivedNotificationIds.size > 100) {
                        const idsArray = Array.from(this.receivedNotificationIds);
                        this.receivedNotificationIds.clear();
                        idsArray.slice(-50).forEach(id => this.receivedNotificationIds.add(id));
                    }

                    console.log('=== Processing notification in WebSocket service ===');
                    console.log('Notification callback exists:', !!this.onNotificationCallback);
                    console.log('Notification callback function:', this.onNotificationCallback);

                    if (this.onNotificationCallback) {
                        console.log('Calling notification callback...');
                        this.onNotificationCallback(notification);
                        console.log('Notification callback completed');
                    } else {
                        console.warn('No notification callback registered!');
                    }
                } catch (error) {
                    console.error('Failed to parse notification:', error);
                }
            },
            { id: `notifications-${this.userId}` } // Add unique subscription ID
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

        // Store subscriptions for cleanup with unique IDs
        this.subscriptions.set(`notifications-${this.userId}`, notificationSubscription);
        this.subscriptions.set(`unread-count-${this.userId}`, unreadCountSubscription);

        console.log('Successfully subscribed to user channels with IDs:', `notifications-${this.userId}`, `unread-count-${this.userId}`);
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
        this.connecting = false;
        this.userId = null;
        this.clearSubscriptions();
        this.stopPingInterval();
        this.receivedNotificationIds.clear(); // Clear received notification IDs
    }

    /**
     * Force reset connection state
     */
    forceReset() {
        console.log('Force resetting WebSocket connection state...');
        this.disconnect();
        this.lastConnectionAttempt = 0;
        this.reconnectAttempts = 0;
    }

    /**
     * Clear received notification IDs
     */
    clearReceivedNotificationIds() {
        console.log('Clearing received notification IDs...');
        this.receivedNotificationIds.clear();
    }

    /**
 * Check connection health
 */
    checkConnectionHealth() {
        const health = {
            isConnected: this.isConnected,
            connecting: this.connecting,
            stompClientActive: this.stompClient?.active || false,
            webSocketReadyState: this.stompClient?.webSocket?.readyState || 'N/A',
            hasStompClient: !!this.stompClient,
            userId: this.userId,
            receivedNotificationCount: this.receivedNotificationIds.size
        };

        console.log('Connection Health Check:', health);
        return health;
    }

    /**
     * Get received notification IDs for debugging
     */
    getReceivedNotificationIds() {
        return Array.from(this.receivedNotificationIds);
    }

    /**
     * Set notification callback
     */
    onNotification(callback) {
        console.log('=== WebSocketService.onNotification called ===');
        console.log('Previous callback:', this.onNotificationCallback);
        console.log('New callback:', callback);
        this.onNotificationCallback = callback;
        console.log('Callback set successfully');
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
     * Check if connected to specific user
     */
    isConnectedToUser(userId) {
        return this.isConnected && this.userId === userId;
    }

    /**
     * Debug method to show current state
     */
    debugState() {
        console.log('WebSocket Debug State:', {
            isConnected: this.isConnected,
            userId: this.userId,
            connecting: this.connecting,
            subscriptionCount: this.subscriptions.size,
            subscriptions: Array.from(this.subscriptions.keys()),
            stompClientActive: this.stompClient?.active || false,
            webSocketReadyState: this.stompClient?.webSocket?.readyState || 'N/A',
            receivedNotificationCount: this.receivedNotificationIds.size
        });
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

// Add debugging to see if the service is being imported
console.log('=== WebSocket Service Module Loaded ===');
console.log('WebSocket service initialized:', webSocketService);
console.log('WebSocket service methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(webSocketService)));
console.log('Singleton instance check:', WebSocketService.instance === webSocketService);

export default webSocketService;
