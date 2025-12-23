import axios from 'axios';
import { IConfig, IGetSupportedModels, OutputModelFormat } from '../../models';

export const getSupportedModels = async (
    config: IConfig,
    options?: IGetSupportedModels,
) => {
    const resp = await axios.get(`${config.baseApi}/api/model_marketplace/list-supported-models`, {
        headers: config.headers,
        params: {
            'model_type': options?.modelType,
        }
    });
    if (resp.status !== 200) return {};
    const data = resp.data;

    if (options?.formatApi === OutputModelFormat.OPENAI) {
        return {
            object: 'list',
            data: data,
        };
    } else if (options?.formatApi === OutputModelFormat.ANTHROPIC) {
        return {
            data: data,
            has_more: false,
            first_id: data[0].id,
            last_id: data[data.length - 1].id,
        };
    } else if (options?.formatApi === OutputModelFormat.REPLICATE) {
        return {
            results: data,
            next: null,
            previous: null,
        };
    }
    return data;
};

export const getModelById = async (config: IConfig, modelId: string) => {
    const resp = await axios.get(`${config.baseApi}/api/model_marketplace/${modelId}/`, {
        headers: config.headers,
    });
    return resp;
};

export const addModel = async (config: IConfig, formData: FormData) => {
    const resp = await axios.post(`${config.baseApi}/api/model_marketplace/add-model`, formData, {
        headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data',
        },
    });
    return resp;
};
