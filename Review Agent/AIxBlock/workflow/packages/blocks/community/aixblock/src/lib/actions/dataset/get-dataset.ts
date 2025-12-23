import { httpClient, HttpMethod } from 'workflow-blocks-common';
import { createAction, Property } from 'workflow-blocks-framework';
import { aixblockAuth } from '../../..';

export const getDataset = createAction({
    name: 'get_dataset',
    auth: aixblockAuth,
    displayName: 'Get Dataset',
    description: 'Retrieve dataset information from the AIxBlock marketplace',
    props: {
        ml_id: Property.ShortText({
            displayName: 'Installed Model ID',
            description: 'Identifier of the ML model installed on the currently active compute environment, used for training or prediction',
            required: true,
        }),
    },
    async run({ auth, propsValue }) {
        try {
            // Log request details for debugging
            console.log('Getting dataset for ML ID:', propsValue.ml_id);

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

            // Construct the API URL with query parameters
            const apiUrl = `${auth.baseApiUrl}/api/dataset_model_marketplace/?project_id=${project_id}`;
            console.log('API URL:', apiUrl);
            
            // Make the API request
            const response = await httpClient.sendRequest({
                method: HttpMethod.GET,
                url: apiUrl,
                headers: {
                    Authorization: `Token ${auth.apiToken}`,
                    'Accept': 'application/json'
                },
                responseType: 'json'
            });
            
            console.log('Dataset retrieval completed');
            
            // Return the dataset information
            return {
                status: 'success',
                message: 'Dataset information retrieved successfully',
                data: response.body
            };
        } catch (error) {
            console.error('Error retrieving dataset:', error);
            throw error;
        }
    },
});
