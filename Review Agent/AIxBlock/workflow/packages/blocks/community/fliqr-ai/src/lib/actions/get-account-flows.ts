import { httpClient, HttpMethod } from 'workflow-blocks-common';
import { createAction } from 'workflow-blocks-framework';
import { fliqrAuth } from '../../index';
import { fliqrConfig } from '../common/models';

export const getFliqrAccountFlows = createAction({
  name: 'get_fliqr_account_flows',
  auth: fliqrAuth,
  displayName: 'Get Account Flows',
  description: 'Get all flows from the account',
  props: {},
  async run(context) {
    const res = await httpClient.sendRequest<string[]>({
      method: HttpMethod.GET,
      url: `${fliqrConfig.baseUrl}/accounts/flows`,
      headers: {
        [fliqrConfig.accessTokenHeaderKey]: context.auth,
      }
    });
    return res.body;
  },
});
