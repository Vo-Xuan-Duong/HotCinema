import { apiClient } from '@/utils/apiClient';

const ticketService = {
    /**
     * Download booking PDF
     * @param {number|string} bookingId - Booking ID
     * @returns {Promise<Blob>} PDF file as blob
     */
    async downloadBookingPDF(bookingId) {
        try {
            const response = await apiClient.get(`/tickets/download-booking/${bookingId}`, {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf'
                }
            });

            console.log('Downloaded booking PDF response:', response);
            return response;
        } catch (error) {
            console.error('Error downloading booking PDF:', error);
            throw error;
        }
    },

    /**
     * Trigger download in browser
     * @param {Blob} blob - PDF blob
     * @param {string} filename - File name
     */
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
