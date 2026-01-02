import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Generic WebSocket Hook for Real-time Communication
 * @param {string} url - WebSocket URL (can include path params)
 * @param {Object} options - Configuration options
 * @param {Function} options.onMessage - Callback when message received
 * @param {Function} options.onConnect - Callback when connected
 * @param {Function} options.onDisconnect - Callback when disconnected
 * @param {Function} options.onError - Callback when error occurs
 * @param {boolean} options.autoConnect - Auto connect on mount (default: true)
 * @param {boolean} options.autoReconnect - Auto reconnect on disconnect (default: true)
 * @param {number} options.reconnectInterval - Reconnect interval in ms (default: 3000)
 * @param {number} options.maxReconnectAttempts - Max reconnect attempts (default: 5)
 * @param {number} options.heartbeatInterval - Heartbeat interval in ms (default: 30000)
 * @param {boolean} options.showConnectionMessage - Show connection success message (default: false)
 */
const useWebSocket = (url, options = {}) => {
    const {
        onMessage,
        onConnect,
        onDisconnect,
        onError,
        autoConnect = true,
        autoReconnect = true,
        reconnectInterval = 3000,
        maxReconnectAttempts = 5,
        heartbeatInterval = 30000,
        showConnectionMessage = false
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const heartbeatIntervalRef = useRef(null);
    const hasShownConnectionMessage = useRef(false);
    const messageHandlersRef = useRef(new Map());

    // Connect to WebSocket
    const connect = useCallback(() => {
        if (!url) {
            console.warn('WebSocket URL is not provided');
            return;
        }

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            console.log('WebSocket already connected');
            return;
        }

        try {
            console.log('Connecting to WebSocket:', url);
            wsRef.current = new WebSocket(url);

            wsRef.current.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                setReconnectAttempts(0);

                if (showConnectionMessage && !hasShownConnectionMessage.current) {
                    if (showConnectionMessage) {
                        console.log('Kết nối thành công!');
                    }
                    hasShownConnectionMessage.current = true;
                }

                if (onConnect) {
                    onConnect();
                }

                // Start heartbeat
                if (heartbeatInterval > 0) {
                    startHeartbeat();
                }
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    // Call general message handler
                    if (onMessage) {
                        onMessage(data);
                    }

                    // Call specific message type handlers
                    const handlers = messageHandlersRef.current.get(data.type);
                    if (handlers && handlers.length > 0) {
                        handlers.forEach(handler => {
                            try {
                                handler(data);
                            } catch (err) {
                                console.error('Error in message handler:', err);
                            }
                        });
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);

                if (onError) {
                    onError(error);
                }
            };

            wsRef.current.onclose = (event) => {
                console.log('WebSocket disconnected', event.code, event.reason);
                setIsConnected(false);
                stopHeartbeat();

                if (onDisconnect) {
                    onDisconnect(event);
                }

                // Auto reconnect with exponential backoff
                if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
                    const delay = Math.min(reconnectInterval * Math.pow(2, reconnectAttempts), 30000);
                    console.log(`Attempting to reconnect in ${delay}ms... (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        setReconnectAttempts(prev => prev + 1);
                        connect();
                    }, delay);
                } else if (reconnectAttempts >= maxReconnectAttempts) {
                    console.error('Không thể kết nối đến server. Vui lòng tải lại trang.');
                }
            };

        } catch (error) {
            console.error('Error creating WebSocket connection:', error);
            if (onError) {
                onError(error);
            }
        }
    }, [url, onMessage, onConnect, onDisconnect, onError, autoReconnect, reconnectInterval, maxReconnectAttempts, heartbeatInterval, showConnectionMessage, reconnectAttempts]);

    // Disconnect from WebSocket
    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        stopHeartbeat();
        setIsConnected(false);
        setReconnectAttempts(0);
        messageHandlersRef.current.clear();
    }, []);

    // Send message through WebSocket
    const send = useCallback((data) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const message = typeof data === 'string' ? data : JSON.stringify(data);
            wsRef.current.send(message);
            return true;
        } else {
            console.warn('WebSocket is not connected');
            return false;
        }
    }, []);

    // Register message handler for specific message type
    const on = useCallback((messageType, handler) => {
        if (!messageHandlersRef.current.has(messageType)) {
            messageHandlersRef.current.set(messageType, []);
        }
        messageHandlersRef.current.get(messageType).push(handler);
    }, []);

    // Unregister message handler
    const off = useCallback((messageType, handler) => {
        if (messageHandlersRef.current.has(messageType)) {
            const handlers = messageHandlersRef.current.get(messageType);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }, []);

    // Start heartbeat
    const startHeartbeat = useCallback(() => {
        if (heartbeatInterval <= 0) return;

        heartbeatIntervalRef.current = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                send({ type: 'ping' });
            }
        }, heartbeatInterval);
    }, [heartbeatInterval, send]);

    // Stop heartbeat
    const stopHeartbeat = useCallback(() => {
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }
    }, []);

    // Auto connect on mount
    useEffect(() => {
        if (autoConnect && url) {
            connect();
        }

        // Cleanup on unmount
        return () => {
            disconnect();
        };
    }, [autoConnect, url, connect, disconnect]);

    return {
        isConnected,
        reconnectAttempts,
        connect,
        disconnect,
        send,
        on,
        off
    };
};

export default useWebSocket;
