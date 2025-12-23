import axios from 'axios';
import fs from 'fs';
import { createAction, Property } from 'workflow-blocks-framework';
import { aixblockAuth } from '../../common/auth';

const FormData = require('form-data');

export const uploadLocalFileDatasetToProject = createAction({
    name: 'upload-dataset',
    displayName: 'Upload local file dataset to project',
    description: 'Upload local file dataset to project',
    auth: aixblockAuth,
    props: {
        ml_id: Property.ShortText({
            displayName: 'Installed Model ID',
            description: 'Identifier of the ML model installed on the currently active compute environment, used for training or prediction',
            required: true,
        }),
        localFilePath: Property.ShortText({
            displayName: 'Local file path',
            description: 'NOTE: Local file path should be generated before that',
            required: true,
        }),
    },
    async run(context) {
        // Fetch ML info to get project_id
        const mlResponse = await axios.get(
            `${context.auth.baseApiUrl}/api/ml/${context.propsValue.ml_id}`,
            {
                headers: { Authorization: `Token ${context.auth.apiToken}` }
            }
        );
        const mlInfo = mlResponse.data;
        const project_id = mlInfo.project;
        if (!project_id) throw new Error('Could not resolve project_id from ml_id');

        let data = new FormData();
        data.append('project_id', project_id);
        data.append('file', fs.createReadStream(context.propsValue.localFilePath));

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${context.auth.baseApiUrl}/api/import/upload-dataset`,
            headers: {
                Authorization: `Token ${context.auth.apiToken}`,
                ...data.getHeaders(),
            },
            data: data,
        };

        const response = await axios.request(config);

        return response.data;
    },
});
