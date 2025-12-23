import { createPiece } from 'workflow-blocks-framework';
import { BlockCategory } from 'workflow-shared';
import { generateAudio } from './lib/actions/generate-audio';
import { textToAudio } from './lib/actions/text-to-audio';
import { textToSpeech } from './lib/actions/text-to-speech';
import { aixblockAuth } from './lib/common/auth';

export const audioAi = createPiece({
    displayName: 'Audio AI',
    auth: aixblockAuth,
    minimumSupportedRelease: '0.30.0',
    logoUrl: 'https://aixblock.io/assets/images/logo-img.svg',
    categories: [BlockCategory.ARTIFICIAL_INTELLIGENCE, BlockCategory.UNIVERSAL_AI],
    authors: ['aixblock'],
    actions: [generateAudio, textToAudio, textToSpeech],
    triggers: [],
});
