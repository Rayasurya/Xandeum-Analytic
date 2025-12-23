"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectGpuToProject = exports.getGpus = void 0;
const axios_1 = __importDefault(require("axios"));
const getGpus = async (config, projectId, computeType) => {
    const resp = await axios_1.default.get(`${config.baseApi}/api/compute_marketplace/gpus`, {
        headers: config.headers,
        params: {
            project_id: projectId,
            is_using: '0',
            compute_type: computeType,
        },
    });
    return resp;
};
exports.getGpus = getGpus;
const connectGpuToProject = async (config, gpuId, projectId) => {
    const resp = await axios_1.default.get(`${config.baseApi}/api/compute_gpu`, {
        headers: config.headers,
        params: {
            project_id: projectId,
            paramaster: 'check',
            gpu_list_id: gpuId,
        },
    });
    return resp;
};
exports.connectGpuToProject = connectGpuToProject;
