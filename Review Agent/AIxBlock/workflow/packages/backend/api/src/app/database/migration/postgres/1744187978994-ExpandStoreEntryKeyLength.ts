import { MigrationInterface, QueryRunner } from 'typeorm'

export class ExpandStoreEntryLeyLength1744187978994 implements MigrationInterface {
    name = 'ExpandStoreEntryLeyLength1744187978994'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "store-entry"
            ALTER COLUMN "key" TYPE character varying(256) USING "key"::character varying(256)
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "store-entry"
            ALTER COLUMN "key" TYPE character varying(128) USING "key"::character varying(128)
        `)
    }
}
