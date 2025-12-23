import dayjs from 'dayjs'
import { FastifyBaseLogger } from 'fastify'
import { Equal, FindOperator, FindOptionsWhere, ILike, In } from 'typeorm'
import {
    AIxBlockError,
    ApEdition,
    ApEnvironment,
    apId,
    AppConnection,
    AppConnectionId,
    AppConnectionOwners,
    AppConnectionScope,
    AppConnectionStatus,
    AppConnectionType,
    AppConnectionValue,
    AppConnectionWithoutSensitiveData,
    ConnectionState,
    Cursor,
    EngineResponseStatus,
    ErrorCode,
    isNil,
    McpBlockStatus,
    Metadata,
    OAuth2GrantType,
    OffsetPaginationParams,
    PlatformId,
    PlatformRole,
    ProjectId,
    SeekPage,
    spreadIfDefined,
    UpsertAppConnectionRequestBody,
} from 'workflow-shared'
import { exceptionHandler } from '../../../../../shared/src/lib/exception-handler'
import { UserInteractionJobType } from '../../../../../shared/src/lib/job/job-data'
import { AppSystemProp } from '../../../../../shared/src/lib/system-props'
import { EngineHelperResponse, EngineHelperValidateAuthResult } from '../../../../../worker/src/lib/engine/engine-runner'
import {
    blockMetadataService,
    getBlockPackageWithoutArchive,
} from '../../blocks/block-metadata-service'
import { repoFactory } from '../../core/db/repo-factory'
import { APArrayContains } from '../../database/database-connection'
import { projectMemberService } from '../../ee/project-members/project-member.service'
import { encryptUtils } from '../../helper/encryption'
import { distributedLock } from '../../helper/lock'
import { buildOffsetPaginator } from '../../helper/pagination/build-offset-paginator'
import { buildPaginator } from '../../helper/pagination/build-paginator'
import { paginationHelper } from '../../helper/pagination/pagination-utils'
import { system } from '../../helper/system/system'
import { mcpBlockService } from '../../mcp/mcp-block-service'
import { mcpService } from '../../mcp/mcp-service'
import { projectRepo } from '../../project/project-service'
import { userService } from '../../user/user-service'
import { userInteractionWatcher } from '../../workers/user-interaction-watcher'
import {
    AppConnectionEntity,
    AppConnectionSchema,
} from '../app-connection.entity'
import { oauth2Handler } from './oauth2'
import { oauth2Util } from './oauth2/oauth2-util'

export const appConnectionsRepo = repoFactory(AppConnectionEntity)

export const appConnectionService = (log: FastifyBaseLogger) => ({
    async upsert(params: UpsertParams): Promise<AppConnectionWithoutSensitiveData> {
        const { projectIds, externalId, value, displayName, blockName, ownerId, platformId, scope, type, status, metadata } = params

        await assertProjectIds(projectIds, platformId)
        const validatedConnectionValue = await validateConnectionValue({
            value,
            blockName,
            projectId: projectIds?.[0],
            platformId,
        }, log)

        const encryptedConnectionValue = encryptUtils.encryptObject({
            ...validatedConnectionValue,
            ...value,
        })

        const existingConnection = await appConnectionsRepo().findOneBy({
            externalId,
            scope,
            platformId,
            ...(projectIds ? APArrayContains('projectIds', projectIds)  : {}),
        })

        const newId = existingConnection?.id ?? apId()
        const connection = {
            displayName,
            ...spreadIfDefined('ownerId', ownerId),
            status: status ?? AppConnectionStatus.ACTIVE,
            value: encryptedConnectionValue,
            externalId,
            blockName,
            type,
            id: newId,
            scope,
            projectIds,
            platformId,
            ...spreadIfDefined('metadata', metadata),
        }

        await appConnectionsRepo().upsert(connection, ['id'])

        const updatedConnection = await appConnectionsRepo().findOneByOrFail({
            id: newId,
            platformId,
            ...(projectIds ? APArrayContains('projectIds', projectIds)  : {}),
            scope,
        })
        return this.removeSensitiveData(updatedConnection)
    },
    async update(params: UpdateParams): Promise<AppConnectionWithoutSensitiveData> {
        const { projectIds, id, request, scope, platformId } = params

        if (!isNil(request.projectIds)) {
            await assertProjectIds(request.projectIds, platformId)
        }

        const filter: FindOptionsWhere<AppConnectionSchema> = {
            id,
            scope,
            platformId,
            ...(projectIds ? APArrayContains('projectIds', projectIds)  : {}),
        }

        await appConnectionsRepo().update(filter, {
            displayName: request.displayName,
            ...spreadIfDefined('projectIds', request.projectIds),
            ...spreadIfDefined('metadata', request.metadata),
        })

        const updatedConnection = await appConnectionsRepo().findOneByOrFail(filter)
        return this.removeSensitiveData(updatedConnection)
    },
    async getOne({
        projectId,
        platformId,
        externalId,
    }: GetOneByName): Promise<AppConnection | null> {
        const encryptedAppConnection = await appConnectionsRepo().findOne({
            where: {
                ...APArrayContains('projectIds', [projectId]),
                externalId,
                platformId,
            },
        })

        if (isNil(encryptedAppConnection)) {
            return null
        }
        const connection = await this.decryptAndRefreshConnection(encryptedAppConnection, projectId, log)

        if (isNil(connection)) {
            return null
        }

        const owner = isNil(connection.ownerId) ? null : await userService.getMetaInformation({
            id: connection.ownerId,
        })
        return {
            ...connection,
            owner,
        }
    },

    async getOneOrThrowWithoutValue(params: GetOneParams): Promise<AppConnectionWithoutSensitiveData> {
        const connectionById = await appConnectionsRepo().findOneBy({
            id: params.id,
            platformId: params.platformId,
            ...(params.projectId ? APArrayContains('projectIds', [params.projectId]) : {}),
        })
        if (isNil(connectionById)) {
            throw new AIxBlockError({
                code: ErrorCode.ENTITY_NOT_FOUND,
                params: {
                    entityType: 'AppConnection',
                    entityId: params.id,
                },
            })
        }
        return this.removeSensitiveData(connectionById)
    },

    async getManyConnectionStates(params: GetManyParams): Promise<ConnectionState[]> {
        const connections = await appConnectionsRepo().find({
            where: {
                ...APArrayContains('projectIds', [params.projectId]),
            },
        })
        return connections.map((connection) => ({
            externalId: connection.externalId,
            blockName: connection.blockName,
            displayName: connection.displayName,
        }))
    },

    async delete(params: DeleteParams): Promise<void> {
        await appConnectionsRepo().delete({
            id: params.id,
            platformId: params.platformId,
            scope: params.scope,
            ...(params.projectId ? APArrayContains('projectIds', [params.projectId]) : {}),
        })
    },

    async list({
        projectId,
        blockName,
        cursorRequest,
        displayName,
        status,
        limit,
        scope,
        platformId,
    }: ListParams): Promise<SeekPage<AppConnection>> {
        const decodedCursor = paginationHelper.decodeCursor(cursorRequest)

        const paginator = buildPaginator({
            entity: AppConnectionEntity,
            query: {
                limit,
                order: 'ASC',
                afterCursor: decodedCursor.nextCursor,
                beforeCursor: decodedCursor.previousCursor,
            },
        })

        const querySelector: Record<string, string | FindOperator<string>> = {
            ...(projectId ? APArrayContains('projectIds', [projectId]) : {}),
            ...spreadIfDefined('scope', scope),
            platformId,
        }
        if (!isNil(blockName)) {
            querySelector.blockName = Equal(blockName)
        }
        if (!isNil(displayName)) {
            querySelector.displayName = ILike(`%${displayName}%`)
        }
        if (!isNil(status)) {
            querySelector.status = In(status)
        }
        const queryBuilder = appConnectionsRepo()
            .createQueryBuilder('app_connection')
            .where(querySelector)
        const { data, cursor } = await paginator.paginate(queryBuilder)



        const promises = data.map(async (encryptedConnection) => {
            const apConnection: AppConnection = decryptConnection(encryptedConnection)
            const owner = isNil(apConnection.ownerId) ? null : await userService.getMetaInformation({
                id: apConnection.ownerId,
            })
            return {
                ...apConnection,
                owner,
            }
        })
        const refreshConnections = await Promise.all(promises)

        return paginationHelper.createPage<AppConnection>(
            refreshConnections,
            cursor,
        )
    },
    removeSensitiveData: (
        appConnection: AppConnection | AppConnectionSchema,
    ): AppConnectionWithoutSensitiveData => {
        const { value: _, ...appConnectionWithoutSensitiveData } = appConnection
        return appConnectionWithoutSensitiveData as AppConnectionWithoutSensitiveData
    },

    async decryptAndRefreshConnection(
        encryptedAppConnection: AppConnectionSchema,
        projectId: ProjectId,
        log: FastifyBaseLogger,
    ): Promise<AppConnection | null> {
        const appConnection = decryptConnection(encryptedAppConnection)
        if (!needRefresh(appConnection, log)) {
            return oauth2Util(log).removeRefreshTokenAndClientSecret(appConnection)
        }

        const refreshedConnection = await lockAndRefreshConnection({ projectId, externalId: appConnection.externalId, log })
        if (isNil(refreshedConnection)) {
            return null
        }
        return oauth2Util(log).removeRefreshTokenAndClientSecret(refreshedConnection)
    },
    async deleteAllProjectConnections(projectId: string) {
        await appConnectionsRepo().delete({
            scope: AppConnectionScope.PROJECT,
            ...APArrayContains('projectIds', [projectId]),
        })
    },
    async getOwners({ projectId, platformId }: { projectId: ProjectId, platformId: PlatformId }): Promise<AppConnectionOwners[]> {
        const platformAdmins = (await userService.getByPlatformRole(platformId, PlatformRole.ADMIN)).map(user => ({
            firstName: user.identity.firstName,
            lastName: user.identity.lastName,
            email: user.identity.email,
        }))
        const edition = system.getOrThrow(AppSystemProp.EDITION)
        if (edition === ApEdition.COMMUNITY) {
            return platformAdmins
        }
        const projectMembers = await projectMemberService(log).list({
            platformId,
            projectId,
            cursorRequest: null,
            limit: 1000,
            projectRoleId: undefined,
        })
        const projectMembersDetails = projectMembers.data.map(pm => ({
            firstName: pm.user.firstName,
            lastName: pm.user.lastName,
            email: pm.user.email,
        }))
        return [...platformAdmins, ...projectMembersDetails]
    },
    async aixblockConnectionAuto(params: {
        platformId: string
        projectId: string
        userId: string
        token: string
        url: string
        externalId: string
    }) {
        const aixblockBlockName = 'workflow-aixblock'
        const connectionName = 'AIxBlock - Token: ***' + params.token.substring(params.token.length - 8)
        const connections = await appConnectionsRepo().find({
            where: {
                ...APArrayContains('projectIds', [params.projectId]),
                externalId: params.externalId,
            },
        })
        
        // Create new connection to aixblock with current user token
        // Ignore if it was created before that
        let connection
        if (!connections.length) {
            const connectionParams: UpsertParams = {
                displayName: connectionName,
                externalId: params.externalId,
                ownerId: params.userId,
                blockName: aixblockBlockName,
                platformId: params.platformId,
                projectIds: [params.projectId],
                scope: AppConnectionScope.PROJECT,
                status: AppConnectionStatus.ACTIVE,
                type: AppConnectionType.CUSTOM_AUTH,
                value: {
                    type: AppConnectionType.CUSTOM_AUTH,
                    props: {
                        baseApiUrl: params.url,
                        apiToken: params.token,
                    },
                },
            }

            connection = await this.upsert(connectionParams)
        }
        else {
            connection = connections[0]
        }


        // Upsert AIxBlock as a default block in MPC for current project
        const mcp = await mcpService(log).getOrCreate({ projectId: params.projectId })
        await mcpBlockService(log).add({
            mcpId: mcp.id,
            blockName: aixblockBlockName,
            status: McpBlockStatus.ENABLED,
            connectionId: connection.id,
        })
    },
    v2: {
        async list({
            projectId,
            blockName,
            displayName,
            status,
            limit,
            page,
            scope,
            platformId,
        }: ListParams): Promise<SeekPage<AppConnection>> {
            const paginator = buildOffsetPaginator({
                entity: AppConnectionEntity,
                query: {
                    limit,
                    page,
                    order: 'ASC',
                },
            })

            const querySelector: Record<string, string | FindOperator<string>> = {
                ...(projectId ? APArrayContains('projectIds', [projectId]) : {}),
                ...spreadIfDefined('scope', scope),
                platformId,
            }
            if (!isNil(blockName)) {
                querySelector.blockName = Equal(blockName)
            }
            if (!isNil(displayName)) {
                querySelector.displayName = ILike(`%${displayName}%`)
            }
            if (!isNil(status)) {
                querySelector.status = In(status)
            }
            const queryBuilder = appConnectionsRepo()
                .createQueryBuilder('app_connection')
                .where(querySelector)
            const { data, pageCount } = await paginator.paginate(queryBuilder)



            const promises = data.map(async (encryptedConnection) => {
                const apConnection: AppConnection = decryptConnection(encryptedConnection)
                const owner = isNil(apConnection.ownerId) ? null : await userService.getMetaInformation({
                    id: apConnection.ownerId,
                })
                return {
                    ...apConnection,
                    owner,
                }
            })
            const refreshConnections = await Promise.all(promises)

            return paginationHelper.createPageOffet<AppConnection>(
                refreshConnections,
                pageCount,
            )
        },
    },
})

async function assertProjectIds(projectIds: ProjectId[], platformId: string): Promise<void> {
    const filteredProjects = await projectRepo().countBy({
        id: In(projectIds),
        platformId,
    })
    if (filteredProjects !== projectIds.length) {
        throw new AIxBlockError({
            code: ErrorCode.ENTITY_NOT_FOUND,
            params: {
                entityType: 'Project',
            },
        })
    }
}
const validateConnectionValue = async (
    params: ValidateConnectionValueParams,
    log: FastifyBaseLogger,
): Promise<AppConnectionValue> => {
    const { value, blockName, projectId, platformId } = params

    switch (value.type) {
        case AppConnectionType.PLATFORM_OAUTH2: {
            const tokenUrl = await oauth2Util(log).getOAuth2TokenUrl({
                projectId,
                blockName,
                platformId,
                props: value.props,
            })
            return oauth2Handler[value.type](log).claim({
                projectId,
                platformId,
                blockName,
                request: {
                    grantType: OAuth2GrantType.AUTHORIZATION_CODE,
                    code: value.code,
                    tokenUrl,
                    clientId: value.client_id,
                    props: value.props,
                    authorizationMethod: value.authorization_method,
                    codeVerifier: value.code_challenge,
                    redirectUrl: value.redirect_url,
                },
            })
        }
        case AppConnectionType.CLOUD_OAUTH2: {
            const tokenUrl = await oauth2Util(log).getOAuth2TokenUrl({
                projectId,
                blockName,
                platformId,
                props: value.props,
            })
            return oauth2Handler[value.type](log).claim({
                projectId,
                platformId,
                blockName,
                request: {
                    tokenUrl,
                    grantType: OAuth2GrantType.AUTHORIZATION_CODE,
                    code: value.code,
                    props: value.props,
                    clientId: value.client_id,
                    authorizationMethod: value.authorization_method,
                    codeVerifier: value.code_challenge,
                },
            })
        }
        case AppConnectionType.OAUTH2: {
            const tokenUrl = await oauth2Util(log).getOAuth2TokenUrl({
                projectId,
                blockName,
                platformId,
                props: value.props,
            })
            const auth = await oauth2Handler[value.type](log).claim({
                projectId,
                platformId,
                blockName,
                request: {
                    tokenUrl,
                    code: value.code,
                    clientId: value.client_id,
                    props: value.props,
                    grantType: value.grant_type!,
                    redirectUrl: value.redirect_url,
                    clientSecret: value.client_secret,
                    authorizationMethod: value.authorization_method,
                    codeVerifier: value.code_challenge,
                },
            })
            await engineValidateAuth({
                blockName,
                projectId,
                platformId,
                auth,
            }, log)
            return auth
        }
        case AppConnectionType.CUSTOM_AUTH:
        case AppConnectionType.BASIC_AUTH:
        case AppConnectionType.SECRET_TEXT:
            await engineValidateAuth({
                platformId,
                blockName,
                projectId,
                auth: value,
            }, log)
    }

    return value
}

function decryptConnection(
    encryptedConnection: AppConnectionSchema,
): AppConnection {
    const value = encryptUtils.decryptObject<AppConnectionValue>(encryptedConnection.value)
    const connection: AppConnection = {
        ...encryptedConnection,
        value,
    }
    return connection
}

const engineValidateAuth = async (
    params: EngineValidateAuthParams,
    log: FastifyBaseLogger,
): Promise<void> => {
    const environment = system.getOrThrow(AppSystemProp.ENVIRONMENT)
    if (environment === ApEnvironment.TESTING) {
        return
    }
    const { blockName, auth, projectId, platformId } = params

    const blockMetadata = await blockMetadataService(log).getOrThrow({
        name: blockName,
        projectId,
        version: undefined,
        platformId,
    })

    const engineResponse = await userInteractionWatcher(log).submitAndWaitForResponse<EngineHelperResponse<EngineHelperValidateAuthResult>>({
        block: await getBlockPackageWithoutArchive(log, projectId, platformId, {
            blockName,
            pieceVersion: blockMetadata.version,
            blockType: blockMetadata.blockType,
            packageType: blockMetadata.packageType,
        }),
        projectId,
        platformId,
        connectionValue: auth,
        jobType: UserInteractionJobType.EXECUTE_VALIDATION,
    })

    if (engineResponse.status !== EngineResponseStatus.OK) {
        log.error(
            engineResponse,
            '[AppConnectionService#engineValidateAuth] engineResponse',
        )
        throw new AIxBlockError({
            code: ErrorCode.ENGINE_OPERATION_FAILURE,
            params: {
                message: 'Failed to run engine validate auth',
                context: engineResponse,
            },
        })
    }

    const validateAuthResult = engineResponse.result

    if (!validateAuthResult.valid) {
        throw new AIxBlockError({
            code: ErrorCode.INVALID_APP_CONNECTION,
            params: {
                error: validateAuthResult.error,
            },
        })
    }
}

/**
 * We should make sure this is accessed only once, as a race condition could occur where the token needs to be
 * refreshed and it gets accessed at the same time, which could result in the wrong request saving incorrect data.
 */
async function lockAndRefreshConnection({
    projectId,
    externalId,
    log,
}: {
    projectId: ProjectId
    externalId: string
    log: FastifyBaseLogger
}) {
    const refreshLock = await distributedLock.acquireLock({
        key: `${projectId}_${externalId}`,
        timeout: 20000,
        log,
    })

    let appConnection: AppConnection | null = null

    try {
        const encryptedAppConnection = await appConnectionsRepo().findOneBy({
            ...APArrayContains('projectIds', [projectId]),
            externalId,
        })
        if (isNil(encryptedAppConnection)) {
            return encryptedAppConnection
        }
        appConnection = decryptConnection(encryptedAppConnection)
        if (!needRefresh(appConnection, log)) {
            return appConnection
        }
        const refreshedAppConnection = await refresh(appConnection, projectId, log)

        await appConnectionsRepo().update(refreshedAppConnection.id, {
            status: AppConnectionStatus.ACTIVE,
            value: encryptUtils.encryptObject(refreshedAppConnection.value),
        })
        return refreshedAppConnection
    }
    catch (e) {
        exceptionHandler.handle(e, log)
        if (!isNil(appConnection) && oauth2Util(log).isUserError(e)) {
            appConnection.status = AppConnectionStatus.ERROR
            await appConnectionsRepo().update(appConnection.id, {
                status: appConnection.status,
                updated: dayjs().toISOString(),
            })
        }
    }
    finally {
        await refreshLock.release()
    }
    return appConnection
}

function needRefresh(connection: AppConnection, log: FastifyBaseLogger): boolean {
    if (connection.status === AppConnectionStatus.ERROR) {
        return false
    }
    switch (connection.value.type) {
        case AppConnectionType.PLATFORM_OAUTH2:
        case AppConnectionType.CLOUD_OAUTH2:
        case AppConnectionType.OAUTH2:
            return oauth2Util(log).isExpired(connection.value)
        default:
            return false
    }
}

async function refresh(connection: AppConnection, projectId: ProjectId, log: FastifyBaseLogger): Promise<AppConnection> {
    switch (connection.value.type) {
        case AppConnectionType.PLATFORM_OAUTH2:
            connection.value = await oauth2Handler[connection.value.type](log).refresh({
                blockName: connection.blockName,
                platformId: connection.platformId,
                projectId,
                connectionValue: connection.value,
            })
            break
        case AppConnectionType.OAUTH2:
            connection.value = await oauth2Handler[connection.value.type](log).refresh({
                blockName: connection.blockName,
                platformId: connection.platformId,
                projectId,
                connectionValue: connection.value,
            })
            break
        default:
            break
    }
    return connection
}

type UpsertParams = {
    projectIds: ProjectId[]
    ownerId: string | null
    platformId: string
    scope: AppConnectionScope
    externalId: string
    value: UpsertAppConnectionRequestBody['value']
    displayName: string
    type: AppConnectionType
    status?: AppConnectionStatus
    blockName: string
    metadata?: Metadata
}


type GetOneByName = {
    projectId: ProjectId
    platformId: string
    externalId: string
}

type GetOneParams = {
    projectId: ProjectId | null
    platformId: string
    id: string
}

type GetManyParams = {
    projectId: ProjectId
}

type DeleteParams = {
    projectId: ProjectId | null
    scope: AppConnectionScope
    id: AppConnectionId
    platformId: string
}

type ValidateConnectionValueParams = {
    value: UpsertAppConnectionRequestBody['value']
    blockName: string
    projectId: ProjectId | undefined
    platformId: string
}

type ListParams = {
    projectId: ProjectId | null
    platformId: string
    blockName: string | undefined
    cursorRequest: Cursor | null
    scope: AppConnectionScope | undefined
    displayName: string | undefined
    status: AppConnectionStatus[] | undefined
} & OffsetPaginationParams

type UpdateParams = {
    projectIds: ProjectId[] | null
    platformId: string
    id: AppConnectionId
    scope: AppConnectionScope
    request: {
        displayName: string
        projectIds: ProjectId[] | null
        metadata?: Metadata
    }
}

type EngineValidateAuthParams = {
    blockName: string
    projectId: ProjectId | undefined
    platformId: string
    auth: AppConnectionValue
}
