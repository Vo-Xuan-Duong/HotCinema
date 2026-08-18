import { useEffect, useCallback, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';
import { getAccessToken, getUserInfo } from '@/utils/authStorage';
import { normalizeResourceId } from '@/utils/resourceId';

const BOOKING_WS_URL = String(import.meta.env.VITE_BOOKING_WS_URL || '').trim();

const statusToUpdateType = (status) => {
  switch (String(status || '').toUpperCase()) {
    case 'HELD': return 'locked';
    case 'AVAILABLE': return 'unlocked';
    case 'BOOKED': return 'booked';
    case 'UNAVAILABLE': return 'unavailable';
    case 'MAINTENANCE': return 'maintenance';
    case 'BLOCKED': return 'blocked';
    default: return null;
  }
};

const useSeatWebSocket = (showtimeId, onSeatUpdate) => {
  const isSupported = MOCK_API_ENABLED || Boolean(BOOKING_WS_URL);
  const [isConnected, setIsConnected] = useState(MOCK_API_ENABLED);
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);

  const getUserId = useCallback(() => {
    const user = getUserInfo();
    return normalizeResourceId(user?.id) || null;
  }, []);

  const handleMessage = useCallback((message) => {
    if (!onSeatUpdate) return;
    try {
      const data = JSON.parse(message.body);
      const seatIds = Array.isArray(data.seatIds)
        ? data.seatIds
        : data.seatId != null
          ? [data.seatId]
          : [];
      const updateType = data.type || statusToUpdateType(data.status);
      if (!seatIds.length || !updateType) return;

      onSeatUpdate({
        ...data,
        type: updateType,
        seatIds: seatIds.map(normalizeResourceId).filter((id) => id != null),
        userId: normalizeResourceId(data.userId ?? data.heldByUserId),
      });
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error parsing seat WebSocket message:', error);
    }
  }, [onSeatUpdate]);

  useEffect(() => {
    if (!showtimeId || !isSupported) {
      setIsConnected(false);
      return undefined;
    }

    if (MOCK_API_ENABLED) {
      setIsConnected(true);
      return () => setIsConnected(false);
    }

    const token = getAccessToken();
    const userId = getUserId();
    const client = new Client({
      webSocketFactory: () => new SockJS(BOOKING_WS_URL),
      connectHeaders: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(userId ? { userId: String(userId) } : {}),
      },
      debug: import.meta.env.DEV ? (message) => console.debug('STOMP:', message) : undefined,
      reconnectDelay: 5000,
      heartbeatIncoming: 30000,
      heartbeatOutgoing: 30000,
      onConnect: () => {
        setIsConnected(true);
        subscriptionRef.current = client.subscribe(`/topic/showtimes/${normalizeResourceId(showtimeId)}`, handleMessage);
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: (frame) => {
        if (import.meta.env.DEV) console.error('STOMP error:', frame.headers?.message || frame.body);
        setIsConnected(false);
      },
      onWebSocketError: (event) => {
        if (import.meta.env.DEV) console.error('Seat WebSocket error:', event);
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
  }, [showtimeId, handleMessage, getUserId, isSupported]);

  return { isConnected, isSupported };
};

export { statusToUpdateType };
export default useSeatWebSocket;
