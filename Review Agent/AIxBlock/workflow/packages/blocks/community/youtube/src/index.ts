import { createCustomApiCallAction } from 'workflow-blocks-common';
import {
    createPiece,
    OAuth2PropertyValue,
} from 'workflow-blocks-framework';
import { BlockCategory } from 'workflow-shared';
import { youtubeAuth } from './lib/common/auth';
import { youtubeNewVideoTrigger } from './lib/triggers/new-video.trigger';

export const youtube = createPiece({
  displayName: 'YouTube',
  description:
    'Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube',

  minimumSupportedRelease: '0.33.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/youtube.png',
  categories: [BlockCategory.CONTENT_AND_FILES],
  auth: youtubeAuth,
  authors: ['abaza738', 'kishanprmr', 'khaledmashaly', 'abuaboud'],
  actions: [
    createCustomApiCallAction({
      baseUrl: () => 'https://www.googleapis.com/youtube/v3',
      auth: youtubeAuth,
      authMapping: async (auth) => ({
        Authorization: `Bearer ${(auth as OAuth2PropertyValue).access_token}`,
      }),
    }),
  ],
  triggers: [youtubeNewVideoTrigger],
});
