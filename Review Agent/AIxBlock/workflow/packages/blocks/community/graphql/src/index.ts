
import { createPiece, PieceAuth } from "workflow-blocks-framework";
import { BlockCategory } from "workflow-shared";
import { query } from "./lib/actions/query";
    
    export const graphql = createPiece({
      displayName: "GraphQL",
      auth: PieceAuth.None(),
      minimumSupportedRelease: '0.30.0',
      logoUrl: "https://cdn.activepieces.com/pieces/graphql.svg",
      categories:[BlockCategory.CORE],
      authors: ['mahmuthamet'],
      actions: [query],
      triggers: [],
    });
    