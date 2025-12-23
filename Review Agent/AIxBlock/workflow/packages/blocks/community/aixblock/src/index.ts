import { createPiece, PieceAuth, Property } from 'workflow-blocks-framework';
import { BlockCategory } from 'workflow-shared';
import { analysisTextWithAssistants } from './lib/actions/crawling/analysis-text-with-ai-assistant';
import { crawlingWithAiAssistant } from './lib/actions/crawling/crawling-with-ai-assistant';
import { crawlingWithGoogle } from './lib/actions/crawling/crawling-with-google';
import { crawlingWithLlmModel } from './lib/actions/crawling/crawling-with-llm-model';
import { getTensorboard } from './lib/actions/dashboard/get-tensorboard';
import { downloadDataset } from './lib/actions/dataset/download-dataset';
import { getDataset } from './lib/actions/dataset/get-dataset';
import { uploadLocalFileDatasetToProject } from './lib/actions/dataset/upload-dataset';
import { getChannels } from './lib/actions/ml/get-channels';
import { getMlInfo } from './lib/actions/ml/get-ml-info';
import { addModel } from './lib/actions/model/add-model';
import { predict } from './lib/actions/model/predict';
import { train } from './lib/actions/model/train';
import { getAnnotationTemplate } from './lib/actions/project/get-annotation-template';
import { getCatalog } from './lib/actions/project/get-catalog';
import { getCurrentProfile } from './lib/actions/project/get-current-profile';
import { getListProject } from './lib/actions/project/get-list-project';
import { customMultimodal } from './lib/actions/tasks/custom-multimodal';
import { generateTaskLink } from './lib/actions/tasks/generate-task-link';
import { mappingTasksToUser } from './lib/actions/tasks/mapping-tasks-to-user';
import { waitSubmit } from './lib/actions/tasks/wait-submit';
import { aixBlockWebForm } from './lib/actions/web-forms/form-action';
import { getStorageData } from './lib/actions/web-forms/get-storage-data';
import { upsertStorageData } from './lib/actions/web-forms/upsert-storage-data';
import { onFormSubmission } from './lib/triggers/web-forms/form-trigger';

const markdown = `
      To obtain your AIxBlock API access token, follow these steps below:
      1. Log in to your AIxBlock account at https://app.aixblock.io .
      2. Navigate to Settings < API Key >.
      3. Click on Copy icon to copy your existing Key or click on New API Key to create a new one.
      4. Copy the API Key and paste it below in "AIxBlock API Key".

`;

export const aixblockAuth = PieceAuth.CustomAuth({
    description: markdown,
    required: true,
    props: {
        baseApiUrl: Property.ShortText({
            displayName: 'AIxBlock platform url',
            required: true,
        }),
        apiToken: PieceAuth.SecretText({
            displayName: 'API Token',
            required: true,
        }),
    },
});

export const aixBlockPlatform = createPiece({
    displayName: 'AIxBlock',
    auth: aixblockAuth,
    minimumSupportedRelease: '0.0.1',
    logoUrl: 'https://aixblock.io/assets/images/logo-img.svg',
    categories: [BlockCategory.ARTIFICIAL_INTELLIGENCE],
    authors: ["aixblock's developer"],
    actions: [
        crawlingWithGoogle,
        crawlingWithAiAssistant,
        crawlingWithLlmModel,
        getDataset,
        downloadDataset,
        uploadLocalFileDatasetToProject,
        train,
        predict,
        addModel,
        getMlInfo,
        getTensorboard,
        getChannels,
        generateTaskLink,
        mappingTasksToUser,
        customMultimodal,
        waitSubmit,
        getStorageData,
        upsertStorageData,
        analysisTextWithAssistants,
        aixBlockWebForm,
        getCurrentProfile,
        getListProject,
        getAnnotationTemplate,
        getCatalog
        // importRawFIle,
        // exportData,
        // getComputes,
        // getProjectById,
        // buyCompute,
        // checkGpuStatus,
        // getAvailableGpus,
        // setupDataset,
        // getMlNetwork,
    ],
    triggers: [onFormSubmission],
});
