import { createPiece, PieceAuth } from 'workflow-blocks-framework';
import { BlockCategory } from 'workflow-shared';
import { callFlow } from './lib/actions/call-flow';
import { response } from './lib/actions/respond';
import { callableFlow } from './lib/triggers/callable-flow';

export const flows = createPiece({
  displayName: 'Sub Flows',
  description: 'Trigger and call another sub flow.',
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.32.4',
  categories: [BlockCategory.CORE, BlockCategory.FLOW_CONTROL],
  logoUrl: 'https://cdn.activepieces.com/pieces/flows.svg',
  authors: ['hazemadelkhalel'],
  actions: [callFlow, response],
  triggers: [callableFlow],
});
