import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddListingCategory1746689881279 implements MigrationInterface {
    name = 'AddListingCategory1746689881279'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "listing_category"
            (
                "id"          varchar(21) PRIMARY KEY NOT NULL,
                "name"        varchar                 NOT NULL,
                "displayName" varchar,
                "description" varchar,
                "enabled"     boolean                 NOT NULL DEFAULT 1,
                "created" datetime                    NOT NULL DEFAULT (datetime('now')),
                "updated" datetime                    NOT NULL DEFAULT (datetime('now'))
            )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "listing_category"
        `)
    }
}
