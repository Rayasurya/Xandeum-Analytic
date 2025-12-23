import { FastifyPluginAsyncTypebox, FastifyPluginCallbackTypebox } from '@fastify/type-provider-typebox'
import { BlockMetadata, BlockMetadataModel } from 'workflow-blocks-framework'
import { BlockType, PackageType } from 'workflow-shared'
import { blockMetadataService } from '../../blocks/block-metadata-service'
import { CreatePieceRequest } from './admin-block-requests.ee'

export const adminPieceModule: FastifyPluginAsyncTypebox = async (app) => {
    await app.register(adminPieceController, { prefix: '/v1/admin/pieces' })
}

const adminPieceController: FastifyPluginCallbackTypebox = (
    app,
    _opts,
    done,
) => {
    app.post(
        '/',
        CreatePieceRequest,
        async (req): Promise<BlockMetadataModel> => {
            return blockMetadataService(req.log).create({
                blockMetadata: req.body as BlockMetadata,
                packageType: PackageType.REGISTRY,
                blockType: BlockType.OFFICIAL,
            })
        },
    )

    done()
}
