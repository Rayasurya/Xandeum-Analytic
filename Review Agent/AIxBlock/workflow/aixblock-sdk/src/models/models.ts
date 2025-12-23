import { AxiosHeaders } from "axios";

export enum OutputModelFormat {
    OPENAI = 'openai',
    ANTHROPIC = 'anthropic',
    REPLICATE = 'replicate'
}

export type IConfig = {
    headers: AxiosHeaders,
    baseApi: string
}

export interface IGetSupportedModels {
    formatApi?: OutputModelFormat,
    modelType?: string,
}