import { httpClient, HttpMethod } from "workflow-blocks-common";
import { createAction, Property } from "workflow-blocks-framework";
import { aixblockAuth } from '../../..';

export const buyCompute = createAction({
    name: 'buy_compute',
    displayName: 'Buy Compute',
    description: 'Buy compute resource in aixblock platform',
    auth: aixblockAuth,
    props: {
        compute_id: Property.ShortText({
            displayName: 'Compute ID',
            description: 'ID of the compute from get-computes response',
            required: true,
        }),
        hours: Property.Number({
            displayName: 'Hours',
            description: 'Number of hours to rent',
            required: true,
            defaultValue: 1,
        }),
        diskSize: Property.Number({
            displayName: 'Disk Size (GB)',
            description: 'Disk size in GB',
            required: false,
            defaultValue: 40,
        }),
        token: Property.StaticDropdown({
            displayName: 'Payment Token',
            description: 'Token to use for payment',
            required: false,
            defaultValue: 'USD',
            options: {
                options: [
                    { label: 'USD', value: 'USD' },
                ]
            }
        }),
    },
    async run({ auth, propsValue }) {
        if (!propsValue.compute_id || !propsValue.hours) {
            throw new Error('Compute ID and hours are required');
        }

        const response = await httpClient.sendRequest({
            method: HttpMethod.POST,
            url: `${auth.baseApiUrl}/api/compute_marketplace/buy`,
            body: {
                token_name: 'United States Dollar',
                token_symbol: propsValue.token || 'USD',
                price: 0.158, // This should be dynamic based on the compute's price
                account: 1,
                compute_gpus_rent: [],
                compute_rent_vast: [
                    {
                        id: propsValue.compute_id,
                        hours: propsValue.hours,
                        type: 'model-training',
                        price: 0.158, // This should be dynamic based on the compute's price
                        diskSize: propsValue.diskSize || 40
                    }
                ],
                compute_rent_exabit: [],
                compute_cpus_rent: []
            },
            headers: {
                Authorization: `Token ${auth.apiToken}`
            }
        });

        return response.body;
    }
});
