import { FastifyBaseLogger } from 'fastify'
import { writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileExists, memoryLock, PackageInfo, packageManager, threadSafeMkdir } from 'workflow-server-shared'
import {
    BlockPackage,
    getPackageArchivePathForBlock,
    PackageType,
    PrivateBlockPackage
} from 'workflow-shared'
import { cacheHandler } from '../utils/cache-handler'
import { PACKAGE_ARCHIVE_PATH, PieceManager } from './block-manager'

enum CacheState {
    READY = 'READY',
    PENDING = 'PENDING',
}

export class RegistryPieceManager extends PieceManager {
    protected override async installDependencies({
        projectPath,
        pieces,
        log,
    }: InstallParams): Promise<void> {
        await this.savePackageArchivesToDiskIfNotCached(pieces)

        const dependenciesToInstall = await this.filterExistingPieces(projectPath, pieces)
        if (dependenciesToInstall.length === 0) {
            return
        }
        const pnpmAddLock = await memoryLock.acquire(`pnpm-add-${projectPath}`)

        const cache = cacheHandler(projectPath)

        try {
            const dependencies = await this.filterExistingPieces(projectPath, pieces)
            if (dependencies.length === 0) {
                return
            }
            await packageManager(log).add({ path: projectPath, dependencies })

            await Promise.all(
                dependencies.map(pkg => cache.setCache(pkg.alias, CacheState.READY)),
            )
        }
        finally {
            await pnpmAddLock.release()
        }
    }

    private async savePackageArchivesToDiskIfNotCached(
        pieces: BlockPackage[],
    ): Promise<void> {
        const packages = await this.getUncachedArchivePackages(pieces)
        const saveToDiskJobs = packages.map((piece) =>
            this.getArchiveAndSaveToDisk(piece),
        )
        await Promise.all(saveToDiskJobs)
    }

    private async getUncachedArchivePackages(
        pieces: BlockPackage[],
    ): Promise<PrivateBlockPackage[]> {
        const packages: PrivateBlockPackage[] = []

        for (const piece of pieces) {
            if (piece.packageType !== PackageType.ARCHIVE) {
                continue
            }

            const archivePath = getPackageArchivePathForBlock({
                archiveId: piece.archiveId,
                archivePath: PACKAGE_ARCHIVE_PATH,
            })

            if (await fileExists(archivePath)) {
                continue
            }

            packages.push(piece)
        }

        return packages
    }

    private async getArchiveAndSaveToDisk(
        piece: PrivateBlockPackage,
    ): Promise<void> {
        const archiveId = piece.archiveId

        const archivePath = getPackageArchivePathForBlock({
            archiveId,
            archivePath: PACKAGE_ARCHIVE_PATH,
        })

        await threadSafeMkdir(dirname(archivePath))

        await writeFile(archivePath, piece.archive as Buffer)
    }

    private async filterExistingPieces(projectPath: string, pieces: BlockPackage[]): Promise<PackageInfo[]> {
        const cache = cacheHandler(projectPath)
        const enrichedDependencies = await Promise.all(
            pieces.map(async (piece) => {
                const pkg = this.pieceToDependency(piece)
                const fState = await cache.cacheCheckState(pkg.alias)
                return { pkg, fExists: fState === CacheState.READY }
            }),
        )
        return enrichedDependencies.filter(({ fExists }) => !fExists).map(({ pkg }) => pkg)
    }
}

type InstallParams = {
    projectPath: string
    pieces: BlockPackage[]
    log: FastifyBaseLogger
}
