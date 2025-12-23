import { IConfig } from '../../models';
export declare const getListProject: (config: IConfig, pageSize?: number, pageIndex?: number) => Promise<import("axios").AxiosResponse<any, any>>;
export declare const createProject: (config: IConfig, name?: string) => Promise<import("axios").AxiosResponse<any, any>>;
