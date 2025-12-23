"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMlBackendById = exports.getHistoryDeployList = void 0;
const axios_1 = __importDefault(require("axios"));
const getHistoryDeployList = async (config, projectId) => {
    const resp = await axios_1.default.get(`${config.baseApi}/api/ml/history-deploy-list`, {
        headers: config.headers,
        params: {
            project: projectId,
        },
    });
    return resp;
};
exports.getHistoryDeployList = getHistoryDeployList;
const getMlBackendById = async (config, mlBackendId) => {
    const resp = await axios_1.default.get(`${config.baseApi}/api/ml/${mlBackendId}`, {
        headers: config.headers,
    });
    return resp;
};
exports.getMlBackendById = getMlBackendById;
