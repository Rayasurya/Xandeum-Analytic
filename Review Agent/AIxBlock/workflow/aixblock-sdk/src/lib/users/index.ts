import axios from 'axios';
import { IConfig } from '../../models';

export const getCurrentProfile = async (config: IConfig) => {
    const resp = await axios.get(`${config.baseApi}/api/current-user/whoami`, {
        headers: config.headers,
    });
    return resp;
};
