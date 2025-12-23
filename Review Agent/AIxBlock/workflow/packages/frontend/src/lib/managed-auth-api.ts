import { api } from '@/lib/api';
import { ManagedAuthnRequestBody } from 'workflow-axb-shared';
import { AuthenticationResponse } from 'workflow-shared';

export const managedAuthApi = {
  generateApToken: async (request: ManagedAuthnRequestBody) => {
    return api.post<AuthenticationResponse>(
      `/v1/managed-authn/external-token`,
      request,
    );
  },
};
