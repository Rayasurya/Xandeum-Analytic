import importFresh from '@activepieces/import-fresh-webpack'
import clearModule from 'clear-module'
import { FastifyBaseLogger } from 'fastify'
import { readdir, readFile, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { cwd } from 'node:process'
import { sep } from 'path'
import { BlockMetadata, Piece } from 'workflow-blocks-framework'
import { extractBlockFromModule } from 'workflow-shared'
import { exceptionHandler } from '../exception-handler'
import { ApLock, memoryLock } from '../memory-lock'

const blockCache: Record<string, BlockMetadata | null> = {}

export const fileBlocksUtils = (packages: string[], log: FastifyBaseLogger) => {
    async function findAllBlocksFolder(folderPath: string): Promise<string[]> {
        const paths = []
        const files = await readdir(folderPath)

        for (const file of files) {
            const filePath = join(folderPath, file)
            const fileStats = await stat(filePath)
            if (
                fileStats.isDirectory() &&
                file !== 'node_modules' &&
                file !== 'dist' &&
                file !== 'framework' &&
                file !== 'common'
            ) {
                paths.push(...(await findAllBlocksFolder(filePath)))
            }
            else if (file === 'package.json') {
                paths.push(folderPath)
            }
        }
        return paths
    }

    async function getPackageNameFromFolderPath(folderPath: string): Promise<string> {
        const packageJson = await readFile(join(folderPath, 'package.json'), 'utf-8').then(JSON.parse)
        return packageJson.name
    }

    async function findDirectoryByPackageName(packageName: string): Promise<string | null> {
        const paths = await findAllBlocksFolder(resolve(cwd(), 'dist', 'packages', 'blocks'))
        for (const path of paths) {
            try {
                const packageJsonName = await getPackageNameFromFolderPath(path)
                if (packageJsonName === packageName) {
                    return path
                }
            }
            catch (e) {
                log.error({
                    name: 'findDirectoryByPackageName',
                    message: JSON.stringify(e),
                }, 'Error finding directory by package name')
            }
        }
        return null
    }

    async function findAllBlocksDirectoryInSource(): Promise<string[]> {
        const blocksPath = resolve(cwd(), 'packages', 'blocks')
        const paths = await findAllBlocksFolder(blocksPath)
        return paths
    }

    async function findBlockDirectoryByFolderName(blockName: string): Promise<string | null> {
        const blocksPath = await findAllBlocksDirectoryInSource()
        const blockPath = blocksPath.find((p) => p.endsWith(sep + blockName))
        return blockPath ?? null
    }

    async function findAllBlocks(): Promise<BlockMetadata[]> {
        const blocks = await loadBlocksFromFolder(resolve(cwd(), 'dist', 'packages', 'blocks'))
        return blocks
    }

    async function loadBlocksFromFolder(folderPath: string): Promise<BlockMetadata[]> {
        try {
            const paths = (await findAllBlocksFolder(folderPath)).filter(p => packages.some(packageName => p.includes(packageName)))
            const blocks = await Promise.all(paths.map((p) => loadBlockFromFolder(p)))
            return blocks.filter((p): p is BlockMetadata => p !== null)
        }
        catch (e) {
            const err = e as Error
            log.warn({ name: 'FileBlockMetadataService#loadBlocksFromFolder', message: err.message, stack: err.stack })
            return []
        }
    }

    async function loadBlockFromFolder(
        folderPath: string,
    ): Promise<BlockMetadata | null> {
        let lock: ApLock | undefined
        try {
            if (folderPath in blockCache && blockCache[folderPath]) {
                return blockCache[folderPath]
            }

            const lockKey = `block_cache_${folderPath}`
            lock = await memoryLock.acquire(lockKey)
            if (folderPath in blockCache && blockCache[folderPath]) {
                return blockCache[folderPath]
            }

            const indexPath = join(folderPath, 'src', 'index')
            clearModule(indexPath)
            const packageJson = importFresh<Record<string, string>>(
                join(folderPath, 'package.json'),
            )
            const module = importFresh<Record<string, unknown>>(
                indexPath,
            )

            const { name: blockName, version: blockVersion } = packageJson
            const block = extractBlockFromModule<Piece>({
                module,
                blockName: blockName,
                pieceVersion: blockVersion,
            })
            const metadata = {
                ...block.metadata(),
                name: blockName,
                version: blockVersion,
                authors: block.authors,
                directoryPath: folderPath,
            }

            blockCache[folderPath] = metadata

        }
        catch (ex) {
            blockCache[folderPath] = null
            exceptionHandler.handle(ex, log)
        }
        finally {
            if (lock) {
                await lock.release()
            }
        }
        return null
    }

    async function clearBlockCache(packageName: string): Promise<void> {
        const directoryPath = await findDirectoryByPackageName(packageName)
        if (directoryPath && directoryPath in blockCache) {
            blockCache[directoryPath] = null
        }
    }

    return {
        findAllBlocksFolder,
        findDirectoryByPackageName,
        findBlockDirectoryByFolderName,
        findAllBlocks,
        clearBlockCache,
        getPackageNameFromFolderPath,
    }
}
