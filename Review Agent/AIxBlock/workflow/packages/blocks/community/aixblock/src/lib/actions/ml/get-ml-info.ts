import { httpClient, HttpMethod } from "workflow-blocks-common";
import { createAction, Property } from "workflow-blocks-framework";
import { aixblockAuth } from '../../..';

interface ComputeGpu {
    id: number;
    gpu_name: string;
    power_consumption: string | null;
    gpu_memory: string;
    gpu_tflops: string;
    location_name: string;
    status: string;
    [key: string]: any; // For other properties
}

interface NetworkHistory {
    id: number;
    ml_network: {
        id: number;
        project_id: number;
        name: string;
        model_id: number;
        type: string;
        [key: string]: any;
    };
    status: string;
    [key: string]: any;
}

interface MlInfo {
    id: number;
    state: string;
    install_status: string;
    url: string;
    title: string;
    status: string;
    compute_gpu: ComputeGpu;
    network_history: NetworkHistory;
    [key: string]: any;
}

export const getMlInfo = createAction({
    name: 'get_ml_info',
    displayName: 'Get ML Info',
    description: 'Get ML information by ML ID',
    auth: aixblockAuth,
    props: {
        ml_id: Property.ShortText({
            displayName: 'Installed Model ID',
            description: 'Identifier of the ML model installed on the currently active compute environment, used for training or prediction',
            required: true,
        }),
        wait_until_installed: Property.Checkbox({
            displayName: 'Wait Until Installed',
            description: 'Wait until the ML model is fully installed before returning',
            required: false,
            defaultValue: false,
        })
    },
    async run({ auth, propsValue }) {
        if (!propsValue.ml_id) {
            throw new Error('ML ID is required');
        }

        async function fetchMlInfo() {
            const response = await httpClient.sendRequest({
                method: HttpMethod.GET,
                url: `${auth.baseApiUrl}/api/ml/${propsValue.ml_id}`,
                headers: {
                    Authorization: `Token ${auth.apiToken}`
                }
            });
            return response.body as MlInfo;
        }

        let ml = await fetchMlInfo();

        if (propsValue.wait_until_installed) {
            // Wait until install_status becomes 'completed'
            while (ml.install_status === 'installing') {
                await new Promise(res => setTimeout(res, 30000)); // 30s
                ml = await fetchMlInfo();
            }
            // Wait 10s after completed
            if (ml.install_status === 'completed') {
                await new Promise(res => setTimeout(res, 10000));
            }
            return ml;
        }

        if (ml.install_status === 'installing') {
            return {
                id: ml.id,
                install_status: ml.install_status
            };
        }
        return ml;
    },
});
