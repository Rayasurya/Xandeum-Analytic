import {
    httpClient,
    HttpMethod,
    HttpRequest,
} from 'workflow-blocks-common';
import {
    createPiece,
    PieceAuth,
    Property,
} from 'workflow-blocks-framework';
import { BlockCategory } from 'workflow-shared';
import { eventsById } from './lib/actions/get-events-by-id';
import { onEventChanged } from './lib/triggers/calendar-event';
import { onChangedData } from './lib/triggers/on-changed-data';

export const weblingAuth = PieceAuth.CustomAuth({
  required: true,
  props: {
    baseUrl: Property.ShortText({
      displayName: 'Base URL',
      required: true,
      defaultValue: 'example.webling.ch',
    }),
    apikey: PieceAuth.SecretText({
      displayName: 'API Key',
      required: true,
    }),
  },
  validate: async ({ auth }) => {
    try {
      const request: HttpRequest = {
        method: HttpMethod.GET,
        url: `https://${auth.baseUrl}/api/1/member`,
        headers: {
          apikey: auth.apikey,
        },
      };
      await httpClient.sendRequest(request);
      return {
        valid: true,
      };
    } catch (e: any) {
      return {
        valid: false,
        error: e?.message,
      };
    }
  },
});

export const webling = createPiece({
  displayName: 'Webling',
  auth: weblingAuth,
  minimumSupportedRelease: '0.30.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/webling.png',
  categories: [BlockCategory.PRODUCTIVITY],
  authors: ['felifluid'],
  actions: [eventsById],
  triggers: [onEventChanged, onChangedData],
});
