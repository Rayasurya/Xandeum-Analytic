import dayjs from 'dayjs'
import { FastifyBaseLogger } from 'fastify'
import { StatusCodes } from 'http-status-codes'
import { BlockMetadataModel, BlockMetadataModelSummary } from 'workflow-blocks-framework'
import { AppSystemProp, apVersionUtil } from 'workflow-server-shared'
import { BlockSyncMode, BlockType, ListVersionsResponse, PackageType } from 'workflow-shared'
import { repoFactory } from '../core/db/repo-factory'
import { parseAndVerify } from '../helper/json-validator'
import { systemJobsSchedule } from '../helper/system-jobs'
import { SystemJobName } from '../helper/system-jobs/common'
import { systemJobHandlers } from '../helper/system-jobs/job-handlers'
import { system } from '../helper/system/system'
import { BlockMetadataEntity } from './block-metadata-entity'
import { blockMetadataService } from './block-metadata-service'

const CLOUD_API_URL = 'https://cloud.activepieces.com/api/v1/pieces'
const repo = repoFactory(BlockMetadataEntity)
const syncMode = system.get<BlockSyncMode>(AppSystemProp.BLOCKS_SYNC_MODE)

export const blockSyncService = (log: FastifyBaseLogger) => ({
    async setup(): Promise<void> {
        if (syncMode !== BlockSyncMode.OFFICIAL_AUTO) {
            log.info('Block sync service is disabled')
            return
        }
        systemJobHandlers.registerJobHandler(SystemJobName.BLOCKS_SYNC, async function syncBlocksJobHandler(): Promise<void> {
            await blockSyncService(log).sync()
        })
        await blockSyncService(log).sync()
        await systemJobsSchedule(log).upsertJob({
            job: {
                name: SystemJobName.BLOCKS_SYNC,
                data: {},
            },
            schedule: {
                type: 'repeated',
                cron: '0 */1 * * *',
            },
        })
    },
    async sync(): Promise<void> {
        if (syncMode !== BlockSyncMode.OFFICIAL_AUTO) {
            log.info('Block sync service is disabled')
            return
        }
        try {
            log.info({ time: dayjs().toISOString() }, 'Syncing blocks')
            const blocks = await listBlocks()
            const promises: Promise<void>[] = []

            for (const summary of blocks) {
                const lastVersionSynced = await existsInDatabase({ name: summary.name, version: summary.version })
                if (!lastVersionSynced) {
                    promises.push(syncBlock(summary.name, log))
                }
            }
            await Promise.all(promises)
        }
        catch (error) {
            log.error({ error }, 'Error syncing blocks')
        }
    },
})

async function syncBlock(name: string, log: FastifyBaseLogger): Promise<void> {
    try {
        log.info({ name }, 'Syncing block metadata into database')
        const versions = await getVersions({ name })
        for (const version of Object.keys(versions)) {
            const currentVersionSynced = await existsInDatabase({ name, version })
            if (!currentVersionSynced) {
                const block: any = await getOrThrow({ name, version })
                const info = {
                    ...block,
                    blockType: block.pieceType,
                    blockName: block.pieceName,
                }
                await blockMetadataService(log).create({
                    blockMetadata: info,
                    packageType: info.packageType,
                    blockType: info.blockType,
                })
            }
        }
    }
    catch (error) {
        log.error(error, 'Error syncing block')
    }

}
async function existsInDatabase({ name, version }: { name: string, version: string }): Promise<boolean> {
    return repo().existsBy({
        name,
        version,
        blockType: BlockType.OFFICIAL,
        packageType: PackageType.REGISTRY,
    })
}

async function getVersions({ name }: { name: string }): Promise<ListVersionsResponse> {
    const queryParams = new URLSearchParams()
    queryParams.append('edition', system.getEdition())
    queryParams.append('release', await apVersionUtil.getCurrentRelease())
    queryParams.append('name', name)
    const url = `${CLOUD_API_URL}/versions?${queryParams.toString()}`
    const response = await fetch(url)
    return parseAndVerify<ListVersionsResponse>(ListVersionsResponse, (await response.json()))
}

async function getOrThrow({ name, version }: { name: string, version: string }): Promise<BlockMetadataModel> {
    const response = await fetch(
        `${CLOUD_API_URL}/${name}${version ? '?version=' + version : ''}`,
    )
    return response.json()
}

async function listBlocks(): Promise<BlockMetadataModelSummary[]> {
    const queryParams = new URLSearchParams()
    queryParams.append('edition', system.getEdition())
    queryParams.append('release', await apVersionUtil.getCurrentRelease())
    const url = `${CLOUD_API_URL}?${queryParams.toString()}`
    const response = await fetch(url)
    if (response.status === StatusCodes.GONE.valueOf()) {
        return []
    }
    if (response.status !== StatusCodes.OK.valueOf()) {
        throw new Error(await response.text())
    }
    return response.json()
}
