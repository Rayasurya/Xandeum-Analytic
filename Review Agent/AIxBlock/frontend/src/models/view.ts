import {JSONSchemaType} from "ajv";
import createAjvValidator from "../utils/createAjvValidator";

export enum EViewType {
  "list" = "list",
  "grid" = "grid",
}

export type TViewFilterModel = {
  filter: string,
  operator: string,
  type: string,
  value: string | number | boolean | {min?: string | null, max?: string | null} | {min?: number | null, max?: number | null} | null,
}

export const viewFilterModelSchema: JSONSchemaType<TViewFilterModel> = {
  type: "object",
  properties: {
    filter: {type: "string"},
    operator: {type: "string"},
    type: {type: "string"},
    value: {
      oneOf: [
        {type: "string"},
        {type: "number"},
        {type: "boolean"},
        {
          type: "object",
          properties: {
            min: {type: "string", nullable: true},
            max: {type: "string", nullable: true},
          },
          required: [],
        },
        {
          type: "object",
          properties: {
            min: {type: "number", nullable: true},
            max: {type: "number", nullable: true},
          },
          required: [],
        },
        {type: "null", nullable: true},
      ],
    },
  },
  required: [
    "filter",
    "operator",
    "type",
    "value",
  ],
}

export type TViewDataModel = {
  type: EViewType,
  title: string,
  target: "tasks",
  gridWidth: number,
  columnsWidth: { [k: string]: number },
  hiddenColumns: {
    explore: string[],
    labeling: string[],
  },
  columnsDisplayType: {},
  filters: {
    conjunction: "and" | "or",
    items: TViewFilterModel[],
  },
  ordering?: string[],
}

export const viewDataModelSchema: JSONSchemaType<TViewDataModel> = {
  type: "object",
  properties: {
    type: {type: "string", enum: Object.keys(EViewType) as readonly EViewType[]},
    title: {type: "string"},
    target: {type: "string"},
    gridWidth: {type: "integer"},
    columnsWidth: {
      type: "object",
      patternProperties: {
        "^.+$": {type: "number"},
      },
      required: [
      ],
    },
    hiddenColumns: {
      type: "object",
      properties: {
        explore: {type: "array", items: {type: "string"}},
        labeling: {type: "array", items: {type: "string"}},
      },
      required: [
        "explore",
        "labeling",
      ],
    },
    columnsDisplayType: {type: "object"},
    filters: {
      type: "object",
      properties: {
        conjunction: {type: "string", enum: ["and", "or"]},
        items: {
          type: "array",
          items: viewFilterModelSchema,
        },
      },
      required: [
        "conjunction",
        "items",
      ],
    },
    ordering: {type: "array", items: {type: "string"}, nullable: true},
  },
  required: [
    "type",
    "title",
    "target",
    "gridWidth",
    "columnsWidth",
    "hiddenColumns",
    "columnsDisplayType",
    "filters",
  ],
}

export type TViewModel = {
  id: number,
  data: TViewDataModel,
  project: number,
  user: number,
  is_private: boolean,
}

export const viewModelSchema: JSONSchemaType<TViewModel> = {
  type: "object",
  properties: {
    id: {type: "integer"},
    data: viewDataModelSchema,
    project: {type: "number"},
    user: {type: "number"},
    is_private: {type: "boolean"},
  },
  required: [
    "id",
    "data",
    "project",
    "user",
    "is_private",
  ],
  additionalProperties: true,
}

export const validateViewModel = createAjvValidator<TViewModel>(viewModelSchema);
