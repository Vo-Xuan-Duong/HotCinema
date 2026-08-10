import { useEffect, useCallback, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';

/**
 * Custom Hook for Seat Booking WebSocket using STOMP.
 * In frontend mock mode we intentionally skip the real socket and expose a
 * connected state because seat lock/unlock is simulated by the mock API layer.
 * @param {string} showtimeId - ID of the showtime
 * @param {Function} onSeatUpdate - Callback when seat status changes
 */
const useSeatWebSocket = (showtimeId, onSeatUpdate) => {
    const [isConnected, setIsConnected] = useState(MOCK_API_ENABLED);
    const stompClientRef = useRef(null);
    const subscriptionRef = useRef(null);

    const getUserId = useCallback(() => {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem('userId', userId);
        }
        return userId;
    }, []);

    const handleMessage = useCallback((message) => {
        if (!onSeatUpdate) return;

        try {
            const data = JSON.parse(message.body);
            const { seatId, status } = data;

            if (!seatId || !status) {
                console.warn('Invalid seat WebSocket message:', data);
                return;
            }

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
                    updateType = 'unavailable';
                    break;
                case 'MAINTENANCE':
                    updateType = 'maintenance';
                    break;
                case 'BLOCKED':
                    updateType = 'blocked';
                    break;
                default:
                    updateType = 'available';
                    break;
            }

            onSeatUpdate({
                type: updateType,
                seatIds: [seatId],
                userId,
            });
        } catch (error) {
            console.error('Error parsing seat WebSocket message:', error);
        }
    }, [onSeatUpdate]);

    useEffect(() => {
        if (!showtimeId) {
            setIsConnected(false);
            return undefined;
        }

        if (MOCK_API_ENABLED) {
            setIsConnected(true);
            return () => setIsConnected(false);
        }

        const client = new Client({
            webSocketFactory: () => new SockJS(import.meta.env.VITE_BOOKING_WS_URL || 'http://localhost:8080/ws-booking'),
            connectHeaders: {
                userId: getUserId(),
            },
            debug: import.meta.env.DEV ? (message) => console.debug('STOMP:', message) : undefined,
            reconnectDelay: 3000,
            heartbeatIncoming: 30000,
            heartbeatOutgoing: 30000,
            onConnect: () => {
                setIsConnected(true);
                subscriptionRef.current = client.subscribe(`/topic/showtimes/${showtimeId}`, handleMessage);
            },
            onDisconnect: () => setIsConnected(false),
            onStompError: (frame) => {
                console.error('STOMP error:', frame.headers?.message || frame.body);
                setIsConnected(false);
            },
            onWebSocketError: (event) => {
                console.error('Seat WebSocket error:', event);
                setIsConnected(false);
            },
        });

        stompClientRef.current = client;
        client.activate();

        return () => {
            subscriptionRef.current?.unsubscribe();
            subscriptionRef.current = null;
            stompClientRef.current?.deactivate();
            stompClientRef.current = null;
            setIsConnected(false);
        };
    }, [showtimeId, handleMessage, getUserId]);

    return { isConnected };
};

export default useSeatWebSocket;
