import { propsValidation } from 'workflow-blocks-common';
import { createAction, PieceAuth, Property, StoreScope } from 'workflow-blocks-framework';
import { z } from 'zod';

export const upsertStorageData = createAction({
    name: 'upsertStorageData',
    auth: PieceAuth.None(),
    displayName: 'Upsert storage data',
    description: 'This function will upsert data to DB',
    requireAuth: false,
    errorHandlingOptions: {
        continueOnFailure: {
            hide: true,
        },
        retryOnFailure: {
            hide: true,
        },
    },
    props: {
        key: Property.ShortText({
            displayName: 'Key',
            required: true,
        }),
        value: Property.ShortText({
            displayName: 'Value',
            required: true,
        }),
    },
    async run(context) {
        await propsValidation.validateZod(context.propsValue, {
            key: z.string().max(128),
        });
        const key = `${context.propsValue.key}/flowRunId_${context.run.id}`;
        const data = await context.store.put(key, context.propsValue.value, StoreScope.FLOW);
        try {
            return JSON.parse(data as string);
        } catch {
            return data;
        }
    },
});
