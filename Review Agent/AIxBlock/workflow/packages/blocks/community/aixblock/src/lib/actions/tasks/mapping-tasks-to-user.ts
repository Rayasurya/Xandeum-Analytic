import { createAction, PieceAuth, Property, StoreScope } from 'workflow-blocks-framework';
import { MarkdownVariant } from 'workflow-shared';

const markdown = `
## **This plugin will support mapping tasks to user and update data source in store.**
`;

export const mappingTasksToUser = createAction({
    name: 'mapping-tasks-to-user',
    displayName: 'Mapping tasks to user',
    auth: PieceAuth.None(),
    requireAuth: false,
    description: 'Mapping tasks to user and update data source in store',
    props: {
        about: Property.MarkDown({
            value: markdown,
            variant: MarkdownVariant.BORDERLESS,
        }),
        totalTasksPerUser: Property.Number({
            displayName: 'Total tasks per user',
            required: true,
        }),
        users: Property.ShortText({
            displayName: 'Assignee',
            required: true,
        }),
        mappingKeyDataSource: Property.ShortText({
            displayName: 'Mapping key data source',
            required: true,
        }),
        datasource: Property.ShortText({
            displayName: 'Data source',
            required: true,
        }),
    },
    async run(context) {
        const users = JSON.parse(context.propsValue.users);
        const tasks = JSON.parse(context.propsValue.datasource);
        const totalTasksPerUser = Number(context.propsValue.totalTasksPerUser);
        const mappingKeyDataSource = context.propsValue.mappingKeyDataSource;

        const updatedTasks = [...tasks]; // clone to avoid mutating original
        let userIndex = 0;
        let taskCountForUser = 0;

        for (let i = 0; i < updatedTasks.length; i++) {
            // assign task
            updatedTasks[i].assignee = users[userIndex];
            if (!updatedTasks[i]?.id) {
                updatedTasks[i].id = genRandomCode();
            }

            taskCountForUser++;

            // move to next user if reached task limit
            if (taskCountForUser === totalTasksPerUser) {
                userIndex = (userIndex + 1) % users.length;
                taskCountForUser = 0;
            }
        }
        const key = `${mappingKeyDataSource}/flowRunId_${context.run.id}`;
        await context.store.put(key, updatedTasks, StoreScope.FLOW);
        return updatedTasks;
    },
});

const genRandomCode = (length = 10) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return 'AXB-' + Array.from(
        { length },
        () => chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
}