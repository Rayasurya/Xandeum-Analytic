import { httpClient, HttpMethod } from 'workflow-blocks-common';
import { createPiece, PieceAuth } from 'workflow-blocks-framework';
import { BlockCategory } from 'workflow-shared';
import { addContact } from './lib/actions/add-contact';
import { deleteContacts } from './lib/actions/delete-contacts';
import { sendMms } from './lib/actions/send-mms';
import { sendSms } from './lib/actions/send-sms';
import { triggers } from './lib/triggers';

export const krispcallAuth = PieceAuth.CustomAuth({
  props: {
    apiKey: PieceAuth.SecretText({
      displayName: 'API key',
      required: true,
    }),
  },
  validate: async ({ auth }) => {
    try {
      await httpClient.sendRequest<string[]>({
        method: HttpMethod.GET,
        url: 'https://automationapi.krispcall.com/api/v1/platform/activepiece/me',
        headers: {
          'X-API-KEY': auth.apiKey,
        },
      });
      return { valid: true };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  },
  required: true,
});

export type krispcallAuth = {
  apiKey: string;
};

export const KrispCall = createPiece({
  displayName: 'KrispCall',
  description:
    'KrispCall is a cloud telephony system for modern businesses, offering advanced features for high-growth startups and modern enterprises.',
  categories: [BlockCategory.COMMUNICATION],
  auth: krispcallAuth,
  minimumSupportedRelease: '0.30.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/krispcall.svg',
  authors: ['deependra321'],
  actions: [addContact, deleteContacts, sendSms, sendMms],
  triggers: triggers,
});
