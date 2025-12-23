import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeletePlatformCopilotSettings1747119262467 implements MigrationInterface {
    name = 'DeletePlatformCopilotSettings1747119262467';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "platform" DROP COLUMN "copilotSettings"
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "platform"
            ADD "copilotSettings" jsonb
        `)
    }
}
