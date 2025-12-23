import { createPiece, PieceAuth } from 'workflow-blocks-framework';
import { BlockCategory } from 'workflow-shared';
import { tallyFormsNewSubmission } from './lib/triggers/new-submission';
export const tally = createPiece({
  displayName: 'Tally',
  description: 'Receive form submissions from Tally forms',
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.27.1',
  logoUrl: 'https://cdn.activepieces.com/pieces/tally.png',
  categories: [BlockCategory.FORMS_AND_SURVEYS],
  authors: ["kishanprmr","abuaboud"],
  actions: [],
  triggers: [tallyFormsNewSubmission],
});
