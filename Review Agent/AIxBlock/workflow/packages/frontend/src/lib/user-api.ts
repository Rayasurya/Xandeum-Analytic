import { UserWithMetaInformationAndProject } from 'workflow-shared';

import { api } from './api';

export const userApi = {
  getCurrentUser() {
    return api.get<UserWithMetaInformationAndProject>('/v1/users/me');
  },
};
