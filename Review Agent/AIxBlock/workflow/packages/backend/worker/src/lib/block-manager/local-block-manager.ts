import { FastifyBaseLogger } from 'fastify'
import { readFile, writeFile } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'
import { ApLock, fileBlocksUtils, memoryLock, packageManager } from 'workflow-server-shared'
import { assertEqual, assertNotNullOrUndefined, BlockPackage, PackageType } from 'workflow-shared'
import { cacheHandler } from '../utils/cache-handler'
import { workerMachine } from '../utils/machine'
import { PieceManager } from './block-manager'
import { PIECES_BUILDER_MUTEX_KEY } from './development/blocks-builder'

enum CacheState {
    READY = 'READY',
    PENDING = 'PENDING',
}

export class LocalPieceManager extends PieceManager {
    protected override async installDependencies(
        params: InstallParams,
    ): Promise<void> {

        let lock: ApLock | undefined
        try {
            lock = await memoryLock.acquire(PIECES_BUILDER_MUTEX_KEY)
            const { projectPath, pieces } = params
            const basePath = resolve(__dirname.split(`${sep}dist`)[0])
            const baseLinkPath = join(
                basePath,
                'dist',
                'packages',
                'blocks',
                'community',
            )
            const packages = workerMachine.getSettings().DEV_BLOCKS || []

            const frameworkPackages = {
                'workflow-blocks-common': `link:${baseLinkPath}/common`,
                'workflow-blocks-framework': `link:${baseLinkPath}/framework`,
                'workflow-shared': `link:${basePath}/dist/packages/shared`,
            }
            await linkPackages(projectPath, join(baseLinkPath, 'framework'), 'workflow-blocks-framework', frameworkPackages, params.log)
            await linkPackages(projectPath, join(baseLinkPath, 'common'), 'workflow-blocks-common', frameworkPackages, params.log)
            
            for (const piece of pieces) {
                assertEqual(piece.packageType, PackageType.REGISTRY, 'packageType', `Piece ${piece.blockName} is not of type REGISTRY`)
                const directoryPath = await fileBlocksUtils(packages, params.log).findDirectoryByPackageName(piece.blockName)
                assertNotNullOrUndefined(directoryPath, `directoryPath for ${piece.blockName} is null or undefined`)
                await linkPackages(projectPath, directoryPath, piece.blockName, frameworkPackages, params.log)
            }
        }
        finally {
            if (lock) {
                await lock.release()
            }
        }
    }
}

const linkPackages = async (
    projectPath: string,
    linkPath: string,
    packageName: string,
    packages: Record<string, string>,
    log: FastifyBaseLogger,
): Promise<void> => {
    const cache = cacheHandler(projectPath)
    if (await cache.cacheCheckState(packageName) === CacheState.READY) {
        return
    }
    await updatePackageJson(linkPath, packages)
    await packageManager(log).link({
        packageName,
        path: projectPath,
        linkPath,
    })
    await cache.setCache(packageName, CacheState.READY)
}

const updatePackageJson = async (
    directoryPath: string,
    frameworkPackages: Record<string, string>,
): Promise<void> => {
    const packageJsonForPiece = join(directoryPath, 'package.json')

    const packageJson = await readFile(packageJsonForPiece, 'utf-8').then(
        JSON.parse,
    )
    for (const [key, value] of Object.entries(frameworkPackages)) {
        if (
            packageJson.dependencies &&
            Object.keys(packageJson.dependencies).includes(key)
        ) {
            packageJson.dependencies[key] = value
        }
    }
    await writeFile(packageJsonForPiece, JSON.stringify(packageJson, null, 2))
}

type InstallParams = {
    projectPath: string
    pieces: BlockPackage[]
    log: FastifyBaseLogger
}
