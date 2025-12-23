import {JSONSchemaType} from "ajv";
import createAjvValidator from "../utils/createAjvValidator";
import {TTutorialArticle, tutorialArticleModelSchema} from "./tutorialArticle";

export type TTutorialSection = {
  id: number,
  title: string,
  url: string,
  sub_group_id: number,
  tutorial_content?: TTutorialArticle,
  created_at?: string,
  updated_at?: string,
}

export type TTutorialSectionList = TTutorialSection[];

// @ts-ignore
export const tutorialSectionModelSchema: JSONSchemaType<TTutorialSection> = {
  type: "object",
  properties: {
    id: {type: "number"},
    title: {type: "string"},
    url: {type: "string"},
    sub_group_id: {type: "number"},
    tutorial_content: {oneOf: [tutorialArticleModelSchema, {type: "null"}]},
    created_at: {type: "string", nullable: true},
    updated_at: {type: "string", nullable: true},
  },
  required: [
    "title",
    "url",
    "sub_group_id",
  ],
  additionalProperties: true,
}

export const tutorialSubgroupListModelSchema: JSONSchemaType<TTutorialSectionList> = {
  type: "array",
  items: tutorialSectionModelSchema,
}

export const validateTutorialSectionModel = createAjvValidator<TTutorialSection>(tutorialSectionModelSchema);
export const validateTutorialSectionListModel = createAjvValidator<TTutorialSectionList>(tutorialSubgroupListModelSchema);
