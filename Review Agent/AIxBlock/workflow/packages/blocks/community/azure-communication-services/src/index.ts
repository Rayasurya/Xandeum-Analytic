import { createPiece, PieceAuth } from 'workflow-blocks-framework';
import { BlockCategory } from 'workflow-shared';
import { sendEmail } from './lib/actions/send-email';

export const azureCommunicationServiceAuth = PieceAuth.SecretText({
  displayName: 'Connection string',
  required: true,
});

export const azureCommunicationServices = createPiece({
  displayName: 'Azure Communication Services',
  description: 'Communication services from Microsoft Azure',
  auth: azureCommunicationServiceAuth,
  minimumSupportedRelease: '0.30.0',
  logoUrl:
    'https://cdn.activepieces.com/pieces/azure-communication-services.png',
  categories: [BlockCategory.COMMUNICATION, BlockCategory.MARKETING],
  authors: ['matthieu-lombard'],
  actions: [sendEmail],
  triggers: [],
});
