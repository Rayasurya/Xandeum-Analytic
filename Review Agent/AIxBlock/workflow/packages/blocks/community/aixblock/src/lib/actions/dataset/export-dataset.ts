import { httpClient, HttpMethod } from 'workflow-blocks-common';
import { createAction, Property } from 'workflow-blocks-framework';
import { aixblockAuth } from '../../..';

export const exportData = createAction({
    name: 'export_data',
    auth: aixblockAuth,
    displayName: 'Export Data',
    description: 'Export project data in different formats (JSON, COCO, LLM)',
    props: {
        ml_id: Property.ShortText({
            displayName: 'Installed Model ID',
            description: 'Identifier of the ML model installed on the currently active compute environment, used for training or prediction',
            required: true,
        }),
        export_type: Property.StaticDropdown({
            displayName: 'Export Format',
            description: 'Format to export the data in',
            required: true,
            options: {
                options: [
                    { label: 'JSON', value: 'JSON' },
                    { label: 'COCO', value: 'COCO' },
                    { label: 'LLM', value: 'LLM' }
                ]
            }
        }),
    },
    async run({ auth, propsValue }) {
        try {
            // Log all props for debugging
            console.log('Props values:', JSON.stringify(propsValue));
            
            // Get export type (handle both string and object formats)
            const exportType = typeof propsValue.export_type === 'object' 
                ? (propsValue.export_type as any).value 
                : propsValue.export_type as string;
            
            console.log(`Exporting data in ${exportType} format...`);
            
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

            // Construct the export URL
            const exportUrl = `${auth.baseApiUrl}/api/projects/${project_id}/export?exportType=${exportType}`;
            console.log('Export URL:', exportUrl);
            
            // Make the export request
            const exportResponse = await httpClient.sendRequest({
                method: HttpMethod.GET,
                url: exportUrl,
                headers: {
                    Authorization: `Token ${auth.apiToken}`,
                    'Accept': 'application/json'
                },
                responseType: 'json'
            });
            
            console.log('Export completed');
            
            return {
                status: 'success',
                message: `Your ${exportType} data export is being processed. When completed, a notification will be sent to your registered email address.`,
                data: exportResponse.body
            };
        } catch (error) {
            console.error('Export error:', error);
            throw error;
        }
    },
});
