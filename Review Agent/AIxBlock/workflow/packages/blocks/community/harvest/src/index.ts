
    import { createCustomApiCallAction } from 'workflow-blocks-common';
import { createPiece, OAuth2PropertyValue, PieceAuth } from "workflow-blocks-framework";
import { OAuth2GrantType, BlockCategory } from 'workflow-shared';
import { getClients } from './lib/actions/get-clients';
import { getEstimates } from './lib/actions/get-estimates';
import { getExpenses } from './lib/actions/get-expenses';
import { getInvoices } from './lib/actions/get-invoices';
import { getProjects } from './lib/actions/get-projects';
import { getRoles } from './lib/actions/get-roles';
import { getTasks } from './lib/actions/get-tasks';
import { getTime_entries } from './lib/actions/get-time_entries';
import { getUsers } from './lib/actions/get-users';
import { reportsUninvoiced } from './lib/actions/reports-uninvoiced';

    export const harvestAuth = PieceAuth.OAuth2({
      required: true,
      grantType: OAuth2GrantType.AUTHORIZATION_CODE,
      authUrl: 'https://id.getharvest.com/oauth2/authorize',
      tokenUrl: `https://id.getharvest.com/api/v2/oauth2/token`,
      scope: ['harvest:all'],
    });

    export const harvest = createPiece({
      displayName: "Harvest",
      auth: harvestAuth,
      minimumSupportedRelease: '0.36.1',
      logoUrl: "https://cdn.activepieces.com/pieces/harvest.png",
      categories:[BlockCategory.PRODUCTIVITY],
      description:'Time Tracking Software with Invoicing',
      authors: ["D-Rowe-FS"],
      actions: [getClients, getEstimates, getExpenses, getInvoices, getProjects, getRoles, getTasks, getTime_entries, getUsers,
         reportsUninvoiced,
         createCustomApiCallAction({
          baseUrl: () => `https://api.harvestapp.com/v2/`,
          auth: harvestAuth,
          authMapping: async (auth) => ({
            Authorization: `Bearer ${(auth as OAuth2PropertyValue).access_token}`,
          }),
            }),
      ],
      triggers: [],
    });
    