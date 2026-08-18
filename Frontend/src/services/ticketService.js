import { apiClient } from '@/utils/apiClient';
import { unwrapApiData } from '@/utils/apiResponse';
import { isEndpointUnavailable, rethrowCapabilityError } from '@/utils/backendCapability';
import { normalizeResourceId, sameResourceId } from '@/utils/resourceId';

const base = '/tickets';

const rowsOf = (response) => {
  const data = unwrapApiData(response);
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.content) ? data.content : [];
};

const ticketService = {
  async list(params = {}) {
    return rowsOf(await apiClient.get(base, { params: { page: 0, size: 500, ...params } }));
  },

  async getTicketById(id) {
    return unwrapApiData(await apiClient.get(`${base}/${normalizeResourceId(id)}`));
  },

  async getTicketsByBookingId(bookingId) {
    const id = normalizeResourceId(bookingId);
    try {
      return rowsOf(await apiClient.get(`${base}/booking/${id}`));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      return (await this.list()).filter((ticket) => sameResourceId(ticket.bookingId, id));
    }
  },

  async getTicketByCode(ticketCode) {
    const code = String(ticketCode || '').trim().toUpperCase();
    try {
      return unwrapApiData(await apiClient.get(`${base}/code/${encodeURIComponent(code)}`));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      return (await this.list()).find(
        (ticket) => String(ticket.ticketCode || '').trim().toUpperCase() === code,
      ) || null;
    }
  },

  async downloadBookingPDF(bookingId) {
    const id = normalizeResourceId(bookingId);
    try {
      return await apiClient.get(`${base}/download-booking/${id}`, {
        responseType: 'blob',
        headers: { Accept: 'application/pdf' },
      });
    } catch (error) {
      // The current backend exposes ticket records but no PDF renderer. Do not
      // download JSON/HTML under a misleading .pdf extension.
      rethrowCapabilityError('xuất vé PDF', error);
    }
  },

  async resolveBookingQrPayload(bookingId) {
    const tickets = await this.getTicketsByBookingId(bookingId);
    if (tickets.length === 0) return null;
    // Prefer server-issued qrToken. A ticket code is an identification fallback
    // for display only; validation still belongs to the backend scan command.
    return tickets.map((ticket) => ({
      id: ticket.id,
      ticketCode: ticket.ticketCode,
      status: ticket.status,
      qrPayload: ticket.qrToken
        ? `HOTCINEMA:TICKET:${ticket.qrToken}`
        : ticket.ticketCode
          ? `HOTCINEMA:TICKET-CODE:${ticket.ticketCode}`
          : null,
    }));
  },

  triggerDownload(blob, filename = 'ticket.pdf') {
    if (!(blob instanceof Blob)) throw new Error('Dữ liệu tải xuống không hợp lệ.');
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default ticketService;
