import {
  httpClient,
  HttpMethod
} from 'workflow-blocks-common';
import { createAction } from 'workflow-blocks-framework';
import { aixblockAuth } from '../../..';

export const getCurrentProfile = createAction({
  name: 'get_current_profile',
  auth: aixblockAuth,
  displayName: 'Get current profile',
  description: 'Function to get current profile of user in aixblock platform',
  props: {},
  async run({ auth }) {
    const response = await httpClient.sendRequest<string[]>({
      method: HttpMethod.GET,
      url: `${auth.baseApiUrl}/api/current-user/whoami`,
      headers: {
        "Authorization": `Token ${auth.apiToken}`
      }
    });

    return response.body;
  },
});
