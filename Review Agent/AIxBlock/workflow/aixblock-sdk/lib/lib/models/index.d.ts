import { IConfig, IGetSupportedModels } from '../../models';
export declare const getSupportedModels: (config: IConfig, options?: IGetSupportedModels) => Promise<any>;
export declare const getModelById: (config: IConfig, modelId: string) => Promise<import("axios").AxiosResponse<any, any>>;
export declare const addModel: (config: IConfig, formData: FormData) => Promise<import("axios").AxiosResponse<any, any>>;
