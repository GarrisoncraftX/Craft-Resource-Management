import { apiClient } from '@/utils/apiClient';

export interface EmailRequest {
  to: string | string[];
  subject: string;
  message: string;
  cc?: string[];
  bcc?: string[];
  attachments?: File[];
}

export interface SMSRequest {
  to: string | string[];
  message: string;
}

export interface NotificationRequest {
  type: 'email' | 'sms' | 'push';
  to: string | string[];
  subject?: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface CommunicationResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

class CommunicationApiService {
  async sendEmail(emailData: EmailRequest): Promise<CommunicationResponse> {
    return apiClient.post('/api/communication/email', emailData);
  }

  async sendSMS(smsData: SMSRequest): Promise<CommunicationResponse> {
    return apiClient.post('/api/communication/sms', smsData);
  }

  async sendNotification(notificationData: NotificationRequest): Promise<CommunicationResponse> {
    return apiClient.post('/api/communication/notification', notificationData);
  }
}

export const communicationApiService = new CommunicationApiService();
