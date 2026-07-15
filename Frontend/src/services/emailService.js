import { apiClient } from '@/utils/apiClient';

const emailService = {
    /**
     * Send ticket email by booking ID
     * @param {number|string} bookingId - Booking ID
     * @returns {Promise} Response message
     */
    async sendTicketEmail(bookingId) {
        try {
            const response = await apiClient.get(`/emails/send-ticket/${bookingId}`);
            return response.data;
        } catch (error) {
            console.error('Error sending ticket email:', error);
            throw error;
        }
    }
};

export default emailService;
