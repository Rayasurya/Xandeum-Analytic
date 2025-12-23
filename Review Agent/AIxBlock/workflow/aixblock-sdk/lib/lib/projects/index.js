"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProject = exports.getListProject = void 0;
const axios_1 = __importDefault(require("axios"));
const getListProject = async (config, pageSize = 20, pageIndex = 1) => {
    const resp = await axios_1.default.get(`${config.baseApi}/api/projects/list`, {
        params: {
            page: pageIndex,
            page_size: pageSize,
        },
        headers: config.headers,
    });
    return resp;
};
exports.getListProject = getListProject;
const createProject = async (config, name) => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const title = name
        ? name
        : `Project ${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const projectBody = {
        title,
        color: '#a2a2a2',
        label_config: '<View>\n  <Header value="Please read the text" />\n  </View>\n\n\n',
        label_config_title: '',
        annotation_template: null,
        template_id: 24,
        type: {},
        epochs: 1,
        batch_size: 1,
        image_width: 64,
        image_height: 64,
        flow_type: 'fine-tune-and-deploy',
    };
    const projectRes = await axios_1.default.post(`${config.baseApi}/api/projects/`, projectBody, {
        headers: config.headers,
    });
    return projectRes;
};
exports.createProject = createProject;
