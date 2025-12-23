import {
    httpClient,
    HttpMethod
} from "workflow-blocks-common";
import { createAction, Property } from "workflow-blocks-framework";
import { aixblockAuth } from '../../..';

export const getListProject = createAction({
  name: "get_list_project",
  auth: aixblockAuth,
  displayName: "Get list projects",
  description: "Function to get list projects of user in aixblock platform",
  props: {
    pageSize: Property.ShortText({
      displayName: "Page Size",
      description: "Page size for paging",
      required: true,
      defaultValue: "20",
    }),
    page: Property.ShortText({
      displayName: "Page",
      description: "Page for paging",
      required: true,
      defaultValue: "1",
    }),
  },
  async run({ auth, propsValue }) {
    const response = await httpClient.sendRequest<string[]>({
      method: HttpMethod.GET,
      url: `${auth.baseApiUrl}/api/projects/list`,
      queryParams: {
        page: propsValue.page,
        page_size: propsValue.pageSize,
      },
      headers: {
        Authorization: `Token ${auth.apiToken}`,
      },
    });

    return response.body;
  },
});
