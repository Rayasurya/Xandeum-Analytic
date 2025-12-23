import { Static, Type } from '@sinclair/typebox';

export enum FormInputType {
    TEXT = 'text',
    FILE = 'file',
    TEXT_AREA = 'text_area',
    TOGGLE = 'toggle',
}

export const FormInput = Type.Object({
    displayName: Type.String(),
    required: Type.Boolean(),
    description: Type.String(),
    type: Type.Enum(FormInputType),
});

export type FormInput = Static<typeof FormInput>;

export const FormProps = Type.Object({
    inputs: Type.Array(FormInput),
    waitForResponse: Type.Boolean(),
});

export type FormProps = Static<typeof FormProps>;

export const FormResponse = Type.Object({
    id: Type.String(),
    title: Type.String(),
    props: FormProps,
    projectId: Type.String(),
    version: Type.String(),
});

export type FormResponse = Static<typeof FormResponse>;

export const ChatUIProps = Type.Object({
    botName: Type.String(),
});

export type ChatUIProps = Static<typeof ChatUIProps>;

export const ChatUIResponse = Type.Object({
    id: Type.String(),
    title: Type.String(),
    props: ChatUIProps,
    projectId: Type.String(),
    platformLogoUrl: Type.String(),
    platformName: Type.String(),
});

export type ChatUIResponse = Static<typeof ChatUIResponse>;

export const USE_DRAFT_QUERY_PARAM_NAME = 'useDraft';

export const STEP_NAME_QUERY_PARAM_NAME = 'stepName';

export const FLOW_VERSION_ID_QUERY_PARAM_NAME = 'flowVersionId';

export const FLOW_RUN_ID_QUERY_PARAM_NAME = 'flowRunId';

export const FLOW_ID_QUERY_PARAM_NAME = 'flowId';

export const DATA_SOURCE_INDEX_PARAM_NAME = 'dataSourceIndex';

export const ASSIGNEE_QUERY_PARAM_NAME = 'assignee';

export const MAPPING_KEY_QUERY_PARAM_NAME = 'mappingKey';

export const DATA_SOURCE_ID_PARAM_NAME = 'dataSourceId';

export const MULTIMODAL_KEY_PARAM_NAME = 'multimodalKey';

// For aixblock web forms
export enum AIxBlockWebFormInputType {
    TEXT = 'text',
    FILE = 'file',
    TEXT_AREA = 'text_area',
    TOGGLE = 'toggle',
    RADIO = 'radio',
    DROPDOWN = 'dropdown',
}

export const AIxBlockWebFormInput = Type.Object({
    displayName: Type.String(),
    required: Type.Boolean(),
    description: Type.String(),
    type: Type.Enum(AIxBlockWebFormInputType),
    columnIndex: Type.Number(),
    rowIndex: Type.Number(),
    dataSource: Type.Array(
        Type.Object({
            label: Type.String(),
            value: Type.String(),
        })
    ),
});

export type AIxBlockWebFormInput = Static<typeof AIxBlockWebFormInput>;

export const AIxBlockWebFormProps = Type.Object({
    inputs: Type.Array(AIxBlockWebFormInput),
    waitForResponse: Type.Boolean(),
});

export type AIxBlockWebFormProps = Static<typeof AIxBlockWebFormProps>;

export const AIxBlockWebFormResponse = Type.Object({
    id: Type.String(),
    title: Type.String(),
    props: AIxBlockWebFormProps,
    projectId: Type.String(),
    version: Type.String(),
    approveLink: Type.String(),
    rejectLink: Type.String(),
});

export type AIxBlockWebFormResponse = Static<typeof AIxBlockWebFormResponse>;

// For aixblock tasks

export const AIxBlockTasksResponse = Type.Object({
    dataSource: Type.Any(),
    approveLink: Type.String(),
    rejectLink: Type.String(),
});

export type AIxBlockTasksResponse = Static<typeof AIxBlockTasksResponse>;


// For multimodal
export const AIxBlockMultimodalResponse = Type.Object({
    multimodalConfig: Type.Any(),
    approveLink: Type.String(),
    rejectLink: Type.String(),
});

export type AIxBlockMultimodalResponse = Static<typeof AIxBlockMultimodalResponse>;
