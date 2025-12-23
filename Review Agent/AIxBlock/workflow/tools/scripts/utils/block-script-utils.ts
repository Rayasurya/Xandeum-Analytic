
import { StatusCodes } from 'http-status-codes'
import { readdir, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { cwd } from 'node:process'
import * as semver from 'semver'
import { BlockMetadata } from '../../../packages/blocks/community/framework/src'
import { extractBlockFromModule } from '../../../packages/shared/src'
import { readPackageJson } from './files'
type Piece = {
    name: string;
    displayName: string;
    version: string;
    minimumSupportedRelease?: string;
    maximumSupportedRelease?: string;
    metadata(): Omit<BlockMetadata, 'name' | 'version'>;
};

export const AP_CLOUD_API_BASE = 'https://cloud.activepieces.com/api/v1';
export const PIECES_FOLDER = 'packages/blocks'
export const COMMUNITY_PIECE_FOLDER = 'packages/blocks/community'
export const NON_PIECES_PACKAGES = ['workflow-blocks-framework', 'workflow-blocks-common']

const validateSupportedRelease = (minRelease: string | undefined, maxRelease: string | undefined) => {
    if (minRelease !== undefined && !semver.valid(minRelease)) {
        throw Error(`[validateSupportedRelease] "minimumSupportedRelease" should be a valid semver version`)
    }

    if (maxRelease !== undefined && !semver.valid(maxRelease)) {
        throw Error(`[validateSupportedRelease] "maximumSupportedRelease" should be a valid semver version`)
    }

    if (minRelease !== undefined && maxRelease !== undefined && semver.gt(minRelease, maxRelease)) {
        throw Error(`[validateSupportedRelease] "minimumSupportedRelease" should be less than "maximumSupportedRelease"`)
    }
}

const validateMetadata = (pieceMetadata: BlockMetadata): void => {
    console.info(`[validateMetadata] blockName=${pieceMetadata.name}`)
    validateSupportedRelease(
        pieceMetadata.minimumSupportedRelease,
        pieceMetadata.maximumSupportedRelease,
    )
}


const byDisplayNameIgnoreCase = (a: BlockMetadata, b: BlockMetadata) => {
    const aName = a.displayName.toUpperCase();
    const bName = b.displayName.toUpperCase();
    return aName.localeCompare(bName, 'en');
};

export function getCommunityPieceFolder(blockName: string): string {
    return join(COMMUNITY_PIECE_FOLDER, blockName)
}


export async function findAllPiecesDirectoryInSource(): Promise<string[]> {
    const piecesPath = resolve(cwd(), 'packages', 'blocks')
    const paths = await traverseFolder(piecesPath)
    const enterprisePiecesPath = resolve(cwd(), 'packages', 'ee', 'pieces')
    const enterprisePiecesPaths = await traverseFolder(enterprisePiecesPath)
    return [...paths, ...enterprisePiecesPaths]
}

export const pieceMetadataExists = async (
    blockName: string,
    pieceVersion: string
): Promise<boolean> => {
    const cloudResponse = await fetch(
        `${AP_CLOUD_API_BASE}/pieces/${blockName}?version=${pieceVersion}`
    );

    const pieceExist: Record<number, boolean> = {
        [StatusCodes.OK]: true,
        [StatusCodes.NOT_FOUND]: false
    };

    if (
        pieceExist[cloudResponse.status] === null ||
        pieceExist[cloudResponse.status] === undefined
    ) {
        throw new Error(await cloudResponse.text());
    }

    return pieceExist[cloudResponse.status];
};

export async function findNewPieces(): Promise<BlockMetadata[]> {
    const paths = await findAllDistPaths()
    const changedPieces = (await Promise.all(paths.map(async (folderPath) => {
        const packageJson = await readPackageJson(folderPath);
        if (NON_PIECES_PACKAGES.includes(packageJson.name)) {
            return null;
        }
        const exists = await pieceMetadataExists(packageJson.name, packageJson.version)
        if (!exists) {
            try {
                return loadPieceFromFolder(folderPath);
            } catch (ex) {
                return null;
            }
        }
        return null;
    }))).filter((piece): piece is BlockMetadata => piece !== null)
    return changedPieces;
}

export async function findAllPieces(): Promise<BlockMetadata[]> {
    const paths = await findAllDistPaths()
    const pieces = await Promise.all(paths.map((p) => loadPieceFromFolder(p)))
    return pieces.filter((p): p is BlockMetadata => p !== null).sort(byDisplayNameIgnoreCase)
}

async function findAllDistPaths(): Promise<string[]> {
    const baseDir = resolve(cwd(), 'dist', 'packages')
    const standardPiecesPath = resolve(baseDir, 'blocks')
    const enterprisePiecesPath = resolve(baseDir, 'ee', 'pieces')
    const paths = [
        ...await traverseFolder(standardPiecesPath),
        ...await traverseFolder(enterprisePiecesPath)
    ]
    return paths
}

async function traverseFolder(folderPath: string): Promise<string[]> {
    const paths: string[] = []
    const directoryExists = await stat(folderPath).catch(() => null)

    if (directoryExists && directoryExists.isDirectory()) {
        const files = await readdir(folderPath)

        for (const file of files) {
            const filePath = join(folderPath, file)
            const fileStats = await stat(filePath)
            if (fileStats.isDirectory() && file !== 'node_modules' && file !== 'dist') {
                paths.push(...await traverseFolder(filePath))
            }
            else if (file === 'package.json') {
                paths.push(folderPath)
            }
        }
    }
    return paths
}

async function loadPieceFromFolder(folderPath: string): Promise<BlockMetadata | null> {
    try {
        const packageJson = await readPackageJson(folderPath);

        const module = await import(
            join(folderPath, 'src', 'index')
        )

        const { name: blockName, version: pieceVersion } = packageJson
        const piece = extractBlockFromModule<Piece>({
            module,
            blockName,
            pieceVersion
        });

        const metadata = {
            ...piece.metadata(),
            name: packageJson.name,
            version: packageJson.version
        };
        metadata.directoryPath = folderPath;
        metadata.name = packageJson.name;
        metadata.version = packageJson.version;
        metadata.minimumSupportedRelease = piece.minimumSupportedRelease ?? '0.0.0';
        metadata.maximumSupportedRelease =
            piece.maximumSupportedRelease ?? '99999.99999.9999';


        validateMetadata(metadata);
        return metadata;
    }
    catch (ex) {
        console.error(ex)
    }
    return null
}

