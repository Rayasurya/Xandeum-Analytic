import axios from 'axios';
import { IConfig } from '../../models';

export const getStorages = async (config: IConfig) => {
    const resp = await axios.get(`${config.baseApi}/api/storages/global`, {
        headers: config.headers,
    });
    return resp;
};

export const connectStorageToProject = async (
    config: IConfig,
    storageId: string,
    projectId: string,
) => {
    const resp = await axios.post(`${config.baseApi}/api/storages/link-global/${projectId}/${storageId}/s3`, {
        headers: config.headers,
    });
    return resp;
};

export const createNewStorage = async (config: IConfig, projectId: string) => {
    const resp = await axios.post(
        `${config.baseApi}/api/storages/s3-server`,
        {
            regex_filter: `raw_files_${projectId}`,
            use_blob_urls: true,
            recursive_scan: false,
            presign: true,
            presign_ttl: '60',
            storage_type: 's3-server',
            project: projectId,
        },
        {
            headers: config.headers,
        },
    );

    return resp;
};
