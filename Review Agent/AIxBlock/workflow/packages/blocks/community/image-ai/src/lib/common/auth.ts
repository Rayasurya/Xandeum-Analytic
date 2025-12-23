import { PieceAuth, Property } from "workflow-blocks-framework";

const markdown = `
      To obtain your AIxBlock API access token, follow these steps below:
      1. Log in to your AIxBlock account at https://app.aixblock.io .
      2. Navigate to Settings < API Key >.
      3. Click on Copy icon to copy your existing Key or click on New API Key to create a new one.
      4. Copy the API Key and paste it below in "AIxBlock API Key".
`;

export const aixblockAuth = PieceAuth.CustomAuth({
    description: markdown,
    required: true,
    props: {
        baseApiUrl: Property.ShortText({
            displayName: 'Aixblock platform url',
            required: true,
        }),
        apiToken: PieceAuth.SecretText({
            displayName: 'API Token',
            required: true,
        }),
    },
});