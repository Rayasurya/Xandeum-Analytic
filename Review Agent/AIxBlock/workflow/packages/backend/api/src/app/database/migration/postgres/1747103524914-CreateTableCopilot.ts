import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableCopilot1747103524914 implements MigrationInterface {
    name = 'CreateTableCopilot1747103524914';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "copilot" (
                "id" character varying(21) NOT NULL,
                "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "setting" jsonb,
                "platformId" character varying NOT NULL,
                "projectId" character varying NOT NULL,
                CONSTRAINT "pk_copilot_id" PRIMARY KEY ("id"),
                CONSTRAINT "fk_copilot_platform" FOREIGN KEY ("platformId") REFERENCES "platform"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "fk_copilot_project" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "uq_copilot_platform_project" UNIQUE ("platformId", "projectId")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "copilot"`);
    }
}
