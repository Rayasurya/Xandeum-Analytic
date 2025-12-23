import { FastifyBaseLogger } from 'fastify'
import { resolve } from 'node:path'
import { enrichErrorContext, PackageInfo, packageManager, systemConstants } from 'workflow-server-shared'
import {
    BlockPackage,
    getPackageAliasForBlock,
    getPackageArchivePathForBlock,
    isEmpty,
    PackageType
} from 'workflow-shared'

export const PACKAGE_ARCHIVE_PATH = resolve(systemConstants.PACKAGE_ARCHIVE_PATH)

export abstract class PieceManager {
    async install({ projectPath, pieces, log }: InstallParams): Promise<void> {
        try {
            if (isEmpty(pieces)) {
                return
            }

            await packageManager(log).init({
                path: projectPath,
            })

            const uniquePieces = this.removeDuplicatedPieces(pieces)

            await this.installDependencies({
                projectPath,
                pieces: uniquePieces,
                log,
            })
        }
        catch (error) {
            const contextKey = '[PieceManager#install]'
            const contextValue = { projectPath, pieces }

            const enrichedError = enrichErrorContext({
                error,
                key: contextKey,
                value: contextValue,
            })

            throw enrichedError
        }
    }

    protected abstract installDependencies(params: InstallParams): Promise<void>

    protected pieceToDependency(piece: BlockPackage): PackageInfo {
        const packageAlias = getPackageAliasForBlock(piece)

        const packageSpec = getPackageSpecForPiece(PACKAGE_ARCHIVE_PATH, piece)
        return {
            alias: packageAlias,
            spec: packageSpec,
        }
    }

    private removeDuplicatedPieces(pieces: BlockPackage[]): BlockPackage[] {
        return pieces.filter(
            (piece, index, self) =>
                index ===
                self.findIndex(
                    (p) =>
                        p.blockName === piece.blockName &&
                        p.pieceVersion === piece.pieceVersion,
                ),
        )
    }
}

type InstallParams = {
    projectPath: string
    pieces: BlockPackage[]
    log: FastifyBaseLogger
}

const getPackageSpecForPiece = (
    packageArchivePath: string,
    params: BlockPackage,
): string => {
    const { packageType, blockName, pieceVersion } = params

    switch (packageType) {
        case PackageType.REGISTRY: {
            return `npm:${blockName}@${pieceVersion}`
        }

        case PackageType.ARCHIVE: {
            const archivePath = getPackageArchivePathForBlock({
                archiveId: params.archiveId,
                archivePath: packageArchivePath,
            })

            return `file:${archivePath}`
        }
    }
}
