import FormData from 'form-data';
import { httpClient, HttpMethod } from "workflow-blocks-common";
import { createAction, Property } from "workflow-blocks-framework";
import { aixblockAuth } from '../../..';

/**
 * Get available GPUs for a project
 */
async function getAvailableGpus(auth: any, projectId: string): Promise<any[]> {
    console.log('Getting available GPUs...');
    const response = await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: `${auth.baseApiUrl}/api/compute_marketplace/gpus`,
        headers: {
            Authorization: `Token ${auth.apiToken}`
        },
        queryParams: {
            project_id: projectId,
            is_using: "0",
            compute_type: 'model-training'
        }
    });

    return response.body;
}

export const addModel = createAction({
    name: "add_model",
    displayName: "Add Model",
    description: "Add a new model to the marketplace",
    auth: aixblockAuth,
    props: {
        // model_action: Property.StaticDropdown({
        //     displayName: 'Model Action',
        //     description: 'Choose whether to manually specify GPU or auto-select',
        //     required: true,
        //     options: {
        //         options: [
        //             { label: 'Manual GPU Selection', value: 'manual' },
        //             { label: 'Auto GPU Selection', value: 'auto' }
        //         ]
        //     },
        //     defaultValue: 'manual',
        // }),
        // compute_id: Property.ShortText({
        //     displayName: "Compute ID",
        //     description: "Compute ID for manual GPU selection. Not required if using Auto GPU Selection.",
        //     required: false,
        //     defaultValue: '',
        // }),
        // gpus_id: Property.ShortText({
        //     displayName: "GPUs ID",
        //     description: "GPUs ID for manual GPU selection. Not required if using Auto GPU Selection.",
        //     required: false,
        //     defaultValue: '',
        // }),
        model_source: Property.StaticDropdown({
            displayName: 'Model Source',
            description: 'Source of the model',
            required: true,
            options: {
                options: [
                    { label: 'Huggingface', value: 'HUGGING_FACE' },
                    { label: 'Github', value: 'GIT' }
                ]
            },
            defaultValue: 'GIT',
        }),
        model_id: Property.ShortText({
            displayName: "Model ID",
            description: "Model ID",
            required: true,
        }),
        // model_type: Property.StaticDropdown({
        //     displayName: 'Model Type',
        //     description: 'Type of model to add',
        //     required: true,
        //     options: {
        //         options: [
        //             { label: 'Training', value: 'training' },
        //             { label: 'Inference', value: 'inference' }
        //         ]
        //     },
        //     defaultValue: 'training',
        // }),
        // framework: Property.StaticDropdown({
        //     displayName: 'Framework',
        //     description: 'Framework to use for the model',
        //     required: true,
        //     options: {
        //         options: [
        //             { label: 'PyTorch', value: 'pytorch' },
        //             { label: 'Huggingface (Accelerate)', value: 'huggingface' }
        //         ]
        //     },
        //     defaultValue: 'pytorch',
        // }),
        checkpoint_source: Property.ShortText({
            displayName: "Checkpoint Source",
            description: "Source of the checkpoint",
            required: false,
            defaultValue: 'CLOUD_STORAGE',
        }),
        checkpoint_id: Property.ShortText({
            displayName: "Checkpoint ID",
            description: "ID of the checkpoint",
            required: false,
            defaultValue: '',
        }),
        checkpoint_token: Property.ShortText({
            displayName: "Checkpoint Token",
            description: "Token for the checkpoint",
            required: false,
            defaultValue: '',
        }),
    },
    async run({ auth, propsValue }) {
        // Get model action value (handle both string and object formats)
        // const modelAction = typeof propsValue.model_action === 'object' 
        //     ? (propsValue.model_action as any).value 
        //     : propsValue.model_action as string;
        
        // console.log(`Model action: ${modelAction}`);
        
        // let computeId = propsValue.compute_id || '';
        // let gpusId = propsValue.gpus_id || '';
        
        // Auto-select GPU if model_action is 'auto'
        // if (modelAction === 'auto') {
        console.log('Auto-selecting GPU...');
        // Step 1: Create a new project
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

        // Step 2: Try to link an available S3 global storage
        const storagesRes = await httpClient.sendRequest({
            method: HttpMethod.GET,
            url: `${auth.baseApiUrl}/api/storages/global`,
            headers: {
                Authorization: `Token ${auth.apiToken}`
            }
        });
        let storageLinked = false;
        if (Array.isArray(storagesRes.body)) {
            for (const storage of storagesRes.body) {
                if (storage.storage_type === 's3') {
                    try {
                        await httpClient.sendRequest({
                            method: HttpMethod.POST,
                            url: `${auth.baseApiUrl}/api/storages/link-global/${project_id}/${storage.id}/s3`,
                            headers: {
                                Authorization: `Token ${auth.apiToken}`
                            }
                        });
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
                headers: {
                    Authorization: `Token ${auth.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });
        }

        // Step 4: Continue as normal, but use project_id from above
        const availableGpus = await getAvailableGpus(auth, project_id);
        if (!availableGpus.length || !availableGpus[0].compute_gpus.length) {
            throw new Error('No available GPUs found');
        }
        
        // Select random GPU
        const selectedGpu = availableGpus[Math.floor(Math.random() * availableGpus.length)];
        const gpu = selectedGpu.compute_gpus[Math.floor(Math.random() * selectedGpu.compute_gpus.length)];
        
        // computeId = selectedGpu.compute_id.toString();
        // gpusId = gpu.id.toString();
        
        console.log(`Auto-selected GPU: Compute ID ${selectedGpu.compute_id}, GPU ID ${gpu.id}`);
        // } else {
        //     // Manual mode - validate required fields
        //     if (!propsValue.name || !propsValue.project_id || !computeId || !gpusId) {
        //         throw new Error('All form fields are required for manual mode');
        //     }
        // }

        // First get GPU details
        const gpuResponse = await httpClient.sendRequest({
            method: HttpMethod.GET,
            url: `${auth.baseApiUrl}/api/compute_gpu`,
            queryParams: {
                project_id: project_id,
                paramaster: 'check',
                gpu_list_id: gpu.id
            },
            headers: {
                Authorization: `Token ${auth.apiToken}`
            }
        });

        const formData = new FormData();

        // Add form fields
        // Generate model name based on current date/time
        const modelName = `Model ${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        formData.append('name', modelName);
        formData.append('project_id', project_id.toString());
        formData.append('gpus', JSON.stringify([{compute_id: selectedGpu.compute_id.toString(), gpus_id: gpu.id.toString()}]));
        formData.append('checkpoint_source', 'CLOUD_STORAGE');
        formData.append('model_source', propsValue.model_source || 'GIT');
        
        // Model info
        const modelInfo = {
            calculate_compute_gpu: gpuResponse.body,
            project: {
                epochs: 10,
                batch_size: 10,
                batch_size_per_epochs: 2
            },
            token_length: "4096",
            accuracy: "70",
            sampling_frequency: "48000",
            mono: true,
            fps: "60",
            resolution: "320",
            image_width: "256",
            image_height: "256",
            framework: "pytorch",
            precision: "fp16",
            estimate_time: 1,
            estimate_cost: "0.159"
        };
        formData.append('model_info', JSON.stringify(modelInfo));

        // Get model type value (handle both string and object formats)
        // const modelType = typeof propsValue.model_type === 'object' 
        //     ? (propsValue.model_type as any).value 
        //     : propsValue.model_type as string;
            
        // Get framework value (handle both string and object formats)
        // const framework = typeof propsValue.framework === 'object' 
        //     ? (propsValue.framework as any).value 
        //     : propsValue.framework as string;
        
        formData.append('model_id', propsValue.model_id?.toString() || '');
        formData.append('framework', "huggingface");
        formData.append('model_type', "training");
        formData.append('checkpoint_source', propsValue.checkpoint_source || 'CLOUD_STORAGE');
        formData.append('checkpoint_id', propsValue.checkpoint_id || '');
        formData.append('checkpoint_token', propsValue.checkpoint_token || '');
        formData.append('checkpoint_username', '');
        formData.append('checkpoint_path', '');
        
        console.log('Form data:', formData);

        const response = await httpClient.sendRequest({
            method: HttpMethod.POST,
            url: `${auth.baseApiUrl}/api/model_marketplace/add-model`,
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Token ${auth.apiToken}`
            }
        });

        let deployList: { id: number; install_status: string }[] = [];
        // Only call history-deploy-list if add-model succeeded (response.body is truthy)
        if (response.body) {
            const deployListRes = await httpClient.sendRequest({
                method: HttpMethod.GET,
                url: `${auth.baseApiUrl}/api/ml/history-deploy-list`,
                queryParams: {
                    project: project_id
                },
                headers: {
                    Authorization: `Token ${auth.apiToken}`
                }
            });
            if (Array.isArray(deployListRes.body)) {
                deployList = deployListRes.body.map((item: any) => ({
                    id: item.id,
                    // url: item.url,
                    install_status: item.install_status ?? item.state
                }));
            }
        }
        return deployList.length > 0 ? deployList[0] : null;

    }
});
