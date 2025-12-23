import semverMajor from 'semver/functions/major'
import semverMinor from 'semver/functions/minor'
import semverMinVersion from 'semver/ranges/min-version'
import { AIxBlockError, ErrorCode } from '../common/workflow-error'
import { BlockPackage, PackageType } from './block'

export const getPackageAliasForBlock = (params: GetPackageAliasForBlockParams): string => {
    const { blockName, pieceVersion } = params
    return `${blockName}-${pieceVersion}`
}

export const getPackageSpecForBlock = (packageArchivePath: string, params: BlockPackage): string => {
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

export const getPackageArchivePathForBlock = (params: GetPackageArchivePathForBlockParams): string => {
    return `${params.archivePath}/${params.archiveId}.tgz`
}

export const extractBlockFromModule = <T>(params: ExtractBlockFromModuleParams): T => {
    const { module, blockName, pieceVersion } = params
    const exports = Object.values(module)

    for (const e of exports) {
        if (e !== null && e !== undefined && e.constructor.name === 'Piece') {
            return e as T
        }
    }

    throw new AIxBlockError({
        code: ErrorCode.BLOCK_NOT_FOUND,
        params: {
            blockName,
            pieceVersion,
            message: 'Failed to extract block from module.',
        },
    })
}

export const getPieceMajorAndMinorVersion = (pieceVersion: string): string => {
    const minimumSemver = semverMinVersion(pieceVersion)
    return minimumSemver
        ? `${semverMajor(minimumSemver)}.${semverMinor(minimumSemver)}`
        : `${semverMajor(pieceVersion)}.${semverMinor(pieceVersion)}`
}

type GetPackageAliasForBlockParams = {
    blockName: string
    pieceVersion: string
}


type GetPackageArchivePathForBlockParams = {
    archiveId: string
    archivePath: string
}

type ExtractBlockFromModuleParams = {
    module: Record<string, unknown>
    blockName: string
    pieceVersion: string
}
