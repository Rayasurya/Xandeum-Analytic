import { httpClient, HttpMethod } from "workflow-blocks-common";
import { createAction, Property } from "workflow-blocks-framework";
import { aixblockAuth } from '../../..';

export const checkGpuStatus = createAction({
    name: "check_gpu_status",
    displayName: "Check GPU Status",
    description: "Check the status of a GPU",
    auth: aixblockAuth,
    props: {
        compute_id: Property.ShortText({
            displayName: "Compute ID",
            description: "Compute ID",
            required: true,
        }),
        gpus_id: Property.ShortText({
            displayName: "GPUs ID",
            description: "GPUs ID",
            required: true,
        }),
    },
    async run({ auth, propsValue }) {
        if (!propsValue.compute_id || !propsValue.gpus_id) {
            throw new Error('All fields are required');
        }

        const response = await httpClient.sendRequest({
            method: HttpMethod.GET,
            url: `${auth.baseApiUrl}/api/compute_marketplace/check-gpu-status`,
            queryParams: {
                compute_id: propsValue.compute_id,
                gpus_id: propsValue.gpus_id
            },
            headers: {
                Authorization: `Token ${auth.apiToken}`
            }
        });

        return response.body;
    }
});
