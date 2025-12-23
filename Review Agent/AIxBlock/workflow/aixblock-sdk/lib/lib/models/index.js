"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addModel = exports.getModelById = exports.getSupportedModels = void 0;
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
const getSupportedModels = async (config, options) => {
    const resp = await axios_1.default.get(`${config.baseApi}/api/model_marketplace/list-supported-models`, {
        headers: config.headers,
        params: {
            'model_type': options?.modelType,
        }
    });
    if (resp.status !== 200)
        return {};
    const data = resp.data;
    if (options?.formatApi === models_1.OutputModelFormat.OPENAI) {
        return {
            object: 'list',
            data: data,
        };
    }
    else if (options?.formatApi === models_1.OutputModelFormat.ANTHROPIC) {
        return {
            data: data,
            has_more: false,
            first_id: data[0].id,
            last_id: data[data.length - 1].id,
        };
    }
    else if (options?.formatApi === models_1.OutputModelFormat.REPLICATE) {
        return {
            results: data,
            next: null,
            previous: null,
        };
    }
    return data;
};
exports.getSupportedModels = getSupportedModels;
const getModelById = async (config, modelId) => {
    const resp = await axios_1.default.get(`${config.baseApi}/api/model_marketplace/${modelId}/`, {
        headers: config.headers,
    });
    return resp;
};
exports.getModelById = getModelById;
const addModel = async (config, formData) => {
    const resp = await axios_1.default.post(`${config.baseApi}/api/model_marketplace/add-model`, formData, {
        headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data',
        },
    });
    return resp;
};
exports.addModel = addModel;
