import { packagePrePublishChecks } from './utils/package-pre-publish-checks';
import { findAllPiecesDirectoryInSource } from './utils/piece-script-utils';

const main = async () => {
  const piecesMetadata = await findAllPiecesDirectoryInSource()

  const packages = [
    ...piecesMetadata,
    'packages/blocks/community/framework',
    'packages/shared',
    'packages/blocks/community/common',
  ]

  const validationResults = packages.map(p => packagePrePublishChecks(p))

  Promise.all(validationResults);
}

main();
