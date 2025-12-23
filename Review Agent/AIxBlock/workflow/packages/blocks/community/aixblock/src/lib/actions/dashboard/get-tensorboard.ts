import { httpClient, HttpMethod } from "workflow-blocks-common";
import { createAction, Property } from "workflow-blocks-framework";
import { aixblockAuth } from '../../..';

interface TensorboardResponse {
    dashboard_url: string;
    proxy_url: string;
    tensorboard_url: string;
}

export const getTensorboard = createAction({
    name: 'get_tensorboard',
    displayName: 'Get Tensorboard',
    description: 'Get Tensorboard URL for a specific project and backend',
    auth: aixblockAuth,
    props: {
        ml_id: Property.ShortText({
            displayName: 'Installed Model ID',
            description: 'Identifier of the ML model installed on the currently active compute environment, used for training or prediction',
            required: true,
        }),
    },
    async run({ auth, propsValue }) {
        if (!propsValue.ml_id) {
            throw new Error('ML ID is required');
        }

        // Fetch ML Info to get project
        const mlResponse = await httpClient.sendRequest({
            method: HttpMethod.GET,
            url: `${auth.baseApiUrl}/api/ml/${propsValue.ml_id}`,
            headers: {
                Authorization: `Token ${auth.apiToken}`
            }
        });
        const mlInfo = mlResponse.body;
        const projectId = mlInfo.project;
        if (!projectId) throw new Error('Could not resolve project from mlInfo');

        // Call the new tensorboard API with project and backend_id
        const tensorboardResponse = await httpClient.sendRequest({
            method: HttpMethod.GET,
            url: `${auth.baseApiUrl}/api/projects/${projectId}/tensorboard?backend_id=${propsValue.ml_id}`,
            headers: {
                Authorization: `Token ${auth.apiToken}`
            },
            responseType: 'json'
        });
        // Remap 'proxy_url' to 'ml_url' in the response
        const { tensorboard_url, proxy_url, dashboard_url, ...rest } = tensorboardResponse.body;
        return {
            tensorboard_url: tensorboard_url || '',
            ml_url: proxy_url || '',
            dashboard_url: dashboard_url || '',
            ...rest
        };

    }
});