import { useEffect, useCallback, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import useNotification from './useNotification';

/**
 * Custom Hook for Seat Booking WebSocket using STOMP
 * Specific implementation for seat reservation system
 * @param {string} showtimeId - ID of the showtime
 * @param {Function} onSeatUpdate - Callback when seat status changes
 */
const useSeatWebSocket = (showtimeId, onSeatUpdate) => {
    const [isConnected, setIsConnected] = useState(false);
    const stompClientRef = useRef(null);
    const subscriptionRef = useRef(null);

    // Helper function to get user ID
    const getUserId = useCallback(() => {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('userId', userId);
        }
        return userId;
    }, []);

    const handleMessage = useCallback((message) => {
        if (!onSeatUpdate) return;

        try {
            const data = JSON.parse(message.body);
            console.log('WebSocket message received:', data);

            // Backend trả về: { seatId: 123, status: "AVAILABLE/HELD/BOOKED/UNAVAILABLE/MAINTENANCE/BLOCKED" }
            const { seatId, status } = data;

            if (!seatId || !status) {
                console.warn('Invalid message format:', data);
                return;
            }

            // Chuyển đổi status từ backend sang type cho frontend
            let updateType;
            let userId = null;

            switch (status.toUpperCase()) {
                case 'HELD':
                    updateType = 'locked';
                    userId = data.userId || null;
                    break;
                case 'AVAILABLE':
                    updateType = 'unlocked';
                    break;
                case 'BOOKED':
                    updateType = 'booked';
                    break;
                case 'UNAVAILABLE':
                case 'MAINTENANCE':
                case 'BLOCKED':
                    updateType = 'booked'; // Treat as unavailable
                    break;
                default:
                    updateType = 'available';
                    break;
            }

            onSeatUpdate({
                type: updateType,
                seatIds: [seatId], // seatId là number (long), luôn convert thành array
                userId: userId
            });

            // Hiển thị thông báo cho ghế booked
            if (status.toUpperCase() === 'BOOKED') {
                // Notification will be handled by the component using this hook
                console.log(`Ghế vừa được đặt.`);
            }

        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }, [onSeatUpdate]);

    useEffect(() => {
        if (!showtimeId) {
            console.warn('No showtimeId provided, skipping WebSocket connection');
            return;
        }

        console.log('Initializing STOMP WebSocket connection for showtime:', showtimeId);

        // Create STOMP client
        const client = new Client({
            // Use SockJS as WebSocket transport
            webSocketFactory: () => new SockJS('http://localhost:8080/ws-booking'),

            // Connection headers
            connectHeaders: {
                userId: getUserId()
            },

            // Debug logging
            debug: (str) => {
                console.log('STOMP Debug:', str);
            },

            // Reconnect settings
            reconnectDelay: 3000,
            heartbeatIncoming: 30000,
            heartbeatOutgoing: 30000,

            // Connection callback
            onConnect: () => {
                console.log('STOMP WebSocket connected for showtime:', showtimeId);
                setIsConnected(true);

                // Subscribe to showtime-specific topic
                subscriptionRef.current = client.subscribe(
                    `/topic/showtimes/${showtimeId}`,
                    handleMessage
                );

                console.log('Subscribed to /topic/showtimes/' + showtimeId);
            },

            // Disconnect callback
            onDisconnect: () => {
                console.log('STOMP WebSocket disconnected');
                setIsConnected(false);
            },

            // Error callback
            onStompError: (frame) => {
                console.error('STOMP error:', frame.headers['message']);
                console.error('Details:', frame.body);
                setIsConnected(false);
            },

            // WebSocket error callback
            onWebSocketError: (event) => {
                console.error('WebSocket error:', event);
            }
        });

        stompClientRef.current = client;

        // Activate the connection
        client.activate();

        // Cleanup on unmount
        return () => {
            console.log('Cleaning up STOMP WebSocket connection');

            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }

            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }

            setIsConnected(false);
        };
    }, [showtimeId, handleMessage, getUserId]);

    return {
        isConnected
    };
};

export default useSeatWebSocket;
