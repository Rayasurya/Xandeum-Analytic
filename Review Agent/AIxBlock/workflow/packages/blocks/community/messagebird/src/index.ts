import { createPiece } from 'workflow-blocks-framework';
import { BlockCategory } from 'workflow-shared';
import { sendSMSAction } from './lib/actions/send-sms.action';
import { birdAuth } from './lib/auth';

export const messagebird = createPiece({
  displayName: 'Bird',
  description: 'Unified CRM for Marketing, Service & Payments',
  auth: birdAuth,
  minimumSupportedRelease: '0.30.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/messagebird.png',
  categories: [BlockCategory.MARKETING, BlockCategory.COMMUNICATION],
  authors: ['kishanprmr', 'geekyme'],
  actions: [sendSMSAction],
  triggers: [],
});
