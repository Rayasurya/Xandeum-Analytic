import { Static, Type } from '@sinclair/typebox'
import { EntitySchema } from 'typeorm'
import { CopilotConfig, Platform, Project } from 'workflow-shared'
import { BaseColumnSchemaPart, JSON_COLUMN_TYPE } from '../database/database-common'
import { EncryptedObject } from '../helper/encryption'

const CopilotConfigEncrypted = Type.Composite([Type.Omit(CopilotConfig, ['config']), Type.Object({
    setting: EncryptedObject,
})])

type CopilotConfigEncrypted = Static<typeof CopilotConfigEncrypted>

export type CopilotSchema = CopilotConfigEncrypted & {
    platform: Platform
    project: Project
}

export const CopilotEntity = new EntitySchema<CopilotSchema>({
    name: 'copilot',
    columns: {
        ...BaseColumnSchemaPart,
        platformId: {
            type: String,
            nullable: false,
        },
        projectId: {
            type: String,
            nullable: false,
        },
        setting: {
            type: JSON_COLUMN_TYPE,
            nullable: false,
        },
    },
    indices: [
        {
            name: 'uq_copilot_platform_project',
            columns: ['platformId', 'projectId'],
            unique: true,
        },
    ],
    relations: {
        platform: {
            type: 'many-to-one',
            target: 'platform',
            cascade: true,
            onDelete: 'CASCADE',
            joinColumn: {
                name: 'platformId',
                foreignKeyConstraintName: 'fk_copilot_platform',
            },
        },
        project: {
            type: 'many-to-one',
            target: 'project',
            cascade: true,
            onDelete: 'CASCADE',
            joinColumn: {
                name: 'projectId',
                foreignKeyConstraintName: 'fk_copilot_project',
            },
        },
    },
})