import { httpClient, HttpMethod } from 'workflow-blocks-common';
import { createAction, Property } from 'workflow-blocks-framework';
import { aixblockAuth } from '../../..';

export const setupDataset = createAction({
    name: 'setup_dataset',
    auth: aixblockAuth,
    displayName: 'Setup Dataset',
    description: 'Attach a dataset to a project.',
    props: {
        ml_id: Property.ShortText({
            displayName: 'ML ID',
            description: 'The ML model/network ID to derive project context',
            required: true,
        }),
        dataset_id: Property.ShortText({
            displayName: 'Dataset ID',
            description: 'The ID of the dataset to attach.',
            required: true,
        }),
    },
    async run({ auth, propsValue }) {
        try {
            // Fetch ML info to get project_id
            const mlResponse = await httpClient.sendRequest({
                method: HttpMethod.GET,
                url: `${auth.baseApiUrl}/api/ml/${propsValue.ml_id}`,
                headers: {
                    Authorization: `Token ${auth.apiToken}`
                },
                responseType: 'json'
            });
            const mlInfo = mlResponse.body;
            const project_id = mlInfo.project;
            if (!project_id) throw new Error('Could not resolve project_id from ml_id');

            const response = await httpClient.sendRequest({
                method: HttpMethod.PATCH,
                url: `${auth.baseApiUrl}/api/dataset_model_marketplace/${propsValue.dataset_id}`,
                headers: {
                    Authorization: `Token ${auth.apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: {
                    project_id: project_id
                }
            });
            if (response.status === 200) {
                return { message: 'Updating dataset succeeded.' };
            } else {
                return { error: response.body?.error || 'Failed to update dataset.' };
            }
        } catch (error) {
            return { error: error instanceof Error ? error.message : String(error) };
        }
    },
});
