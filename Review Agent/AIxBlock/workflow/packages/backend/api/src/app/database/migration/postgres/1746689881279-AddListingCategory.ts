import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddListingCategory1746689881279 implements MigrationInterface {
    name = 'AddListingCategory1746689881279'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "listing_category"
            (
                "id"          VARCHAR(21) PRIMARY KEY  NOT NULL,
                "name"        VARCHAR                  NOT NULL,
                "displayName" VARCHAR,
                "description" VARCHAR,
                "enabled"     BOOLEAN                  NOT NULL DEFAULT true,
                "created"     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated"     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "listing_category"
        `)
    }
}
