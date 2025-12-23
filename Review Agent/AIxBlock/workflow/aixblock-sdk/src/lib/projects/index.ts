import axios from 'axios';
import { IConfig } from '../../models';

export const getListProject = async (
    config: IConfig,
    pageSize: number = 20,
    pageIndex: number = 1,
) => {
    const resp = await axios.get(`${config.baseApi}/api/projects/list`, {
        params: {
            page: pageIndex,
            page_size: pageSize,
        },
        headers: config.headers,
    });
    return resp;
};

export const createProject = async (config: IConfig, name?: string) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const title = name
        ? name
        : `Project ${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
              now.getHours(),
          )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
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
    const projectRes = await axios.post(`${config.baseApi}/api/projects/`, projectBody, {
        headers: config.headers,
    });

    return projectRes;
};
