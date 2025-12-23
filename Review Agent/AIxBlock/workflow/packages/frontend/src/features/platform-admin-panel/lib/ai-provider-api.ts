import { api } from '@/lib/api';
import {
    AiProviderConfig,
    AiProviderWithoutSensitiveData,
    SeekPage,
} from 'workflow-shared';

export const aiProviderApi = {
  list() {
    return api.get<SeekPage<AiProviderWithoutSensitiveData>>(
      '/v1/ai-providers',
    );
  },
  upsert(
    request: Omit<
      AiProviderWithoutSensitiveData,
      'id' | 'created' | 'updated' | 'platformId' | 'projectId'
    >,
  ) {
    return api.post<AiProviderConfig>('/v1/ai-providers', request);
  },
  delete(provider: string) {
    return api.delete(`/v1/ai-providers/${provider}`);
  },
};
