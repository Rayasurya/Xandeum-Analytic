import {JSONSchemaType} from "ajv";
import createAjvValidator from "../utils/createAjvValidator";
import {TTutorialSubgroup, tutorialSubgroupModelSchema} from "./tutorialSubgroup";

export type TTutorialGroup = {
  id: number,
  sub_groups: TTutorialSubgroup[],
  keyword: string,
  name: string,
  order?: number,
  created_at?: string,
  updated_at?: string,
}

export type TTutorialGroupList = TTutorialGroup[];

export const tutorialGroupModelSchema: JSONSchemaType<TTutorialGroup> = {
  type: "object",
  properties: {
    id: {type: "number"},
    sub_groups: {type: "array", items: tutorialSubgroupModelSchema},
    keyword: {type: "string"},
    name: {type: "string"},
    order: {type: "number", nullable: true},
    created_at: {type: "string", nullable: true},
    updated_at: {type: "string", nullable: true},
  },
  required: [
    "name",
  ],
  additionalProperties: true,
}

export const tutorialGroupListModelSchema: JSONSchemaType<TTutorialGroupList> = {
  type: "array",
  items: tutorialGroupModelSchema,
}

export const validateTutorialGroupModel = createAjvValidator<TTutorialGroup>(tutorialGroupModelSchema);
export const validateTutorialGroupListModel = createAjvValidator<TTutorialGroupList>(tutorialGroupListModelSchema);
