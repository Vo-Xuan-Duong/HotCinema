import { apiClient } from '@/utils/apiClient';

const unwrap = (response) => response?.data ?? response;

const supportService = {
  async sendMessage(message, conversationId) {
    const response = await apiClient.post('/support/chat', { message, conversationId });
    return unwrap(response);
  },
};

export default supportService;
