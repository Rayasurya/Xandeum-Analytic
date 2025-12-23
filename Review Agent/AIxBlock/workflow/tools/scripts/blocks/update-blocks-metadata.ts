import { StatusCodes } from 'http-status-codes';
import assert from 'node:assert';
import { HttpHeader } from '../../../packages/blocks/community/common/src';
import { BlockMetadata } from '../../../packages/blocks/community/framework/src';
import { AP_CLOUD_API_BASE, findNewPieces, pieceMetadataExists } from '../utils/block-script-utils';

assert(process.env['AP_CLOUD_API_KEY'], 'API Key is not defined');

const { AP_CLOUD_API_KEY } = process.env;

const insertPieceMetadata = async (
  pieceMetadata: BlockMetadata
): Promise<void> => {
  const body = JSON.stringify(pieceMetadata);

  const headers = {
    [HttpHeader.API_KEY]: AP_CLOUD_API_KEY,
    [HttpHeader.CONTENT_TYPE]: 'application/json'
  };

  const cloudResponse = await fetch(`${AP_CLOUD_API_BASE}/admin/pieces`, {
    method: 'POST',
    headers,
    body
  });

  if (cloudResponse.status !== StatusCodes.OK) {
    throw new Error(await cloudResponse.text());
  }
};



const insertMetadataIfNotExist = async (pieceMetadata: BlockMetadata) => {
  console.info(
    `insertMetadataIfNotExist, name: ${pieceMetadata.name}, version: ${pieceMetadata.version}`
  );

  const metadataAlreadyExist = await pieceMetadataExists(
    pieceMetadata.name,
    pieceMetadata.version
  );

  if (metadataAlreadyExist) {
    console.info(`insertMetadataIfNotExist, piece metadata already inserted`);
    return;
  }

  await insertPieceMetadata(pieceMetadata);
};

const insertMetadata = async (piecesMetadata: BlockMetadata[]) => {
  await Promise.all(piecesMetadata.map(insertMetadataIfNotExist))
};


const main = async () => {
  console.log('update pieces metadata: started')

  const piecesMetadata = await findNewPieces()
  await insertMetadata(piecesMetadata)

  console.log('update pieces metadata: completed')
  process.exit()
}

main()
