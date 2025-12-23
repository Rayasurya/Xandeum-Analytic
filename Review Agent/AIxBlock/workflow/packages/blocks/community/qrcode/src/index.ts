
    import { createPiece, PieceAuth } from "workflow-blocks-framework";
import { BlockCategory } from 'workflow-shared';
import { outputQrcodeAction } from './lib/actions/output-qrcode-action';
    
    export const qrcode = createPiece({
      displayName: 'QR Code',
      auth: PieceAuth.None(),
      minimumSupportedRelease: '0.30.0',
      logoUrl: "https://cdn.activepieces.com/pieces/qrcode.png",
      categories: [BlockCategory.CORE],
      authors: ['Meng-Yuan Huang'],
      actions: [
        outputQrcodeAction,
      ],
      triggers: [],
    });
    