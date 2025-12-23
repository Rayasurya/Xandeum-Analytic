import { IConfig } from '../../models';
export declare const getStorages: (config: IConfig) => Promise<import("axios").AxiosResponse<any, any>>;
export declare const connectStorageToProject: (config: IConfig, storageId: string, projectId: string) => Promise<import("axios").AxiosResponse<any, any>>;
export declare const createNewStorage: (config: IConfig, projectId: string) => Promise<import("axios").AxiosResponse<any, any>>;
