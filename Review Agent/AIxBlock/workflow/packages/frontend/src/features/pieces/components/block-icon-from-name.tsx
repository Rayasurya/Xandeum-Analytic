import { piecesHooks } from '../lib/blocks-hook';

import { PieceIcon } from './block-icon';

type PieceIconWithPieceNameProps = {
  blockName: string;
};

const BlockIconWithBlockName = ({ blockName }: PieceIconWithPieceNameProps) => {
  const { pieceModel } = piecesHooks.usePiece({
    name: blockName,
  });

  return (
    <PieceIcon
      circle={true}
      size={'md'}
      border={true}
      displayName={pieceModel?.displayName}
      logoUrl={pieceModel?.logoUrl}
      showTooltip={true}
    />
  );
};

export default BlockIconWithBlockName;
