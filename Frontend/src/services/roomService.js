import { apiClient } from '@/utils/apiClient';
import { ENDPOINTS } from '@/utils/constants';
import { unwrapApiArray, unwrapApiData, unwrapApiPage } from '@/utils/apiResponse';

const validScreenTypes = new Set(['STANDARD', 'IMAX', 'TYPE_4DX', 'SCREENX']);

const toBackendScreenType = (room = {}) => {
    if (room.theaterType === 'FOUR_DX' || room.theaterType === '4DX') return 'TYPE_4DX';
    if (room.theaterType === 'SCREEN_X' || room.theaterType === 'SCREENX') return 'SCREENX';
    if (room.theaterType === 'IMAX' || room.theaterType === 'IMAX_3D') return 'IMAX';
    if (validScreenTypes.has(room.screenType)) return room.screenType;
    return 'STANDARD';
};

const toFrontendTheaterType = (screenType) => {
    if (screenType === 'IMAX') return 'IMAX';
    if (screenType === 'TYPE_4DX') return 'FOUR_DX';
    if (screenType === 'SCREENX') return 'SCREEN_X';
    return 'TWO_D';
};

const normalizeRoom = (room = {}) => ({
    ...room,
    theaterType: room.theaterType || toFrontendTheaterType(room.screenType),
    numberOfRows: Number(room.numberOfRows ?? room.totalRows ?? room.rowsCount ?? 0),
    numberOfColumns: Number(room.numberOfColumns ?? room.totalColumns ?? room.seatsPerRow ?? 0),
    rowsCount: Number(room.rowsCount ?? room.totalRows ?? room.numberOfRows ?? 0),
    seatsPerRow: Number(room.seatsPerRow ?? room.totalColumns ?? room.numberOfColumns ?? 0),
    totalSeats: Number(room.totalSeats ?? room.capacity ?? 0),
});

const normalizePage = (page) => {
    const normalized = unwrapApiPage(page);
    return {
        ...normalized,
        content: Array.isArray(normalized.content) ? normalized.content.map(normalizeRoom) : [],
    };
};

const makeRoomCode = (room = {}) => {
    if (room.code?.trim()) return room.code.trim().toUpperCase();
    const base = String(room.name || 'ROOM')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toUpperCase();
    return (base || 'ROOM').slice(0, 50);
};

const toBackendPayload = (room = {}, cinemaId) => {
    const totalRows = Number(room.totalRows ?? room.numberOfRows ?? room.rowsCount ?? 0);
    const totalColumns = Number(room.totalColumns ?? room.numberOfColumns ?? room.seatsPerRow ?? 0);
    return {
        ...(cinemaId ? { cinemaId: String(cinemaId) } : {}),
        code: makeRoomCode(room),
        name: String(room.name || '').trim(),
        screenType: toBackendScreenType(room),
        totalRows,
        totalColumns,
        capacity: Math.max(0, totalRows * totalColumns),
        status: room.status || 'ACTIVE',
    };
};

const roomService = {
    async getAllRooms(params = {}) {
        const queryParams = {
            page: params.page || 0,
            size: params.size || 20,
            ...(params.sort && { sort: params.sort }),
        };
        return normalizePage(await apiClient.get(`${ENDPOINTS.ROOMS}/page`, { params: queryParams }));
    },

    async getRoomById(id) {
        return normalizeRoom(unwrapApiData(await apiClient.get(`${ENDPOINTS.ROOMS}/${id}`)) || {});
    },

    async getRoomsByCinemaId(cinemaId) {
        const rooms = unwrapApiArray(await apiClient.get(`${ENDPOINTS.ROOMS}/cinema/${cinemaId}`));
        return rooms.map(normalizeRoom);
    },

    async createRoom(cinemaId, roomData) {
        return normalizeRoom(unwrapApiData(await apiClient.post(
            `${ENDPOINTS.ROOMS}/cinema/${cinemaId}`,
            toBackendPayload(roomData, cinemaId)
        )) || {});
    },

    async updateRoom(id, roomData) {
        return normalizeRoom(unwrapApiData(await apiClient.put(
            `${ENDPOINTS.ROOMS}/${id}`,
            toBackendPayload(roomData)
        )) || {});
    },

    async deleteRoom(id) {
        return unwrapApiData(await apiClient.delete(`${ENDPOINTS.ROOMS}/${id}`));
    },

    async deleteAllRoomsByCinemaId(cinemaId) {
        const rooms = await this.getRoomsByCinemaId(cinemaId);
        await Promise.all(rooms.map((room) => this.deleteRoom(room.id)));
    },

    mapRoomTypeToBackend(frontendType) {
        const typeMap = {
            '2D': 'STANDARD',
            '3D': 'STANDARD',
            IMAX: 'IMAX',
            VIP: 'STANDARD',
            '4DX': 'TYPE_4DX',
            SCREENX: 'SCREENX',
        };
        return typeMap[frontendType] || 'STANDARD';
    },

    mapRoomTypeToFrontend(backendType) {
        const typeMap = {
            STANDARD: '2D',
            IMAX: 'IMAX',
            TYPE_4DX: '4DX',
            SCREENX: 'SCREENX',
        };
        return typeMap[backendType] || '2D';
    },

    async getRoomsForDropdown(cinemaId) {
        const rooms = await this.getRoomsByCinemaId(cinemaId);
        return rooms.map((room) => ({
            value: room.id,
            label: room.name,
            type: this.mapRoomTypeToFrontend(room.screenType),
            totalSeats: room.totalSeats,
        }));
    },
};

export default roomService;
