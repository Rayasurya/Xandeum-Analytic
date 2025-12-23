import {JSONSchemaType} from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

export type TTutorialArticle = {
  id: number,
  title: string,
  content: string,
  section_id: number,
  created_at?: string,
  updated_at?: string,
}

export type TTutorialArticleList = TTutorialArticle[];

export const tutorialArticleModelSchema: JSONSchemaType<TTutorialArticle> = {
  type: "object",
  properties: {
    id: {type: "number"},
    title: {type: "string"},
    content: {type: "string"},
    section_id: {type: "number"},
    created_at: {type: "string", nullable: true},
    updated_at: {type: "string", nullable: true},
  },
  required: [
    "title",
    "content",
    "section_id",
  ],
  additionalProperties: true,
}

export const tutorialSubgroupListModelSchema: JSONSchemaType<TTutorialArticleList> = {
  type: "array",
  items: tutorialArticleModelSchema,
}

export const validateTutorialArticleModel = createAjvValidator<TTutorialArticle>(tutorialArticleModelSchema);
export const validateTutorialArticleListModel = createAjvValidator<TTutorialArticleList>(tutorialSubgroupListModelSchema);
