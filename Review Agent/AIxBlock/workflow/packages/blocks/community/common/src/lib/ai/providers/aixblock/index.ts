import AIxBlock from '@tonyshark/aixblock-sdk/lib';
import { AI, AIChatRole, AIFactory } from '../..';
import { httpClient, HttpMethod } from '../../../http';
import { model } from '../utils';

export const askAiModelStoreKey = 'aixblock-provider-ask-ai-model';

export const installModel = async (baseApiUrl: string, apiToken: string, modelId: string, serverUrl: string, engineToken: string, flowId: string) => {
    const aixblock = new AIxBlock({
        baseApi: baseApiUrl,
        apiKey: apiToken,
    });

    // Check model in store-entry
    let isInstalled = true;
    let mlBackend;
    console.log('Checking model installation status');
    try {
        mlBackend = await getMlInfo(serverUrl, engineToken, flowId, modelId);
        if (!mlBackend?.id) {
            isInstalled = false;
        } else {
            const mlResponse = await aixblock.getMlBackendById(String(mlBackend.id));
            mlBackend = mlResponse.data;
            if (mlBackend.error_message || mlBackend.install_status === 'failed' || !mlBackend.raw_url) {
                isInstalled = false;
            }
        }
    } catch (error) {
        isInstalled = false;
    }

    console.log('Model installed status', isInstalled);
    if (!isInstalled) {
        console.log('Auto-selecting GPU...');
        let projectId;
        try {
            const projectRes = await aixblock.createProject();
            projectId = projectRes.data.id;
        } catch (error: any) {
            const errorData = error.response.data;
            throw new Error(`Failed to create new project, ${JSON.stringify(errorData)}`);
        }
        console.log('DONE to create new project');

        console.log('Starting to setup storage');

        // Step 2: Try to link an available S3 global storage
        const storagesRes = await aixblock.getStorages();
        let storageLinked = false;
        try {
            if (Array.isArray(storagesRes.data)) {
                for (const storage of storagesRes.data) {
                    if (storage.storage_type === 's3') {
                        try {
                            await aixblock.connectStorageToProject(storage.id, projectId);
                            storageLinked = true;
                            break;
                        } catch (e) {
                            // Try next
                        }
                    }
                }
            }
            if (!storageLinked) {
                // Step 3: If all failed, create new s3-server storage
                await aixblock.createNewStorage(projectId);
            }
        } catch (error: any) {
            const errorData = error.response.data;
            throw new Error(`Failed to setup storage for project, ${JSON.stringify(errorData)}`);
        }
        console.log('DONE to setup storage');

        // // Step 4: Continue as normal, but use project_id from above
        const availableGpusResponse = await aixblock.getGpus(projectId);
        const availableGpus = availableGpusResponse.data;

        if (!availableGpus.length || !availableGpus[0].compute_gpus.length) {
            throw new Error('No available GPUs found');
        }

        // Select random GPU
        const selectedGpu = availableGpus[Math.floor(Math.random() * availableGpus.length)];
        const gpu = selectedGpu.compute_gpus[Math.floor(Math.random() * selectedGpu.compute_gpus.length)];

        console.log(`Auto-selected GPU: Compute ID ${selectedGpu.compute_id}, GPU ID ${gpu.id}`);
        let gpuResponse;
        try {
            // First get GPU details
            gpuResponse = await aixblock.connectGpuToProject(gpu.id, projectId);
        } catch (error: any) {
            const errorData = error.response.data;
            throw new Error(`Failed to connect gpu to project, ${JSON.stringify(errorData)}`);
        }

        // Get model detail
        const modelDetailResponse = await aixblock.getModelById(modelId);
        const modelDetail = modelDetailResponse.data;

        const formData = new FormData();

        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const modelName = `Model ${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(
            now.getMinutes()
        )}:${pad(now.getSeconds())}`;
        formData.append('name', modelName);
        formData.append('project_id', projectId.toString());
        formData.append('gpus', JSON.stringify([{ compute_id: selectedGpu.compute_id.toString(), gpus_id: gpu.id.toString() }]));
        formData.append('checkpoint_source', 'CLOUD_STORAGE');

        formData.append('model_source', modelDetail.model_source); // Need change

        // Model info
        const modelInfo = {
            calculate_compute_gpu: gpuResponse.data,
            project: {
                epochs: 10,
                batch_size: 10,
                batch_size_per_epochs: 2,
            },
            token_length: '4096',
            accuracy: '70',
            sampling_frequency: '48000',
            mono: true,
            fps: '60',
            resolution: '320',
            image_width: '256',
            image_height: '256',
            framework: 'pytorch',
            precision: 'fp16',
            estimate_time: 1,
            estimate_cost: '0.159',
        };
        formData.append('model_info', JSON.stringify(modelInfo));

        formData.append('model_id', modelDetail.model_id);
        formData.append('framework', 'huggingface');
        formData.append('model_type', 'training');
        formData.append('checkpoint_source', modelDetail.checkpoint_source || 'CLOUD_STORAGE');
        formData.append('checkpoint_id', modelDetail.checkpoint_id || '');
        formData.append('checkpoint_token', modelDetail.checkpoint_token || '');
        formData.append('checkpoint_username', '');
        formData.append('checkpoint_path', '');

        console.log('Form data:', formData);

        let deployList: { id: number; install_status: string; state: string; error_message: string; raw_url?: string }[] = [];

        try {
            const response = await aixblock.addModel(formData);
            console.log('gpuResponse', gpuResponse);
            // Only call history-deploy-list if add-model succeeded (response.body is truthy)
            if (response.data) {
                const deployListRes = await aixblock.getHistoryDeployList(projectId);
                if (Array.isArray(deployListRes.data)) {
                    deployList = deployListRes.data.map((item: any) => ({
                        id: item.id,
                        // url: item.url,
                        install_status: item.install_status ?? item.state,
                        state: '',
                        error_message: '',
                    }));
                }
            } else {
                throw new Error(`Can not to add model, ${JSON.stringify(response)}`);
            }
        } catch (error: any) {
            const errorData = error.response.data;
            throw new Error(`Failed to add model to project, ${JSON.stringify(errorData)}`);
        }

        console.log('Finished to add model, waiting to model installation');

        console.log('deployList[0]', deployList[0]);

        mlBackend = deployList[0];

        await upsertMlInfo(serverUrl, engineToken, flowId, modelId, mlBackend);
    }

    function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    console.log('Checking status of mlbackend', mlBackend.id);

    while (true) {
        const mlResponse = await aixblock.getMlBackendById(String(mlBackend.id));
        mlBackend = mlResponse.data;
        if (mlBackend.error_message || mlBackend.install_status === 'failed' || !mlBackend.raw_url) {
            throw new Error(`Failed to add model, ${JSON.stringify(mlBackend)}`);
        }

        if (mlBackend.state === 'CO' && mlBackend.install_status === 'compleated' && mlBackend.raw_url) {
            break;
        }

        await sleep(7000);
    }

    await upsertMlInfo(serverUrl, engineToken, flowId, modelId, mlBackend);

    return mlBackend;
};

export const aixblock: AIFactory = ({ engineToken, serverUrl, flowId, flowRunId }): AI => {
    return {
        provider: 'AIXBLOCK',
        chat: {
            text: async (params) => {
                const { baseUrl, token } = await getAIxBlockProviderInfo(serverUrl, engineToken);

                const ml = await installModel(baseUrl, token, params.model, serverUrl, engineToken, flowId as string);

                let content = '...';

                if (ml?.raw_url) {
                    const prompt = params.messages[params.messages.length - 1].content;
                    const predictResponse = await httpClient.sendRequest({
                        method: HttpMethod.POST,
                        url: `${ml.raw_url}/action`,
                        queryParams: {
                            command: 'predict',
                        },
                        body: {
                            prompt: prompt,
                        },
                    });
                    const predict = predictResponse.body;
                    content = predict?.result?.[0]?.result?.[0]?.value?.text?.[0];
                }

                return {
                    choices: [
                        {
                            role: AIChatRole.USER,
                            content: content,
                        },
                    ],
                    usage: {
                        promptTokens: 0,
                        completionTokens: 0,
                        totalTokens: 0,
                    },
                };
            },
        },
        image: {
            generate: async (params) => {
                console.log('aixblock provider image generate params', params);
                const imageUrl = 'https://4.img-dpreview.com/files/p/E~TS590x0~articles/3925134721/0266554465.jpeg';
                const image = await fetch(imageUrl);
                const imageBuffer = await image.arrayBuffer();
                const imageBase64 = Buffer.from(imageBuffer).toString('base64');
                return {
                    image: imageBase64,
                };
            },
        },
        audio: {
            generate: async (params) => {
                console.log('aixblock provider audio generate params', params);
                const audioUrl = 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3';
                const audio = await fetch(audioUrl);
                const audioBuffer = await audio.arrayBuffer();
                const audioBase64 = Buffer.from(audioBuffer).toString('base64');
                return {
                    audio: audioBase64,
                };
            },
        },
    };
};

const getAIxBlockProviderInfo = async (serverUrl: string, token: string) => {
    const modelMarketplaceResp = await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: `${serverUrl}v1/aixblock/provider/info`,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return modelMarketplaceResp.body;
};

const getMlInfo = async (serverUrl: string, token: string, flowId: string, modelId: string) => {
    const key = `flow_${flowId}/${askAiModelStoreKey}/modelId_${modelId}`;
    const resp = await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: `${serverUrl}v1/aixblock/provider/get-data/${flowId}`,
        queryParams: {
            key: key,
        },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return resp.body;
};

const upsertMlInfo = async (serverUrl: string, token: string, flowId: string, modelId: string, data: any) => {
    const key = `flow_${flowId}/${askAiModelStoreKey}/modelId_${modelId}`;
    const resp = await httpClient.sendRequest({
        method: HttpMethod.POST,
        url: `${serverUrl}v1/aixblock/provider/upsert-data/${flowId}`,
        queryParams: {
            key: key,
        },
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: data,
    });

    return resp.body;
};

export const aixblockModels = [model({ label: 'gpt-4o', value: 'gpt-4o', supported: ['text', 'function'] })];
