import { httpClient, HttpMethod } from "workflow-blocks-common";
import { createAction, Property } from "workflow-blocks-framework";
import { aixblockAuth } from '../../..';

export const getMlNetwork = createAction({
    name: 'get_ml_network',
    displayName: 'Get ML Network',
    description: 'Get ML network information for a project',
    auth: aixblockAuth,
    props: {
        project_id: Property.ShortText({
            displayName: 'Project ID',
            description: 'ID of the project to get ML network for',
            required: true,
        })
    },
    async run({ auth, propsValue }) {
        if (!propsValue.project_id) {
            throw new Error('Project ID is required');
        }

        const response = await httpClient.sendRequest({
            method: HttpMethod.GET,
            url: `${auth.baseApiUrl}/api/ml/ml-network`,
            queryParams: {
                project_id: propsValue.project_id
            },
            headers: {
                Authorization: `Token ${auth.apiToken}`
            }
        });

        return response.body;
    },
});
