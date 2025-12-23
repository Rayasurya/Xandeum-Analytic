import { FastifyBaseLogger } from 'fastify'
import { BlocksSource, threadSafeMkdir } from 'workflow-server-shared'
import { BlockPackage, BlockType } from 'workflow-shared'
import { pieceManager } from '../block-manager'
import { codeBuilder } from '../utils/code-builder'
import { engineInstaller } from '../utils/engine-installer'
import { workerMachine } from '../utils/machine'
import { CodeArtifact } from './engine-runner'

export const executionFiles = (log: FastifyBaseLogger) => ({
    async provision({
        pieces,
        globalCachePath,
        codeSteps,
        globalCodesPath,
        customPiecesPath,
    }: ProvisionParams): Promise<void> {
        const startTime = performance.now()

        const source = workerMachine.getSettings().BLOCKS_SOURCE as BlocksSource
        await threadSafeMkdir(globalCachePath)

        const startTimeCode = performance.now()
        const buildJobs = codeSteps.map(async (artifact) => {
            return codeBuilder(log).processCodeStep({
                artifact,
                codesFolderPath: globalCodesPath,
                log,
            })
        })
        await Promise.all(buildJobs)
        log.info({
            path: globalCachePath,
            timeTaken: `${Math.floor(performance.now() - startTimeCode)}ms`,
        }, 'Installed code in sandbox')

        const startTimeEngine = performance.now()
        await engineInstaller(log).install({
            path: globalCachePath,
        })
        log.info({
            path: globalCachePath,
            timeTaken: `${Math.floor(performance.now() - startTimeEngine)}ms`,
        }, 'Installed engine in sandbox')

        const officialPieces = pieces.filter(f => f.blockType === BlockType.OFFICIAL)
        if (officialPieces.length > 0) {
            const startTime = performance.now()
            await pieceManager(source).install({
                projectPath: globalCachePath,
                pieces: officialPieces,
                log,
            })
            log.info({
                pieces: officialPieces.map(p => `${p.blockName}@${p.pieceVersion}`),
                globalCachePath,
                timeTaken: `${Math.floor(performance.now() - startTime)}ms`,
            }, 'Installed official pieces in sandbox')
        }

        const customPieces = pieces.filter(f => f.blockType === BlockType.CUSTOM)
        if (customPieces.length > 0) {
            const startTime = performance.now()
            await threadSafeMkdir(customPiecesPath)
            await pieceManager(source).install({
                projectPath: customPiecesPath,
                pieces: customPieces,
                log,
            })
            log.info({
                customPieces: customPieces.map(p => `${p.blockName}@${p.pieceVersion}`),
                customPiecesPath,
                timeTaken: `${Math.floor(performance.now() - startTime)}ms`,
            }, 'Installed custom pieces in sandbox')
        }

        log.info({
            timeTaken: `${Math.floor(performance.now() - startTime)}ms`,
        }, 'Sandbox installation complete')

    },
})

type ProvisionParams = {
    pieces: BlockPackage[]
    codeSteps: CodeArtifact[]
    globalCachePath: string
    globalCodesPath: string
    customPiecesPath: string
}
