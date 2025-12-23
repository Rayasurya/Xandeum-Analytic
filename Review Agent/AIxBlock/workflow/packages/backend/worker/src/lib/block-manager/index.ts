import { BlocksSource } from 'workflow-server-shared'
import { PieceManager } from './block-manager'
import { LocalPieceManager } from './local-block-manager'
import { RegistryPieceManager } from './registry-block-manager'

const pieceManagerVariant: Record<BlocksSource, new () => PieceManager> = {
    [BlocksSource.FILE]: LocalPieceManager,
    [BlocksSource.CLOUD_AND_DB]: RegistryPieceManager,
    [BlocksSource.DB]: RegistryPieceManager,
}


const getPieceManager = (source: BlocksSource): PieceManager => {
    return new pieceManagerVariant[source]()
}

export const pieceManager = (source: BlocksSource) => getPieceManager(source)
