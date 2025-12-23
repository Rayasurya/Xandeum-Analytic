
    import { createPiece, PieceAuth } from "workflow-blocks-framework";

    export const zalo = createPiece({
      displayName: "Zalo",
      auth: PieceAuth.None(),
      minimumSupportedRelease: '0.36.1',
      logoUrl: "https://cdn.activepieces.com/pieces/zalo.png",
      authors: [],
      actions: [],
      triggers: [],
    });
    