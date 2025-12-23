import { httpClient, HttpMethod } from 'workflow-blocks-common';
import { createAction, Property } from 'workflow-blocks-framework';
import { aixblockAuth } from '../common/auth';

interface ComputeGpu {
    id: number;
    gpu_name: string;
    gpu_index: number;
    gpu_id: string;
    type: string;
    power_consumption?: string | null;
    gpu_memory?: string;
    gpu_tflops?: string;
    location_name?: string;
    status?: string;
}


interface NetworkHistory {
    id: number;
    ml_network: {
        id: number;
        project_id: number;
        name: string;
        model_id: number;
        type: string;
    };
    status: string;
}

interface MlInfo {
    id: number;
    url: string;
    install_status: string;
    state?: string;
    title?: string;
    status?: string;
    compute_gpu?: ComputeGpu;
    network_history?: NetworkHistory;
    project: number;
    status_training?: string;
}


/**
 * Get ML information
 */

async function getMlInfo(auth: any, mlId: string): Promise<MlInfo> {
    console.log('Getting ML Info...');
    const response = await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: `${auth.baseApiUrl}/api/ml/${mlId}`,
        headers: {
            Authorization: `Token ${auth.apiToken}`
        }
    });
    return response.body as MlInfo;
}

export const textToAudio = createAction({
    name: 'text_to_audio',
    auth: aixblockAuth,
    displayName: 'Text to Audio',
    description: '',
    props: {
        model_id: Property.Dropdown({
            displayName: 'Model',
            description: 'Select a model to predict',
            required: true,
            refreshers: [],
            async options({ auth }) {
                // Fix: assert auth type for TypeScript
                const typedAuth = auth as { apiToken: string; baseApiUrl: string };
                // Fetch model from API
                const headers = { Authorization: `Token ${typedAuth.apiToken}` };
                const response = await httpClient.sendRequest({
                    method: HttpMethod.GET,
                    url: `${typedAuth.baseApiUrl}/api/model_marketplace/?page=1&page_size=12&name=AI+AIXBlock`,
                    headers
                });
                
                // Check if we have results
                if (response.body?.results && response.body.results.length > 0) {
                    // Just take the first model from results
                    const firstModel = response.body.results[0];
                    console.log('Selected model:', firstModel.name);
                    
                    // Return just this one model as the only option
                    return {
                        options: [{ 
                            label: firstModel.name, 
                            value: JSON.stringify(firstModel) 
                        }]
                    };
                }
                
                // Fallback if no results found
                return { options: [] };
            }
        }),
        prompt: Property.ShortText({
            displayName: 'Prompt Input',
            description: 'Text prompt for audio generation',
            required: true,
            defaultValue: '',
        })
    },
    async run(context) {
        const { auth, propsValue } = context;
        try {
            // Log all props for debugging
            console.log('Props values:', JSON.stringify(propsValue));

            // 1. Call list-build-model API to get current built models
            const buildModelRes = await httpClient.sendRequest({
                method: HttpMethod.GET,
                url: `${auth.baseApiUrl}/api/model_marketplace/list-build-model?page=1&page_size=1000&type=rent`,
                headers: { Authorization: `Token ${auth.apiToken}` },
            });
            const buildModels = buildModelRes.body?.results || [];
            const builtWithCompute = buildModels.filter((bm: any) => bm.model_marketplace && bm.model_marketplace.related_compute !== null);
            console.log('Built with compute:', builtWithCompute);
            // Try to find a built model with the selected model_id
            // Parse selected model info from dropdown value
            const selectedModel = typeof propsValue.model_id === 'string' ? JSON.parse(propsValue.model_id) : propsValue.model_id;
            console.log('Selected model:', selectedModel);
            let selectedBuild = builtWithCompute.find((bm: any) => bm.model_marketplace.model_id == selectedModel.model_id || bm.model_marketplace.id == selectedModel.id);
            let mlIdToUse: number | null = null;

            if (selectedBuild) {
                // Use the ml_id from the built model
                mlIdToUse = selectedBuild.model_marketplace.ml_id;
                console.log('Selected build:', selectedBuild);
            } else {
                // Not built, replicate logic from add-model.ts
                // 1. Create a new project
                const now = new Date();
                const pad = (n: number) => n.toString().padStart(2, '0');
                const title = `Project ${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
                const projectBody = {
                    title,
                    color: "#a2a2a2",
                    label_config: "<View>\n  <Header value=\"Please read the text\" />\n  </View>\n\n\n",
                    label_config_title: "",
                    annotation_template: null,
                    template_id: 24,
                    type: {},
                    epochs: 1,
                    batch_size: 1,
                    image_width: 64,
                    image_height: 64,
                    flow_type: "fine-tune-and-deploy"
                };
                const projectRes = await httpClient.sendRequest({
                    method: HttpMethod.POST,
                    url: `${auth.baseApiUrl}/api/projects/`,
                    body: projectBody,
                    headers: {
                        Authorization: `Token ${auth.apiToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                const project_id = projectRes.body.id;
                // 2. Link or create S3 storage
                const storagesRes = await httpClient.sendRequest({
                    method: HttpMethod.GET,
                    url: `${auth.baseApiUrl}/api/storages/global`,
                    headers: { Authorization: `Token ${auth.apiToken}` }
                });
                let storageLinked = false;
                if (Array.isArray(storagesRes.body)) {
                    for (const storage of storagesRes.body) {
                        if (storage.storage_type === 's3') {
                            try {
                                await httpClient.sendRequest({
                                    method: HttpMethod.POST,
                                    url: `${auth.baseApiUrl}/api/storages/link-global/${project_id}/${storage.id}/s3`,
                                    headers: { Authorization: `Token ${auth.apiToken}` }
                                });
                                storageLinked = true;
                                break;
                            } catch (e) {}
                        }
                    }
                }
                if (!storageLinked) {
                    await httpClient.sendRequest({
                        method: HttpMethod.POST,
                        url: `${auth.baseApiUrl}/api/storages/s3-server`,
                        body: {
                            regex_filter: `raw_files_${project_id}`,
                            use_blob_urls: true,
                            recursive_scan: false,
                            presign: true,
                            presign_ttl: "60",
                            storage_type: "s3-server",
                            project: project_id
                        },
                        headers: { Authorization: `Token ${auth.apiToken}`, 'Content-Type': 'application/json' }
                    });
                }
                // 3. Select GPU
                const availableGpus = await httpClient.sendRequest({
                    method: HttpMethod.GET,
                    url: `${auth.baseApiUrl}/api/compute_marketplace/gpus`,
                    headers: { Authorization: `Token ${auth.apiToken}` },
                    queryParams: {
                        project_id: project_id,
                        is_using: "0",
                        compute_type: 'model-training'
                    }
                });
                const gpusArr = availableGpus.body;
                if (!gpusArr.length || !gpusArr[0].compute_gpus.length) {
                    throw new Error('No available GPUs found');
                }
                const selectedGpu = gpusArr[Math.floor(Math.random() * gpusArr.length)];
                const gpu = selectedGpu.compute_gpus[Math.floor(Math.random() * selectedGpu.compute_gpus.length)];
                console.log('Selected GPU:', gpu);
                // 4. GPU details
                const gpuResponse = await httpClient.sendRequest({
                    method: HttpMethod.GET,
                    url: `${auth.baseApiUrl}/api/compute_gpu`,
                    queryParams: {
                        project_id: project_id,
                        paramaster: 'check',
                        gpu_list_id: gpu.id
                    },
                    headers: { Authorization: `Token ${auth.apiToken}` }
                });
                console.log('GPU details:', gpuResponse.body);

                // 5. Build PATCH body using model info and GPU
                const patchBody: any = {
                    name: selectedModel.name,
                    author_id: selectedModel.author_id,
                    is_buy_least: true,
                    project_id: project_id,
                    gpus: [{
                        compute_id: selectedGpu.compute_id,
                        gpus_id: gpu.id.toString(),
                        machine_options: 'virtual-machines',
                    }],
                    config: { framework: 'transformers' },
                    project: {},
                    calculate_compute_gpu: gpuResponse.body,
                    estimate_time: '1',
                    estimate_cost: '0.159',
                    rent_time: '1',
                    rent_cost: '0.159',
                    weight: '',
                    modeltype: 'training',
                };

                console.log('PATCH body:', patchBody);
                // PATCH /api/model_marketplace/update/id
                await httpClient.sendRequest({
                    method: HttpMethod.PATCH,
                    url: `${auth.baseApiUrl}/api/model_marketplace/update/${selectedModel.id}`,
                    headers: { Authorization: `Token ${auth.apiToken}`, 'Content-Type': 'application/json' },
                    body: patchBody
                });
                // After PATCH, fetch ml_id from history-deploy-list (like add-model.ts)
                const deployListRes = await httpClient.sendRequest({
                    method: HttpMethod.GET,
                    url: `${auth.baseApiUrl}/api/ml/history-deploy-list`,
                    queryParams: {
                        project: project_id
                    },
                    headers: { Authorization: `Token ${auth.apiToken}` }
                });
                let deployList: { id: number; install_status: string }[] = [];
                if (Array.isArray(deployListRes.body)) {
                    deployList = deployListRes.body.map((item: any) => ({
                        id: item.id,
                        install_status: item.install_status ?? item.state
                    }));
                }
                if (!deployList.length) throw new Error('No deploys found after model update');
                mlIdToUse = deployList[0].id;
            }
            
            console.log('ML ID to use:', mlIdToUse);
            // Always fetch mlInfo for the ml_id to use
            let mlInfo = await getMlInfo(auth, mlIdToUse!.toString());

            // Wait for install if requested
            while (mlInfo.install_status === 'installing') {
                await new Promise(res => setTimeout(res, 30000)); // 30s
                mlInfo = await getMlInfo(auth, mlIdToUse!.toString());
            }
            if (mlInfo.install_status === 'completed') {
                await new Promise(res => setTimeout(res, 10000)); // 10s extra wait
            }

            // Check if the model is still installing
            if (!mlInfo) {
                throw new Error('ML Info not found');
            }
            
            if (mlInfo.install_status === 'installing') {
                console.log('ML Info status: installing');
                return { status: 'installing', message: 'The model is still being installed. Please try again later.' };
            }

            // 2. Prepare prediction request
            console.log('Preparing prediction request...');

            // Prepare query parameters
            const queryParams = {
                project: mlInfo.project.toString(),
            };

            // Prepare body parameters in the correct format
            const bodyParams = {
                command: 'predict',
                params: {
                    model_id: 'facebook/musicgen-small',
                    task: 'text-to-audio',
                    project: mlInfo.project.toString(),
                    prompt: propsValue.prompt
                }
            };

            console.log('Prediction request body:', JSON.stringify(bodyParams));

            // Try prediction, if 500 error, reset ML port and retry (using try/catch)
            let predictionResponse;
            try {
                predictionResponse = await httpClient.sendRequest({
                    method: HttpMethod.POST,
                    url: `${mlInfo.url}/action`,
                    headers: {
                        Authorization: `Token ${auth.apiToken}`
                    },
                    queryParams: queryParams,
                    body: bodyParams
                });
            } catch (err: any) {
                if (err.status === 500) {
                    const { resetMlProxyUrl } = await import('../common/ml-proxy');
                    const newProxyUrl = await resetMlProxyUrl(auth, mlInfo.project.toString());
                    try {
                        predictionResponse = await httpClient.sendRequest({
                            method: HttpMethod.POST,
                            url: `${newProxyUrl}/action`,
                            headers: {
                                Authorization: `Token ${auth.apiToken}`
                            },
                            queryParams: queryParams,
                            body: bodyParams
                        });
                    } catch (err2) {
                        throw err2;
                    }
                } else {
                    throw err;
                }
            }
            console.log('Prediction completed');
            // Process the response based on detected input type
            try {
                const responseData = predictionResponse.body;
                console.log(responseData);
                const base64Audio = responseData.result[0].result[0].value.text[0];
                console.log(base64Audio);

                const audioFile = await context.files.write({
                    data: Buffer.from(base64Audio, 'base64'),
                    fileName: 'audio.mp3',
                  });
                  
                return {
                    audioFile,
                };
                
            } catch (e) {
                console.log('Error parsing audio response:', e);
                // Add return statement to ensure all code paths return a value
                return {
                    audioFile: null
                };
            }

        } catch (error) {
            console.error('Prediction error:', error);
            throw error;
        }
    },
});
