import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddListingFlow1746515592000 implements MigrationInterface {
    name = 'AddListingFlow1746515592000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE flow
            ADD COLUMN "listingName" varchar,
            ADD COLUMN "listingPrice" INT8 CHECK ("listingPrice" >= 0),
            ADD COLUMN "listingStatus" BOOLEAN,
            ADD COLUMN "listingDescription" TEXT
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE flow
            DROP COLUMN "listingName",
            DROP COLUMN "listingPrice",
            DROP COLUMN "listingStatus",
            DROP COLUMN "listingDescription"
        `)
    }
}
