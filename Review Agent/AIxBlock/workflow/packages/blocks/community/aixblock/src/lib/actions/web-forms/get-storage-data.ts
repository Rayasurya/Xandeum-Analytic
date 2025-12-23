import { propsValidation } from 'workflow-blocks-common';
import { createAction, PieceAuth, Property, StoreScope } from 'workflow-blocks-framework';
import { z } from 'zod';

export const getStorageData = createAction({
    name: 'getStorageData',
    displayName: 'Get storage data',
    auth: PieceAuth.None(),
    description: 'This function will get data which store in db',
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
        defaultValue: Property.ShortText({
            displayName: 'Default Value',
            required: false,
        }),
    },
    async run(context) {
        await propsValidation.validateZod(context.propsValue, {
            key: z.string().max(128),
        });

        const key = `${context.propsValue.key}/flowRunId_${context.run.id}`;
        const data = (await context.store.get(key, StoreScope.FLOW)) ?? context.propsValue.defaultValue;
        try {
            return JSON.parse(data as string);
        } catch {
            return data;
        }
    },
});
