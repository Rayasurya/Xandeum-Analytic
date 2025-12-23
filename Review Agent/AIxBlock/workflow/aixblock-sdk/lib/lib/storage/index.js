"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewStorage = exports.connectStorageToProject = exports.getStorages = void 0;
const axios_1 = __importDefault(require("axios"));
const getStorages = async (config) => {
    const resp = await axios_1.default.get(`${config.baseApi}/api/storages/global`, {
        headers: config.headers,
    });
    return resp;
};
exports.getStorages = getStorages;
const connectStorageToProject = async (config, storageId, projectId) => {
    const resp = await axios_1.default.post(`${config.baseApi}/api/storages/link-global/${projectId}/${storageId}/s3`, {
        headers: config.headers,
    });
    return resp;
};
exports.connectStorageToProject = connectStorageToProject;
const createNewStorage = async (config, projectId) => {
    const resp = await axios_1.default.post(`${config.baseApi}/api/storages/s3-server`, {
        regex_filter: `raw_files_${projectId}`,
        use_blob_urls: true,
        recursive_scan: false,
        presign: true,
        presign_ttl: '60',
        storage_type: 's3-server',
        project: projectId,
    }, {
        headers: config.headers,
    });
    return resp;
};
exports.createNewStorage = createNewStorage;
