import { httpClient, HttpMethod } from 'workflow-blocks-common';
import { createAction, Property } from 'workflow-blocks-framework';
import { gameballAuth } from '../..';

export const sendEvent = createAction({
  name: 'sendEvent',
  auth: gameballAuth,
  displayName: 'Send event',
  description: 'Send an event to gameball',
  props: {
    playerUniqueId: Property.ShortText({
      displayName: 'Your Player Unique Id',
      required: true,
    }),
    eventName: Property.ShortText({
      displayName: 'Event Name',
      required: true,
    }),
  },
  async run(context) {
    const res = await httpClient.sendRequest<string[]>({
      method: HttpMethod.POST,
      url: 'https://api.gameball.co/api/v3.0/integrations/event',
      headers: {
        APIKey: context.auth, // Pass API key in headers
      },
      // update the event body with eventmetadata if requested in the future.
      body: {
        "playerUniqueId": context.propsValue.playerUniqueId,
        "events": {
          [context.propsValue.eventName]: {

          }
        }
      }
    });
    return res.body;
  },
});
