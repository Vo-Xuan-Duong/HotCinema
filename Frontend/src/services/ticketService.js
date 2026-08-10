import { apiClient } from '@/utils/apiClient';

const ticketService = {
    async downloadBookingPDF(bookingId) {
        return apiClient.get(`/tickets/download-booking/${bookingId}`, {
            responseType: 'blob',
            headers: {
                Accept: 'application/pdf'
            }
        });
    },

    triggerDownload(blob, filename = 'ticket.pdf') {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
};

export default ticketService;
