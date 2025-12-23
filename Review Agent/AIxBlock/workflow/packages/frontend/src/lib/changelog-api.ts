import { ListChangelogsResponse } from 'workflow-shared';

import { api } from './api';

export const changelogApi = {
  list(): Promise<ListChangelogsResponse> {
    return api.get<ListChangelogsResponse>('/v1/changelogs');
  },
};
