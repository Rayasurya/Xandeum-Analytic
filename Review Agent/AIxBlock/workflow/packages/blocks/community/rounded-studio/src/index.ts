import { createPiece, PieceAuth } from "workflow-blocks-framework";
import { createCustomApiCallAction } from 'workflow-blocks-common';

export const roundedStudioAuth = PieceAuth.SecretText({
  displayName: 'API Key',
  required: true,
  description: 'Please enter the API Key obtained from Rounded Studio.',
});

export const roundedStudio = createPiece({
  displayName: "Rounded-studio",
  auth: roundedStudioAuth,
  minimumSupportedRelease: '0.36.1',
  logoUrl: "https://cdn.activepieces.com/pieces/rounded-studio.png",
  authors: ["perrine-pullicino-alan"],
  actions: [
    createCustomApiCallAction({
      baseUrl: () => {
        return "https://api.callrounded.com/v1";
      },
      auth: roundedStudioAuth,
      authMapping: async (auth) => ({
        'x-app': 'activepieces',
        'api_key': auth as string,
      }),
    })
  ],
    triggers: [],
});
