import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';
import { ENDPOINTS } from '@/utils/constants';
import { normalizeResourceId, sameResourceId } from '@/utils/resourceId';

const ROOM_BASE = MOCK_API_ENABLED ? '/rooms' : ENDPOINTS.AUDITORIUMS;

const toUiRoomType = (screenType) => {
  const value = String(screenType || '').toUpperCase();
  if (value === 'IMAX') return 'IMAX';
  if (value === 'TYPE_4DX') return '4DX';
  if (value === 'SCREENX') return 'SCREENX';
  return 'STANDARD_2D';
};

const toScreenType = (roomType) => {
  const value = String(roomType || '').toUpperCase();
  if (value === 'IMAX') return 'IMAX';
  if (['4DX', 'TYPE_4DX'].includes(value)) return 'TYPE_4DX';
  if (value === 'SCREENX') return 'SCREENX';
  return 'STANDARD';
};

const roomCode = (room = {}) => {
  if (room.code) return String(room.code).trim().toUpperCase();
  const fromName = String(room.name || 'ROOM')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return fromName || 'ROOM';
};

const normalizeRoom = (room = {}) => {
  const totalRows = Number(room.totalRows ?? room.rowsCount ?? room.numberOfRows ?? 0);
  const totalColumns = Number(room.totalColumns ?? room.seatsPerRow ?? room.numberOfColumns ?? 0);
  const capacity = Number(room.capacity ?? room.totalSeats ?? (totalRows * totalColumns));
  const status = String(room.status || (room.isActive === false ? 'INACTIVE' : 'ACTIVE')).toUpperCase();
  const screenType = room.screenType || toScreenType(room.roomType || room.theaterType);

  return {
    ...room,
    cinemaId: room.cinemaId ?? room.cinema?.id,
    screenType,
    roomType: room.roomType || toUiRoomType(screenType),
    theaterType: room.theaterType || toUiRoomType(screenType),
    totalRows,
    totalColumns,
    rowsCount: totalRows,
    seatsPerRow: totalColumns,
    numberOfRows: totalRows,
    numberOfColumns: totalColumns,
    capacity,
    totalSeats: capacity,
    status,
    isActive: status === 'ACTIVE',
  };
};

const toBackendPayload = (cinemaId, room = {}) => {
  const totalRows = Math.max(1, Number(room.totalRows ?? room.rowsCount ?? room.numberOfRows ?? 1));
  const totalColumns = Math.max(1, Number(room.totalColumns ?? room.seatsPerRow ?? room.numberOfColumns ?? 1));
  return {
    cinemaId: normalizeResourceId(cinemaId ?? room.cinemaId),
    code: roomCode(room),
    name: String(room.name || '').trim(),
    screenType: toScreenType(room.screenType || room.roomType || room.theaterType),
    totalRows,
    totalColumns,
    capacity: Math.max(1, Number(room.capacity ?? room.totalSeats ?? (totalRows * totalColumns))),
    status: String(room.status || (room.isActive === false ? 'INACTIVE' : 'ACTIVE')).toUpperCase(),
  };
};

const contentOf = (response) => {
  const data = unwrapApiData(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return unwrapApiArray(response);
};

const roomService = {
  async getAllRooms(params = {}) {
    const response = await apiClient.get(ROOM_BASE, {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
        ...(params.sort && { sort: params.sort }),
      },
    });
    const data = unwrapApiData(response);
    if (Array.isArray(data)) return data.map(normalizeRoom);
    if (data?.content) return { ...data, content: data.content.map(normalizeRoom) };
    return data;
  },

  async getRoomById(id) {
    return normalizeRoom(unwrapApiData(await apiClient.get(`${ROOM_BASE}/${normalizeResourceId(id)}`)));
  },

  async getRoomsByCinemaId(cinemaId) {
    const id = normalizeResourceId(cinemaId);
    if (MOCK_API_ENABLED) {
      return contentOf(await apiClient.get(`${ROOM_BASE}/cinema/${id}`)).map(normalizeRoom);
    }

    const response = await apiClient.get(ROOM_BASE, { params: { page: 0, size: 500 } });
    return contentOf(response)
      .map(normalizeRoom)
      .filter((room) => sameResourceId(room.cinemaId, id));
  },

  async createRoom(cinemaId, roomData) {
    if (MOCK_API_ENABLED) {
      return normalizeRoom(unwrapApiData(await apiClient.post(`${ROOM_BASE}/cinema/${normalizeResourceId(cinemaId)}`, roomData)));
    }
    return normalizeRoom(unwrapApiData(await apiClient.post(ROOM_BASE, toBackendPayload(cinemaId, roomData))));
  },

  async updateRoom(id, roomData) {
    const normalizedId = normalizeResourceId(id);
    if (MOCK_API_ENABLED) {
      return normalizeRoom(unwrapApiData(await apiClient.put(`${ROOM_BASE}/${normalizedId}`, roomData)));
    }
    const current = await this.getRoomById(normalizedId);
    return normalizeRoom(unwrapApiData(await apiClient.put(
      `${ROOM_BASE}/${normalizedId}`,
      toBackendPayload(current.cinemaId, { ...current, ...roomData }),
    )));
  },

  async deleteRoom(id) {
    return apiClient.delete(`${ROOM_BASE}/${normalizeResourceId(id)}`);
  },

  async deleteAllRoomsByCinemaId(cinemaId) {
    const id = normalizeResourceId(cinemaId);
    if (MOCK_API_ENABLED) return apiClient.delete(`${ROOM_BASE}/cinema/${id}`);
    const rooms = await this.getRoomsByCinemaId(id);
    await Promise.all(rooms.map((room) => this.deleteRoom(room.id)));
    return { deleted: rooms.length };
  },

  mapRoomTypeToBackend(frontendType) {
    return toScreenType(frontendType);
  },

  mapRoomTypeToFrontend(backendType) {
    return toUiRoomType(backendType);
  },

  async getRoomsForDropdown(cinemaId) {
    const rooms = await this.getRoomsByCinemaId(cinemaId);
    return rooms.map((room) => ({
      value: room.id,
      label: room.name,
      type: room.roomType,
      totalSeats: room.totalSeats,
    }));
  },
};

export { normalizeRoom, toBackendPayload as toAuditoriumPayload };
export default roomService;
