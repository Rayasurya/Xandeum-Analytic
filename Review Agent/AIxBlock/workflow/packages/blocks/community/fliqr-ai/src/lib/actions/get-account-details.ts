import { httpClient, HttpMethod } from 'workflow-blocks-common';
import { createAction } from 'workflow-blocks-framework';
import { fliqrAuth } from '../../index';
import { fliqrConfig } from '../common/models';


export const getFliqrAccountDetails = createAction({
  name: 'get_fliqr_account_details',
  auth: fliqrAuth,
  displayName: 'Get Business Account details',
  description: 'Get basic account details of business',
  props: {},
  async run(context) {
    const res = await httpClient.sendRequest<string[]>({
      method: HttpMethod.GET,
      url: `${fliqrConfig.baseUrl}/accounts/me`,
      headers: {
        [fliqrConfig.accessTokenHeaderKey]: context.auth,
        },
    });
    return res.body;
  },
});