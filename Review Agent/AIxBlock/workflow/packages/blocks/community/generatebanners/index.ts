import { createPiece } from 'workflow-blocks-framework';
import { renderTemplate } from './actions/renderTemplate.action';
import { BlockCategory } from 'workflow-shared';
export const generatebanners = createPiece({
  name: 'generatebanners',
  minimumSupportedRelease: '0.30.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/generatebanners.png',
  authors: ['tpatel'],
  categories: [BlockCategory.MARKETING],
  actions: [renderTemplate],
  displayName: 'GenerateBanners',
  triggers: [],
  version: '0.1.0',
});
