import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';
import { ENDPOINTS } from '@/utils/constants';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';
import { normalizeSeatStatus, normalizeSeatType } from '@/lib/seatPresentation';
import { normalizeResourceId, sameResourceId } from '@/utils/resourceId';

let seatTypeCache = null;

const rowsOf = (response) => {
  const data = unwrapApiData(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return unwrapApiArray(response);
};

const rowLabelToNumber = (label) => {
  const normalized = String(label || '').trim().toUpperCase();
  if (!normalized) return 1;
  return [...normalized].reduce((value, char) => (value * 26) + (char.charCodeAt(0) - 64), 0) || 1;
};

const numberToRowLabel = (rowNumber) => {
  let current = Math.max(1, Number(rowNumber) || 1);
  let label = '';
  while (current > 0) {
    const remainder = (current - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    current = Math.floor((current - 1) / 26);
  }
  return label || 'A';
};

const physicalStatusToUi = (value) => {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'MAINTENANCE') return 'maintenance';
  if (['DISABLED', 'INACTIVE', 'BLOCKED'].includes(normalized)) return 'blocked';
  return 'available';
};

const toPhysicalStatus = (value) => {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'MAINTENANCE') return 'MAINTENANCE';
  if (['DISABLED', 'INACTIVE', 'BLOCKED', 'UNAVAILABLE'].includes(normalized)) return 'DISABLED';
  return 'ACTIVE';
};

const fetchSeatTypes = async ({ force = false } = {}) => {
  if (MOCK_API_ENABLED) return [];
  if (!force && seatTypeCache) return seatTypeCache;
  const response = await apiClient.get(ENDPOINTS.SEAT_TYPES, { params: { page: 0, size: 100 } });
  seatTypeCache = rowsOf(response);
  return seatTypeCache;
};

const fetchRawSeats = async () => rowsOf(
  await apiClient.get(ENDPOINTS.SEATS, { params: { page: 0, size: 2000 } }),
);

const getSeatTypeMap = async () => {
  const types = await fetchSeatTypes();
  return new Map(types.map((type) => [String(type.id), type]));
};

const normalizeBackendSeat = (seat, typeById = new Map()) => {
  const type = typeById.get(String(seat.seatTypeId)) || seat.seatType || {};
  const seatTypeCode = type.code || type.name || seat.seatTypeCode || 'REGULAR';
  const rowLabel = seat.rowLabel || numberToRowLabel(seat.yPosition);
  const seatNumber = Number(seat.seatNumber ?? seat.xPosition) || 1;
  const rowIndex = Number(seat.yPosition) || rowLabelToNumber(rowLabel);
  const uiStatus = physicalStatusToUi(seat.status);

  return {
    ...seat,
    auditoriumId: seat.auditoriumId,
    roomId: seat.auditoriumId,
    theaterId: seat.auditoriumId,
    seatTypeId: seat.seatTypeId,
    seatType: seatTypeCode,
    type: normalizeSeatType(seatTypeCode),
    rowLabel,
    row: rowIndex,
    rowIndex,
    seatNumber,
    number: seatNumber,
    col: seatNumber,
    name: seat.displayName || `${rowLabel}${seatNumber}`,
    displayName: seat.displayName || `${rowLabel}${seatNumber}`,
    physicalStatus: String(seat.status || 'ACTIVE').toUpperCase(),
    status: uiStatus,
    seatStatus: uiStatus === 'available' ? 'AVAILABLE' : uiStatus === 'maintenance' ? 'MAINTENANCE' : 'BLOCKED',
  };
};

const resolveSeatTypeId = async (data, existing = {}) => {
  const explicit = normalizeResourceId(data.seatTypeId);
  if (explicit) return explicit;

  const currentId = normalizeResourceId(existing.seatTypeId);
  const requested = data.seatType ?? data.type;
  if (requested == null && currentId) return currentId;

  const requestedUiType = normalizeSeatType(requested || 'REGULAR');
  const types = await fetchSeatTypes();
  const match = types.find((type) => normalizeSeatType(type.code || type.name) === requestedUiType);
  if (match?.id) return normalizeResourceId(match.id);
  if (types.length === 1) return normalizeResourceId(types[0].id);

  throw new Error(`Không tìm thấy cấu hình loại ghế “${requested || 'REGULAR'}” trên backend.`);
};

const toBackendPayload = async (data, existing = {}) => {
  const displayNameInput = String(data.displayName ?? data.name ?? existing.displayName ?? '').trim();
  const nameMatch = displayNameInput.match(/^([A-Z]+)\s*(\d+)$/i);
  const rowLabel = String(
    data.rowLabel
      ?? nameMatch?.[1]
      ?? existing.rowLabel
      ?? numberToRowLabel(data.row ?? data.yPosition),
  ).toUpperCase();
  const seatNumber = Number(data.seatNumber ?? data.col ?? nameMatch?.[2] ?? existing.seatNumber ?? existing.xPosition);
  const xPosition = Number(data.xPosition ?? data.col ?? existing.xPosition ?? seatNumber);
  const yPosition = Number(data.yPosition ?? data.row ?? existing.yPosition ?? rowLabelToNumber(rowLabel));
  const auditoriumId = normalizeResourceId(
    data.auditoriumId ?? data.roomId ?? data.theaterId ?? existing.auditoriumId,
  );

  if (!auditoriumId) throw new Error('Thiếu auditoriumId khi lưu ghế.');
  if (!Number.isFinite(seatNumber) || seatNumber < 1) throw new Error('Số ghế không hợp lệ.');
  if (!Number.isFinite(xPosition) || !Number.isFinite(yPosition)) throw new Error('Tọa độ ghế không hợp lệ.');

  return {
    auditoriumId,
    seatTypeId: await resolveSeatTypeId(data, existing),
    rowLabel,
    seatNumber,
    displayName: displayNameInput || `${rowLabel}${seatNumber}`,
    xPosition,
    yPosition,
    status: toPhysicalStatus(data.seatStatus ?? data.status ?? existing.status),
  };
};

const runInBatches = async (items, worker, batchSize = 8) => {
  const results = [];
  for (let index = 0; index < items.length; index += batchSize) {
    const chunk = items.slice(index, index + batchSize);
    results.push(...await Promise.all(chunk.map(worker)));
  }
  return results;
};

const seatService = {
  clearSeatTypeCache() {
    seatTypeCache = null;
  },

  async getAllSeatTypes({ force = false } = {}) {
    return fetchSeatTypes({ force });
  },

  async createSeat(seatData) {
    if (MOCK_API_ENABLED) return unwrapApiData(await apiClient.post(ENDPOINTS.SEATS, seatData));
    const payload = await toBackendPayload(seatData);
    const created = unwrapApiData(await apiClient.post(ENDPOINTS.SEATS, payload));
    return normalizeBackendSeat(created, await getSeatTypeMap());
  },

  async getSeatById(id) {
    const normalizedId = normalizeResourceId(id);
    const seat = unwrapApiData(await apiClient.get(`${ENDPOINTS.SEATS}/${normalizedId}`));
    if (MOCK_API_ENABLED) return seat;
    return normalizeBackendSeat(seat, await getSeatTypeMap());
  },

  async getSeatsByRoomId(roomId) {
    const id = normalizeResourceId(roomId);
    if (MOCK_API_ENABLED) {
      return unwrapApiArray(await apiClient.get(`${ENDPOINTS.SEATS}/theater/${id}`));
    }

    const [seats, typeById] = await Promise.all([fetchRawSeats(), getSeatTypeMap()]);
    return seats
      .filter((seat) => sameResourceId(seat.auditoriumId, id))
      .map((seat) => normalizeBackendSeat(seat, typeById));
  },

  async getActiveSeatsByRoomId(roomId) {
    if (MOCK_API_ENABLED) {
      return unwrapApiArray(await apiClient.get(`${ENDPOINTS.SEATS}/theater/${normalizeResourceId(roomId)}/active`));
    }
    return (await this.getSeatsByRoomId(roomId)).filter((seat) => normalizeSeatStatus(seat.status) === 'available');
  },

  async getSeatsBySeatType(seatType) {
    if (MOCK_API_ENABLED) {
      return unwrapApiArray(await apiClient.get(`${ENDPOINTS.SEATS}/type/${encodeURIComponent(seatType)}`));
    }
    const requestedType = normalizeSeatType(seatType);
    const [seats, typeById] = await Promise.all([fetchRawSeats(), getSeatTypeMap()]);
    return seats
      .map((seat) => normalizeBackendSeat(seat, typeById))
      .filter((seat) => normalizeSeatType(seat.type) === requestedType);
  },

  async getSeatsByRoomAndType(roomId, seatType) {
    if (MOCK_API_ENABLED) {
      return unwrapApiArray(await apiClient.get(
        `${ENDPOINTS.SEATS}/theater/${normalizeResourceId(roomId)}/type/${encodeURIComponent(seatType)}`,
      ));
    }
    const requestedType = normalizeSeatType(seatType);
    return (await this.getSeatsByRoomId(roomId))
      .filter((seat) => normalizeSeatType(seat.type) === requestedType);
  },

  async getSeatsByCinemaId(cinemaId) {
    const id = normalizeResourceId(cinemaId);
    if (MOCK_API_ENABLED) {
      return unwrapApiArray(await apiClient.get(`${ENDPOINTS.SEATS}/cinema/${id}`));
    }

    const [auditoriumsResponse, seats, typeById] = await Promise.all([
      apiClient.get(ENDPOINTS.AUDITORIUMS, { params: { page: 0, size: 500 } }),
      fetchRawSeats(),
      getSeatTypeMap(),
    ]);
    const auditoriumIds = new Set(
      rowsOf(auditoriumsResponse)
        .filter((room) => sameResourceId(room.cinemaId, id))
        .map((room) => String(room.id)),
    );
    return seats
      .filter((seat) => auditoriumIds.has(String(seat.auditoriumId)))
      .map((seat) => normalizeBackendSeat(seat, typeById));
  },

  async getSeatByPosition(roomId, rowLabel, seatNumber) {
    if (MOCK_API_ENABLED) {
      return unwrapApiData(await apiClient.get(
        `${ENDPOINTS.SEATS}/theater/${normalizeResourceId(roomId)}/position/${encodeURIComponent(rowLabel)}/${seatNumber}`,
      ));
    }
    return (await this.getSeatsByRoomId(roomId)).find((seat) => (
      String(seat.rowLabel).toUpperCase() === String(rowLabel).toUpperCase()
      && Number(seat.seatNumber) === Number(seatNumber)
    )) || null;
  },

  async updateSeat(id, seatData) {
    const normalizedId = normalizeResourceId(id);
    if (MOCK_API_ENABLED) {
      return unwrapApiData(await apiClient.put(`${ENDPOINTS.SEATS}/${normalizedId}`, seatData));
    }

    const existing = unwrapApiData(await apiClient.get(`${ENDPOINTS.SEATS}/${normalizedId}`));
    const payload = await toBackendPayload(seatData, existing);
    const updated = unwrapApiData(await apiClient.put(`${ENDPOINTS.SEATS}/${normalizedId}`, payload));
    return normalizeBackendSeat(updated, await getSeatTypeMap());
  },

  async patchSeat(id, partialData) {
    if (MOCK_API_ENABLED) {
      return unwrapApiData(await apiClient.patch(`${ENDPOINTS.SEATS}/${normalizeResourceId(id)}`, partialData));
    }
    return this.updateSeat(id, partialData);
  },

  async activateSeat(id) {
    if (MOCK_API_ENABLED) {
      return unwrapApiData(await apiClient.patch(`${ENDPOINTS.SEATS}/${normalizeResourceId(id)}/activate`));
    }
    return this.updateSeat(id, { status: 'ACTIVE' });
  },

  async deactivateSeat(id) {
    if (MOCK_API_ENABLED) {
      return unwrapApiData(await apiClient.patch(`${ENDPOINTS.SEATS}/${normalizeResourceId(id)}/deactivate`));
    }
    return this.updateSeat(id, { status: 'DISABLED' });
  },

  async deleteSeat(id) {
    return apiClient.delete(`${ENDPOINTS.SEATS}/${normalizeResourceId(id)}`);
  },

  async createBulkSeatsForRoom(roomId, rowsCount, seatsPerRow) {
    const id = normalizeResourceId(roomId);
    const rows = Math.max(1, Number(rowsCount) || 1);
    const columns = Math.max(1, Number(seatsPerRow) || 1);

    if (MOCK_API_ENABLED) {
      return unwrapApiData(await apiClient.post(
        `${ENDPOINTS.SEATS}/theater/${id}/create-bulk`,
        null,
        { params: { rows, rowsCount: rows, seatsPerRow: columns } },
      ));
    }

    const existingSeats = await this.getSeatsByRoomId(id);
    const occupied = new Set(existingSeats.map((seat) => `${String(seat.rowLabel).toUpperCase()}:${Number(seat.seatNumber)}`));
    const missing = [];

    for (let row = 1; row <= rows; row += 1) {
      const rowLabel = numberToRowLabel(row);
      for (let col = 1; col <= columns; col += 1) {
        if (occupied.has(`${rowLabel}:${col}`)) continue;
        missing.push({
          auditoriumId: id,
          rowLabel,
          seatNumber: col,
          displayName: `${rowLabel}${col}`,
          xPosition: col,
          yPosition: row,
          seatType: 'REGULAR',
          status: 'ACTIVE',
        });
      }
    }

    return runInBatches(missing, (seat) => this.createSeat(seat));
  },

  async deleteAllSeatsByRoomId(roomId) {
    const id = normalizeResourceId(roomId);
    if (MOCK_API_ENABLED) {
      return unwrapApiData(await apiClient.delete(`${ENDPOINTS.SEATS}/theater/${id}`));
    }
    const seats = await this.getSeatsByRoomId(id);
    return runInBatches(seats, (seat) => this.deleteSeat(seat.id));
  },
};

export default seatService;
