import { createAction } from 'workflow-blocks-framework';
import { aixblockAuth } from '../../..';

export const importRawFIle = createAction({
  name: 'import_raw_file',
  auth: aixblockAuth,
  displayName: 'Import raw file',
  description: 'Import raw file',
  props: {},
  async run({ auth, propsValue }) {},
});
