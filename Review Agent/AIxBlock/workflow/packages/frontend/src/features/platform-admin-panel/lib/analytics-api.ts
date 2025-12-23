import { api } from '@/lib/api';
import { AnalyticsReportResponse } from 'workflow-shared';

export const analyticsApi = {
  get(): Promise<AnalyticsReportResponse> {
    return api.get<AnalyticsReportResponse>('/v1/analytics');
  },
};
