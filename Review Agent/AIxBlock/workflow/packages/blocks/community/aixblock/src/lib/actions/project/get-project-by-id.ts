import {
    httpClient,
    HttpMethod
} from "workflow-blocks-common";
import { createAction, Property } from "workflow-blocks-framework";
import { aixblockAuth } from '../../..';

export const getProjectById = createAction({
  name: "get_project_by_id",
  auth: aixblockAuth,
  displayName: "Get project by id",
  description: "Function to get project of user in aixblock platform",
  props: {
    projectId: Property.ShortText({
      displayName: "Project ID",
      description: "Project ID",
      required: true,
    }),
  },
  async run({ auth, propsValue }) {
    const response = await httpClient.sendRequest<string[]>({
      method: HttpMethod.GET,
      url: `${auth.baseApiUrl}/api/projects/${propsValue.projectId}`,
      headers: {
        Authorization: `Token ${auth.apiToken}`,
      },
    });

    return response.body;
  },
});
