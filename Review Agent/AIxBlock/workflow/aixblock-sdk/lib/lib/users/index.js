"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentProfile = void 0;
const axios_1 = __importDefault(require("axios"));
const getCurrentProfile = async (config) => {
    const resp = await axios_1.default.get(`${config.baseApi}/api/current-user/whoami`, {
        headers: config.headers,
    });
    return resp;
};
exports.getCurrentProfile = getCurrentProfile;
