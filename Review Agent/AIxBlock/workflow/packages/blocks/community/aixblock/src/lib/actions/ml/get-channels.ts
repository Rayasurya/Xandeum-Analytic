import { httpClient, HttpMethod } from 'workflow-blocks-common';
import { createAction, Property } from 'workflow-blocks-framework';
import { aixblockAuth } from '../../..';

interface MlNetwork {
    id: number;
    project_id: number;
    name: string;
    model_id: number;
    type?: string;
}

interface MlInfo {
    id: number;
    url: string;
    install_status: string;
    state?: string;
    title?: string;
    status?: string;
}

export const getChannels = createAction({
    name: 'get_channels',
    auth: aixblockAuth,
    displayName: 'Get Channels',
    description: 'Retrieves channels information from AIxBlock API',
    props: {
        ml_id: Property.ShortText({
            displayName: 'Installed Model ID',
            description: 'Identifier of the ML model installed on the currently active compute environment, used for training or prediction',
            required: true,
        }),
        channel: Property.ShortText({
            displayName: 'Channel ID',
            description: 'Optional. Specific channel ID to fetch. If not provided, all channels will be retrieved.',
            required: false,
        }),
    },
    async run({ auth, propsValue }) {
        const apiToken = auth.apiToken;
        
        // Log request info
        console.log('Starting channels request for ml_id:', propsValue.ml_id);
        
        try {
            // Get ML Info directly
            const mlInfoResponse = await httpClient.sendRequest({
                method: HttpMethod.GET,
                url: `${auth.baseApiUrl}/api/ml/${propsValue.ml_id}`,
                headers: {
                    Authorization: `Token ${auth.apiToken}`
                }
            });
            const mlInfo = mlInfoResponse.body;

            // Check if the model is ready
            if (!mlInfo) {
                throw new Error('ML Info not found');
            }
            if (mlInfo.install_status === 'installing') {
                console.log('ML Info status: installing');
                return { status: 'installing', message: 'The model is still being installed. Please try again later.' };
            }

            // We'll use the /action endpoint with the status command
            console.log('Using action endpoint with status command...');
            const endpoint = `${mlInfo.url}/action`;

            // Prepare body parameters in the correct format
            const bodyParams = {
                command: 'status',
                params: {
                    channel: propsValue.channel || null
                }
            };
            
            
            console.log('Status request body:', JSON.stringify(bodyParams));
            console.log('Status request url:', endpoint);

            // Make the API request, retry with reset if 500 error (using try/catch)
            let response;
            try {
                response = await httpClient.sendRequest({
                method: HttpMethod.POST,
                url: `${mlInfo.url}/action`,
                headers: {
                    'Authorization': `Token ${apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: bodyParams
            });
            } catch (err: any) {
                if (err.status === 500) {
                const { resetMlProxyUrl } = await import('../../common/ml-proxy');
                const newProxyUrl = await resetMlProxyUrl(auth, mlInfo.project);
                    try {
                    response = await httpClient.sendRequest({
                        method: HttpMethod.POST,
                        url: `${newProxyUrl}/action`,
                        headers: {
                            'Authorization': `Token ${apiToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: bodyParams
                    });
                    } catch (err2) {
                        throw err2;
                    }
                } else {
                    throw err;
                }
            }
            // Log response status
            console.log(`Channel API response status: ${response.status}`);
            
            // Transform channels: only show hf_model_id if status === 'done'
            let newData = response.body;
            if (newData && newData.channels && Array.isArray(newData.channels)) {
                newData = {
                    ...newData,
                    channels: newData.channels.map((ch: any) => {
                        if (typeof ch.status === 'string' && ch.status.toLowerCase() === 'done') {
                            return ch;
                        } else {
                            const { hf_model_id, ...rest } = ch;
                            return rest;
                        }
                    })
                };
            } else if (newData && newData.data && Array.isArray(newData.data.channels)) {
                newData = {
                    ...newData,
                    data: {
                        ...newData.data,
                        channels: newData.data.channels.map((ch: any) => {
                            if (typeof ch.status === 'string' && ch.status.toLowerCase() === 'done') {
                                return ch;
                            } else {
                                const { hf_model_id, ...rest } = ch;
                                return rest;
                            }
                        })
                    }
                };
            }
            return {
                success: response.status === 200,
                status_code: response.status,
                data: newData
            };
        } catch (error) {
            console.error('Error getting channels:', error);
            throw error;
        }
    },
})

/**
 * Get ML Network information
 */
async function getMlNetwork(auth: any, projectId: string, modelId?: string): Promise<any> {
    console.log('Getting ML Network...');
    const queryParams: Record<string, string> = {
        project_id: projectId
    };

    if (modelId) {
        queryParams['model_id'] = modelId;
    }
    
    console.log('ML Network query params:', queryParams);

    const response = await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: `${auth.baseApiUrl}/api/ml/ml-network`,
        headers: {
            Authorization: `Token ${auth.apiToken}`
        },
        queryParams
    });

    console.log('ML Network response:', response.body);
    return response.body;
}

/**
 * Get ML information
 */
import { getMlProxyUrl } from '../../common/ml-proxy';

async function getMlInfo(auth: any, projectId: string, mlNetworkId: string, isDeploy: boolean = false): Promise<MlInfo[]> {
    console.log('Getting ML Proxy URL...');
    const proxyUrl = await getMlProxyUrl(auth, projectId, mlNetworkId);
    if (!proxyUrl) {
        throw new Error('installing');
    }
    // Optionally, you can fetch more info from the proxy if needed, or just return the url
    return [{ id: 0, url: proxyUrl, install_status: '', state: '', title: '', status: '' } as MlInfo];
}
