import { FastifyBaseLogger } from 'fastify';
import {
    AIxBlockError,
    ApEdition,
    AuthenticationResponse,
    ErrorCode,
    isNil,
    Principal,
    PrincipalType,
    Project,
    User,
    UserIdentity,
    UserIdentityProvider,
    UserStatus
} from 'workflow-shared';
import { system } from '../helper/system/system';
import { platformService } from '../platform/platform.service';
import { projectService } from '../project/project-service';
import { userInvitationsService } from '../user-invitations/user-invitation.service';
import { userService } from '../user/user-service';
import { accessTokenManager } from './lib/access-token-manager';
import { userIdentityService } from './user-identity/user-identity-service';

export const authenticationUtils = {
    async assertUserIsInvitedToPlatformOrProject(
        log: FastifyBaseLogger,
        { email, platformId }: AssertUserIsInvitedToPlatformOrProjectParams
    ): Promise<void> {
        const isInvited = await userInvitationsService(log).hasAnyAcceptedInvitations({
            platformId,
            email,
        });
        if (!isInvited) {
            throw new AIxBlockError({
                code: ErrorCode.INVITATION_ONLY_SIGN_UP,
                params: {
                    message: `User ${email} is not invited to the platform`,
                },
            });
        }
    },

    async getProjectAndToken(params: GetProjectAndTokenParams): Promise<AuthenticationResponse> {
        const user = await userService.getOneOrFail({ id: params.userId });
        const projects = await projectService.getAllForUser({
            platformId: params.platformId,
            userId: params.userId,
        });
        const project = isNil(params.projectId) ? projects?.[0] : projects.find((project) => project.id === params.projectId);
        if (isNil(project)) {
            throw new AIxBlockError({
                code: ErrorCode.INVITATION_ONLY_SIGN_UP,
                params: {
                    message: 'No project found for user',
                },
            });
        }
        const identity = await userIdentityService(system.globalLogger()).getOneOrFail({ id: user.identityId });
        if (!identity.verified) {
            throw new AIxBlockError({
                code: ErrorCode.EMAIL_IS_NOT_VERIFIED,
                params: {
                    email: identity.email,
                },
            });
        }
        if (user.status === UserStatus.INACTIVE) {
            throw new AIxBlockError({
                code: ErrorCode.USER_IS_INACTIVE,
                params: {
                    email: identity.email,
                },
            });
        }
        const token = await accessTokenManager.generateToken({
            id: user.id,
            type: PrincipalType.USER,
            projectId: project.id,
            platform: {
                id: params.platformId,
            },
            tokenVersion: identity.tokenVersion,
        });
        return {
            ...user,
            firstName: identity.firstName,
            lastName: identity.lastName,
            email: identity.email,
            trackEvents: identity.trackEvents,
            newsLetter: identity.newsLetter,
            verified: identity.verified,
            token,
            projectId: project.id,
        };
    },

    async assertDomainIsAllowed({ email, platformId }: AssertDomainIsAllowedParams): Promise<void> {
        const edition = system.getEdition();
        if (edition === ApEdition.COMMUNITY) {
            return;
        }
        const platform = await platformService.getOneOrThrow(platformId);
        if (!platform.ssoEnabled) {
            return;
        }
        const emailDomain = email.split('@')[1];
        const isAllowedDomaiin = !platform.enforceAllowedAuthDomains || platform.allowedAuthDomains.includes(emailDomain);

        if (!isAllowedDomaiin) {
            throw new AIxBlockError({
                code: ErrorCode.DOMAIN_NOT_ALLOWED,
                params: {
                    domain: emailDomain,
                },
            });
        }
    },

    async assertEmailAuthIsEnabled({ platformId, provider }: AssertEmailAuthIsEnabledParams): Promise<void> {
        const edition = system.getEdition();
        if (edition === ApEdition.COMMUNITY) {
            return;
        }
        const platform = await platformService.getOneOrThrow(platformId);
        if (!platform.ssoEnabled) {
            return;
        }
        if (provider !== UserIdentityProvider.EMAIL) {
            return;
        }
        if (!platform.emailAuthEnabled) {
            throw new AIxBlockError({
                code: ErrorCode.EMAIL_AUTH_DISABLED,
                params: {},
            });
        }
    },

    async extractUserIdFromPrincipal(principal: Principal): Promise<string> {
        if (principal.type === PrincipalType.USER) {
            return principal.id;
        }
        // TODO currently it's same as api service, but it's better to get it from api key service, in case we introduced more admin users
        const project = await projectService.getOneOrThrow(principal.projectId);
        return project.ownerId;
    },
};

type SendTelemetryParams = {
    identity: UserIdentity;
    user: User;
    project: Project;
    log: FastifyBaseLogger;
};

type AssertDomainIsAllowedParams = {
    email: string;
    platformId: string;
};

type AssertEmailAuthIsEnabledParams = {
    platformId: string;
    provider: UserIdentityProvider;
};

type AssertUserIsInvitedToPlatformOrProjectParams = {
    email: string;
    platformId: string;
};

type GetProjectAndTokenParams = {
    userId: string;
    platformId: string;
    projectId: string | null;
};
