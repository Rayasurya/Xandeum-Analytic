import { api } from '@/lib/api';
import { CopilotConfig, CopilotWithoutSensitiveData } from 'workflow-shared';

export const copilotApi = {
    upsert(request: Omit<CopilotWithoutSensitiveData, 'id' | 'created' | 'updated' | 'platformId' | 'projectId'>) {
        return api.post<CopilotConfig>('/v1/copilot', request);
    },
    delete() {
        return api.delete(`/v1/copilot`);
    },
    get() {
        return api.get<CopilotConfig>(`/v1/copilot`);
    }
};
