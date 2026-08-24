import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';

const base = '/tickets';

const ticketService = {
    async getTicketsByBooking(bookingId) {
        return unwrapApiArray(await apiClient.get(`${base}/booking/${bookingId}`));
    },

    async getTicketById(ticketId) {
        return unwrapApiData(await apiClient.get(`${base}/${ticketId}`));
    },

    triggerDownloadDataUrl(dataUrl, filename = 'ticket-qr.png') {
        if (!dataUrl) return;
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
};

export default ticketService;
