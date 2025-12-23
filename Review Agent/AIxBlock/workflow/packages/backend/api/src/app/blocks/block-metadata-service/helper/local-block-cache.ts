import { Mutex } from 'async-mutex'
import dayjs from 'dayjs'
import { FastifyBaseLogger } from 'fastify'
import semVer from 'semver'
import { isNil } from 'workflow-shared'
import { repoFactory } from '../../../core/db/repo-factory'
import { BlockMetadataEntity, BlockMetadataSchema } from '../../block-metadata-entity'

let cache: BlockMetadataSchema[] = []

const repo = repoFactory(BlockMetadataEntity)
const lock: Mutex = new Mutex()

type State = {
    recentUpdate: string | undefined
    count: string
}

export const localBlockCache = (log: FastifyBaseLogger) => ({
    async getSortedByNameAscThenVersionDesc(): Promise<BlockMetadataSchema[]> {
        const updatedRequired = await requireUpdate()
        if (!updatedRequired) {
            return cache
        }
        log.info({ time: dayjs().toISOString(), file: 'localBlockCache' }, 'Syncing blocks')
        cache = await executeWithLock(async () => {
            const updatedRequiredSecondCheck = await requireUpdate()
            if (!updatedRequiredSecondCheck) {
                return cache
            }
            log.info('Syncing blocks from database')
            const result = await repo().find()
            return result.sort((a, b) => {
                if (a.name !== b.name) {
                    return a.name.localeCompare(b.name)
                }
                return semVer.rcompare(a.version, b.version)
            })
        })
        return cache
    },
})

async function requireUpdate(): Promise<boolean> {
    const newestState: State | undefined = await repo().createQueryBuilder().select('MAX(updated)', 'recentUpdate').addSelect('count(*)', 'count').getRawOne()
    if (isNil(newestState)) {
        return false
    }
    const newestInCache = cache.reduce((acc, block) => {
        return Math.max(dayjs(block.updated).unix(), acc)
    }, 0)
    return dayjs(newestState.recentUpdate).unix() !== newestInCache || Number(newestState.count) !== cache.length
}

const executeWithLock = async <T>(methodToExecute: () => Promise<T>): Promise<T> => {
    const releaseLock = await lock.acquire()

    try {
        return await methodToExecute()
    }
    finally {
        releaseLock()
    }
}