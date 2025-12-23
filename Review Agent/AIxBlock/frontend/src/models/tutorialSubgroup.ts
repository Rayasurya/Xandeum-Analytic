import {JSONSchemaType} from "ajv";
import createAjvValidator from "../utils/createAjvValidator";
import {TTutorialSection, tutorialSectionModelSchema} from "./tutorialSection";

export type TTutorialSubgroup = {
  id: number,
  section_contents: TTutorialSection[],
  name: string,
  group_id: number,
  created_at?: string,
  updated_at?: string,
}

export type TTutorialSubgroupList = TTutorialSubgroup[];

export const tutorialSubgroupModelSchema: JSONSchemaType<TTutorialSubgroup> = {
  type: "object",
  properties: {
    id: {type: "number"},
    section_contents: {type: "array", items: tutorialSectionModelSchema},
    name: {type: "string"},
    group_id: {type: "number"},
    created_at: {type: "string", nullable: true},
    updated_at: {type: "string", nullable: true},
  },
  required: [
    "name",
    "group_id"
  ],
  additionalProperties: true,
}

export const tutorialSubgroupListModelSchema: JSONSchemaType<TTutorialSubgroupList> = {
  type: "array",
  items: tutorialSubgroupModelSchema,
}

export const validateTutorialSubgroupModel = createAjvValidator<TTutorialSubgroup>(tutorialSubgroupModelSchema);
export const validateTutorialSubgroupListModel = createAjvValidator<TTutorialSubgroupList>(tutorialSubgroupListModelSchema);
