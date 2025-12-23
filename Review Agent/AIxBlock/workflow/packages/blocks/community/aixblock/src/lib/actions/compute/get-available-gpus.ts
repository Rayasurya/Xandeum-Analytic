import { httpClient, HttpMethod } from "workflow-blocks-common";
import { createAction, Property } from "workflow-blocks-framework";
import { aixblockAuth } from '../../..';

export const getAvailableGpus = createAction({
    name: 'get_available_gpus',
    displayName: 'Get Available GPUs',
    description: 'Get available GPUs for a project',
    auth: aixblockAuth,
    props: {
        project_id: Property.ShortText({
            displayName: 'Project ID',
            description: 'ID of the project to get GPUs for',
            required: true,
        }),
        // is_using: Property.Number({
        //     displayName: 'Is Using',
        //     description: 'Filter by usage status (0: not in use, 1: in use)',
        //     required: false,
        //     defaultValue: 0,
        // }),
        compute_type: Property.StaticDropdown({
            displayName: 'Compute Type',
            description: 'Type of compute service',
            required: false,
            defaultValue: 'model-training',
            options: {
                options: [
                    { label: 'Model Training', value: 'model-training' },
                ]
            }
        })
    },
    async run({ auth, propsValue }) {
        if (!propsValue.project_id) {
            throw new Error('Project ID is required');
        }

        const response = await httpClient.sendRequest({
            method: HttpMethod.GET,
            url: `${auth.baseApiUrl}/api/compute_marketplace/gpus`,
            queryParams: {
                project_id: propsValue.project_id,
                is_using: "0",
                compute_type: propsValue.compute_type || 'model-training'
            },
            headers: {
                Authorization: `Token ${auth.apiToken}`
            }
        });

        return response.body;
    }
});
