import QRCode from 'qrcode';
import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';

const base = '/tickets';

const createQrDataUrl = async (qrToken) => {
    if (!qrToken) return null;
    return QRCode.toDataURL(String(qrToken), {
        width: 320,
        margin: 2,
        errorCorrectionLevel: 'M',
    });
};

const triggerDownloadDataUrl = (dataUrl, filename = 'ticket-qr.png') => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const ticketService = {
    async getTicketsByBooking(bookingId) {
        return unwrapApiArray(await apiClient.get(`${base}/booking/${bookingId}`));
    },

    async getTicketById(ticketId) {
        return unwrapApiData(await apiClient.get(`${base}/${ticketId}`));
    },

    createQrDataUrl,
    triggerDownloadDataUrl,

    async downloadTicketQr(ticket) {
        if (!ticket?.qrToken) return false;
        const dataUrl = await createQrDataUrl(ticket.qrToken);
        const ticketName = ticket.ticketCode || ticket.seatName || ticket.id || 'ticket';
        triggerDownloadDataUrl(dataUrl, `hotcinema-${ticketName}.png`);
        return true;
    },
};

export default ticketService;
