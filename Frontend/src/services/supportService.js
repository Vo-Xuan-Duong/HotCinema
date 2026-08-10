import { apiClient } from '@/utils/apiClient';
import { unwrapApiData } from '@/utils/apiResponse';

const supportService = {
  async sendMessage(message, conversationId) {
    return unwrapApiData(await apiClient.post('/support/chat', { message, conversationId }));
  },
};

export default supportService;
