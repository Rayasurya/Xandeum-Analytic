import { createPiece } from 'workflow-blocks-framework';
import { BlockCategory } from 'workflow-shared';
import { generateImage } from './lib/actions/generate-image';
import { imageClassification } from './lib/actions/image-classification';
import { imageSegmentation } from './lib/actions/image-segmentation';
import { objectDetection } from './lib/actions/object-detection';
import { aixblockAuth } from './lib/common/auth';

export const imageAi = createPiece({
  displayName: 'Image AI',
  auth: aixblockAuth,
  minimumSupportedRelease: '0.30.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/image-ai.svg',
  categories: [
    BlockCategory.ARTIFICIAL_INTELLIGENCE,
    BlockCategory.UNIVERSAL_AI,
  ],
  authors: ['kishanprmr'],
  actions: [generateImage, imageClassification, objectDetection, imageSegmentation],
  triggers: [],
});
