import { apiClient } from './client';

export interface LegalDocument {
  id: string;
  title: string;
  version: string;
  content: string;
}

export interface UserLegalStatus {
  acceptedTermsAt: string | null;
  acceptedPrivacyAt: string | null;
  acceptedHealthDataConsentAt: string | null;
}

export const legalApi = {
  getDocuments: async (): Promise<LegalDocument[]> => {
    const { data } = await apiClient.get<LegalDocument[]>('/legal/documents');
    return data;
  },

  getDocument: async (id: string): Promise<LegalDocument> => {
    const { data } = await apiClient.get<LegalDocument>(`/legal/documents/${id}`);
    return data;
  },

  acceptDocument: async (documentType: string): Promise<void> => {
    await apiClient.post('/users/me/accept-legal', { documentType });
  },

  getUserLegalStatus: async (): Promise<UserLegalStatus> => {
    const { data } = await apiClient.get<UserLegalStatus>('/users/me/legal-status');
    return data;
  },
};
