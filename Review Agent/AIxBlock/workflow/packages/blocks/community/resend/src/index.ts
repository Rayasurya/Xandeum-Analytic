import { createCustomApiCallAction } from 'workflow-blocks-common';
import { PieceAuth, createPiece } from 'workflow-blocks-framework';
import { BlockCategory } from 'workflow-shared';
import { sendEmail } from './lib/actions/send-email';

export const resendAuth = PieceAuth.SecretText({
  displayName: 'API Key',
  required: true,
});

export const resend = createPiece({
  displayName: 'Resend',
  description: 'Email for developers',

  minimumSupportedRelease: '0.30.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/resend.png',
  categories: [BlockCategory.BUSINESS_INTELLIGENCE, BlockCategory.MARKETING],
  authors: ["kishanprmr","MoShizzle","khaledmashaly","abuaboud"],
  auth: resendAuth,
  actions: [
    sendEmail,
    createCustomApiCallAction({
      baseUrl: () => 'https://api.resend.com',
      auth: resendAuth,
      authMapping: async (auth) => ({
        Authorization: `Bearer ${auth}`,
      }),
    }),
  ],
  triggers: [],
});
