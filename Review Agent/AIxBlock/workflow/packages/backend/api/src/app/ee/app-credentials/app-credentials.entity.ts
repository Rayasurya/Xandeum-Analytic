import { EntitySchema } from 'typeorm'
import { AppCredential } from 'workflow-axb-shared'
import { Project } from 'workflow-shared'
import {
    ApIdSchema,
    BaseColumnSchemaPart,
    JSONB_COLUMN_TYPE,
} from '../../database/database-common'

export type AppCredentialSchema = {
    project: Project[]
} & AppCredential

export const AppCredentialEntity = new EntitySchema<AppCredentialSchema>({
    name: 'app_credential',
    columns: {
        ...BaseColumnSchemaPart,
        appName: {
            type: String,
        },
        projectId: ApIdSchema,
        settings: {
            type: JSONB_COLUMN_TYPE,
        },
    },
    indices: [],
    relations: {
        project: {
            type: 'many-to-one',
            target: 'project',
            onDelete: 'CASCADE',
            joinColumn: true,
            inverseSide: 'appCredentials',
        },
    },
})
