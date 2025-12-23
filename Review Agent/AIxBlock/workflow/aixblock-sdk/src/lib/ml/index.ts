import axios from 'axios';
import { IConfig } from '../../models';

export const getHistoryDeployList = async (config: IConfig, projectId: string) => {
    const resp = await axios.get(`${config.baseApi}/api/ml/history-deploy-list`, {
        headers: config.headers,
        params: {
            project: projectId,
        },
    });
    return resp;
};

export const getMlBackendById = async (config: IConfig, mlBackendId: string) => {
    const resp = await axios.get(`${config.baseApi}/api/ml/${mlBackendId}`, {
        headers: config.headers,
    });
    return resp;
};
