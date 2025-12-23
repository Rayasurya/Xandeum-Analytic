"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIxBlock = void 0;
const axios_1 = require("axios");
const helpers_1 = require("./helpers");
const gpus_1 = require("./lib/gpus");
const ml_1 = require("./lib/ml");
const models_1 = require("./lib/models");
const projects_1 = require("./lib/projects");
const storage_1 = require("./lib/storage");
const users_1 = require("./lib/users");
class AIxBlock {
    constructor(options) {
        this.apiKey = '';
        this.baseApi = '';
        this.authType = 'token';
        // Users
        this.getCurrentProfile = async () => {
            return (0, users_1.getCurrentProfile)(this.config);
        };
        // Projects
        this.getProjects = async ({ pageIndex = 1, pageSize = 20 }) => {
            return (0, projects_1.getListProject)(this.config, pageSize, pageIndex);
        };
        this.createProject = async (name) => {
            return (0, projects_1.createProject)(this.config, name);
        };
        // Models
        this.getSupportedModels = async (options) => {
            return (0, models_1.getSupportedModels)(this.config, options);
        };
        this.getModelById = async (modelId) => {
            return (0, models_1.getModelById)(this.config, modelId);
        };
        this.addModel = async (formData) => {
            return (0, models_1.addModel)(this.config, formData);
        };
        // Storages
        this.getStorages = async () => {
            return (0, storage_1.getStorages)(this.config);
        };
        this.connectStorageToProject = async (storageId, projectId) => {
            return (0, storage_1.connectStorageToProject)(this.config, storageId, projectId);
        };
        this.createNewStorage = async (projectId) => {
            return (0, storage_1.createNewStorage)(this.config, projectId);
        };
        // Gpus
        this.getGpus = async (projectId, computeType = 'model-training') => {
            return (0, gpus_1.getGpus)(this.config, projectId, computeType);
        };
        this.connectGpuToProject = async (gpuId, projectId) => {
            return (0, gpus_1.connectGpuToProject)(this.config, gpuId, projectId);
        };
        // ML
        this.getHistoryDeployList = async (projectId) => {
            return (0, ml_1.getHistoryDeployList)(this.config, projectId);
        };
        this.getMlBackendById = async (mlBackendId) => {
            return (0, ml_1.getMlBackendById)(this.config, mlBackendId);
        };
        this.apiKey = options.apiKey;
        this.baseApi = (0, helpers_1.removeTrailingSlash)(options.baseApi);
        this.authType = options.authType ?? 'token';
    }
    get config() {
        return {
            headers: new axios_1.AxiosHeaders({
                Authorization: `${this.authType === 'token' ? 'Token' : 'Bearer'} ${this.apiKey}`,
                'Content-Type': 'application/json',
            }),
            baseApi: this.baseApi,
        };
    }
}
exports.AIxBlock = AIxBlock;
exports.default = AIxBlock;
