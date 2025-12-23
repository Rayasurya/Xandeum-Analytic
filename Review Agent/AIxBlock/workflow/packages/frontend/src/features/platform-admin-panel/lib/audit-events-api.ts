import { api } from '@/lib/api';
import {
    ApplicationEvent,
    ListAuditEventsRequest,
} from 'workflow-axb-shared';
import { SeekPage } from 'workflow-shared';

export const auditEventsApi = {
  list(request: ListAuditEventsRequest) {
    return api.get<SeekPage<ApplicationEvent>>('/v1/audit-events', request);
  },
};
