import { AxiosHeaders } from 'axios';
import { IGetProjectOptions, IGetSupportedModels, IOptions } from './models';
export declare class AIxBlock {
    private apiKey;
    private baseApi;
    private authType;
    constructor(options: IOptions);
    get config(): {
        headers: AxiosHeaders;
        baseApi: string;
    };
    getCurrentProfile: () => Promise<import("axios").AxiosResponse<any, any>>;
    getProjects: ({ pageIndex, pageSize }: IGetProjectOptions) => Promise<import("axios").AxiosResponse<any, any>>;
    createProject: (name?: string) => Promise<import("axios").AxiosResponse<any, any>>;
    getSupportedModels: (options?: IGetSupportedModels) => Promise<any>;
    getModelById: (modelId: string) => Promise<import("axios").AxiosResponse<any, any>>;
    addModel: (formData: FormData) => Promise<import("axios").AxiosResponse<any, any>>;
    getStorages: () => Promise<import("axios").AxiosResponse<any, any>>;
    connectStorageToProject: (storageId: string, projectId: string) => Promise<import("axios").AxiosResponse<any, any>>;
    createNewStorage: (projectId: string) => Promise<import("axios").AxiosResponse<any, any>>;
    getGpus: (projectId: string, computeType?: string) => Promise<import("axios").AxiosResponse<any, any>>;
    connectGpuToProject: (gpuId: string, projectId: string) => Promise<import("axios").AxiosResponse<any, any>>;
    getHistoryDeployList: (projectId: string) => Promise<import("axios").AxiosResponse<any, any>>;
    getMlBackendById: (mlBackendId: string) => Promise<import("axios").AxiosResponse<any, any>>;
}
export default AIxBlock;
