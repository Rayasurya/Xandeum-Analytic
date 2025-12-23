import { IConfig } from '../../models';
export declare const getGpus: (config: IConfig, projectId: string, computeType: string) => Promise<import("axios").AxiosResponse<any, any>>;
export declare const connectGpuToProject: (config: IConfig, gpuId: string, projectId: string) => Promise<import("axios").AxiosResponse<any, any>>;
