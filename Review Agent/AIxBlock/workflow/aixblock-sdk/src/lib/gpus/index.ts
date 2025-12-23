import axios from 'axios';
import { IConfig } from '../../models';

export const getGpus = async (config: IConfig, projectId: string, computeType: string) => {
    const resp = await axios.get(`${config.baseApi}/api/compute_marketplace/gpus`, {
        headers: config.headers,
        params: {
            project_id: projectId,
            is_using: '0',
            compute_type: computeType,
        },
    });
    return resp;
};

export const connectGpuToProject = async (
    config: IConfig,
    gpuId: string,
    projectId: string,
) => {
    const resp = await axios.get(`${config.baseApi}/api/compute_gpu`, {
        headers: config.headers,
        params: {
            project_id: projectId,
            paramaster: 'check',
            gpu_list_id: gpuId,
        },
    });
    return resp;
};
