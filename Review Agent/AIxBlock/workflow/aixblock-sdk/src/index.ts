import { AxiosHeaders } from 'axios';
import { removeTrailingSlash } from './helpers';
import { connectGpuToProject, getGpus } from './lib/gpus';
import { getHistoryDeployList, getMlBackendById } from './lib/ml';
import { addModel, getModelById, getSupportedModels } from './lib/models';
import { createProject, getListProject } from './lib/projects';
import { connectStorageToProject, createNewStorage, getStorages } from './lib/storage';
import { getCurrentProfile } from './lib/users';
import { IGetProjectOptions, IGetSupportedModels, IOptions } from './models';

export class AIxBlock {
    private apiKey: string = '';
    private baseApi: string = '';
    private authType: 'bearer' | 'token' = 'token'
    constructor(options: IOptions) {
        this.apiKey = options.apiKey;
        this.baseApi = removeTrailingSlash(options.baseApi);
        this.authType = options.authType ?? 'token'
    }

    get config() {
        return {
            headers: new AxiosHeaders({
                Authorization: `${this.authType === 'token' ? 'Token' : 'Bearer'} ${this.apiKey}`,
                'Content-Type': 'application/json',
            }),
            baseApi: this.baseApi,
        };
    }

    // Users
    getCurrentProfile = async () => {
        return getCurrentProfile(this.config);
    };
    // Projects
    getProjects = async ({ pageIndex = 1, pageSize = 20 }: IGetProjectOptions) => {
        return getListProject(this.config, pageSize, pageIndex);
    };
    createProject = async (name?: string) => {
        return createProject(this.config, name);
    };

    // Models
    getSupportedModels = async (options?: IGetSupportedModels) => {
        return getSupportedModels(this.config, options);
    };
    getModelById = async (modelId: string) => {
        return getModelById(this.config, modelId);
    };
    addModel = async (formData: FormData) => {
        return addModel(this.config, formData);
    };

    // Storages
    getStorages = async () => {
        return getStorages(this.config);
    };
    connectStorageToProject = async (storageId: string, projectId: string) => {
        return connectStorageToProject(this.config, storageId, projectId);
    };
    createNewStorage = async (projectId: string) => {
        return createNewStorage(this.config, projectId);
    };

    // Gpus
    getGpus = async (projectId: string, computeType = 'model-training') => {
        return getGpus(this.config, projectId, computeType);
    };
    connectGpuToProject = async (gpuId: string, projectId: string) => {
        return connectGpuToProject(this.config, gpuId, projectId);
    };

    // ML
    getHistoryDeployList = async (projectId: string) => {
        return getHistoryDeployList(this.config, projectId);
    };
    getMlBackendById = async (mlBackendId: string) => {
        return getMlBackendById(this.config, mlBackendId);
    };
}

export default AIxBlock;
