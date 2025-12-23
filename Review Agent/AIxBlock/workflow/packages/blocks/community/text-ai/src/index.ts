import { createPiece, PieceAuth } from 'workflow-blocks-framework';
import { BlockCategory } from 'workflow-shared';
import { askAi } from './lib/actions/ask-ai';
import { summarizeText } from './lib/actions/summarize-text';

export const activepiecesAi = createPiece({
  displayName: 'Text AI',
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.32.0',
  categories: [
    BlockCategory.ARTIFICIAL_INTELLIGENCE,
    BlockCategory.UNIVERSAL_AI,
  ],
  logoUrl: 'https://cdn.activepieces.com/pieces/text-ai.svg',
  authors: ['anasbarg'],
  actions: [askAi, summarizeText],
  triggers: [],
});
