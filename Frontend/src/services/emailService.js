import { createCapabilityError } from '@/utils/backendCapability';

const emailService = {
  isTicketEmailSupported() {
    return false;
  },

  async sendTicketEmail() {
    // There is no EmailController/ticket-email command in the current backend.
    // Do not call the legacy GET /emails/send-ticket/{id} endpoint: sending
    // email is a state-changing command and GET would also be semantically wrong.
    throw createCapabilityError('gửi vé qua email');
  },
};

export default emailService;
