import { createPiece, PieceAuth } from 'workflow-blocks-framework';
import { BlockCategory } from 'workflow-shared';
import { checkModeration } from './lib/actions/check-moderation';
import { classifyText } from './lib/actions/classify-text';
import { extractStructuredData } from './lib/actions/extract-structured-data';

export const aiUtility = createPiece({
  displayName: 'Utility AI',
  auth: PieceAuth.None(),
  categories: [
    BlockCategory.ARTIFICIAL_INTELLIGENCE,
    BlockCategory.UNIVERSAL_AI,
  ],
  minimumSupportedRelease: '0.30.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/ai-utility.svg',
  authors: ['kishanprmr'],
  actions: [checkModeration, classifyText, extractStructuredData],
  triggers: [],
});
