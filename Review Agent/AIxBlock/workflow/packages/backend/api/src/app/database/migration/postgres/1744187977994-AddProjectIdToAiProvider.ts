import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectIdToAiProvider1744187975994 implements MigrationInterface {
    name = 'AddProjectIdToAiProvider1744187975994';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "ai_provider"
        `);
        await queryRunner.query(`
            ALTER TABLE "ai_provider"
            ADD "projectId" character varying(21) NOT NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "ai_provider"
            ADD CONSTRAINT "fk_ai_provider_project_id" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "ai_provider" DROP CONSTRAINT "fk_ai_provider_project_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "ai_provider" DROP COLUMN "projectId"
        `);
    }
}
