import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMetadataForFlowTemplate1744836784953 implements MigrationInterface {
    name = 'AddMetadataForFlowTemplate1744836784953'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "flow_template"
            ADD COLUMN IF NOT EXISTS "metadata" jsonb
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "flow_template" DROP COLUMN IF EXISTS "metadata"
        `)
    }
}
