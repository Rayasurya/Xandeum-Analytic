import { httpClient, HttpMethod } from 'workflow-blocks-common';
import { createAction, Property } from 'workflow-blocks-framework';
import { aixblockAuth } from '../../..';

export const downloadDataset = createAction({
    name: 'download_dataset',
    auth: aixblockAuth,
    displayName: 'Download Dataset',
    description: 'Download a dataset from the AIxBlock marketplace',
    props: {
        dataset_id: Property.ShortText({
            displayName: 'Dataset ID',
            description: 'The ID of the dataset to download',
            required: true,
        }),
        ml_id: Property.ShortText({
            displayName: 'Installed Model ID',
            description: 'Identifier of the ML model installed on the currently active compute environment, used for training or prediction',
            required: true,
        }),
    },
    async run({ auth, propsValue }) {
        try {
            // Log request details for debugging
            console.log('Downloading dataset with ID:', propsValue.dataset_id, 'for ML ID:', propsValue.ml_id);

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

            // Construct the API URL with dataset_id in path and project_id as query parameter
            const apiUrl = `${auth.baseApiUrl}/api/dataset_model_marketplace/download/${propsValue.dataset_id}?project_id=${project_id}`;
            console.log('Download URL:', apiUrl);
            
            // Make the API request to download the file
            console.log('Fetching dataset file...');
            
            try {
                // Make the request with responseType: 'arraybuffer' to get the binary data
                const response = await httpClient.sendRequest({
                    method: HttpMethod.GET,
                    url: apiUrl,
                    headers: {
                        Authorization: `Token ${auth.apiToken}`,
                        'Accept': '*/*'
                    },
                    responseType: 'arraybuffer'
                });
                
                // Get the filename from the Content-Disposition header if available
                let filename = `dataset_${propsValue.dataset_id}.zip`;
                const contentDisposition = response.headers?.['content-disposition'] as string || response.headers?.['Content-Disposition'] as string;
                if (contentDisposition) {
                    const filenameMatch = /filename="?([^"]+)"?/i.exec(contentDisposition);
                    if (filenameMatch && filenameMatch[1]) {
                        filename = filenameMatch[1];
                    }
                }
                
                // Get the dataset name from the X-Dataset-Name header if available
                const datasetName = (response.headers?.['x-dataset-name'] as string) || (response.headers?.['X-Dataset-Name'] as string) || 'Dataset';
                
                // Convert the binary data to base64
                const base64Data = Buffer.from(response.body as ArrayBuffer).toString('base64');
                
                // Create a data URL that can be used as a direct download link
                // This format allows browsers to treat it as a downloadable file when clicked
                const dataUrl = `data:application/zip;base64,${base64Data}`;
                
                console.log('Dataset file downloaded successfully');
                
                // Return the file data, metadata, and download link
                return {
                    status: 'success',
                    message: `Dataset "${datasetName}" downloaded successfully. Click the download link to save the file.`,
                    filename: filename,
                    dataset_name: datasetName,
                    download_link: dataUrl,  // Direct clickable link for download
                    file_data: base64Data,   // Raw base64 data if needed
                    content_type: 'application/zip',
                    dataset_id: propsValue.dataset_id,
                    project_id: project_id,
                    instructions: 'You can click the download_link directly to download the file, or use the file_data to create your own download mechanism.'
                };
            } catch (error) {
                console.error('Error downloading file:', error);
                
                // If we couldn't download the file directly, return the download URL as fallback
                return {
                    status: 'error',
                    message: 'Could not download the file directly. Please use the provided URL to download manually.',
                    download_url: apiUrl,
                    auth_token: auth.apiToken,
                    error: error instanceof Error ? error.message : String(error)
                };
            }
        } catch (error) {
            console.error('Error downloading dataset:', error);
            throw error;
        }
    },
});
