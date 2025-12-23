import { createAction, PieceAuth, Property } from 'workflow-blocks-framework';
import { MarkdownVariant } from 'workflow-shared';

const markdown = `
## **This plugin will support generating link for user to assign task.**
`;

export const generateTaskLink = createAction({
    name: 'generate-task-link',
    displayName: 'Generate link',
    auth: PieceAuth.None(),
    description: 'Generate link for user to assign task',
    requireAuth: false,
    props: {
        about: Property.MarkDown({
            value: markdown,
            variant: MarkdownVariant.BORDERLESS,
        }),
        assignee: Property.ShortText({
            displayName: 'Assignee',
            required: true,
        }),
        mappingKey: Property.ShortText({
            displayName: 'Mapping key datasource',
            required: true,
        }),
        multimodalKey: Property.ShortText({
            displayName: 'Multimodal key',
            required: true,
        }),
    },

    async run(context) {
        const { assignee, mappingKey, multimodalKey } = context.propsValue;
        const flowRunId = context.run.id;
        const flowVersionId = context.flowVersionId;
        const stepName = context.stepName;
        const flowId = context.flows.current.id;
        const storeKey = `assignee:${assignee}/flowId:${flowId}/flowRunId:${flowRunId}/flowVersionId:${flowVersionId}/stepName:${stepName}`;
        const keyEncoded = btoa(storeKey);
        const frontEndUrl = context.server.publicUrl.replace('/api/', '');
        return {
            link: `${frontEndUrl}/aixblock-assign-tasks/${keyEncoded}?mappingKey=${mappingKey}&multimodalKey=${multimodalKey}`,
        };
    },
});
