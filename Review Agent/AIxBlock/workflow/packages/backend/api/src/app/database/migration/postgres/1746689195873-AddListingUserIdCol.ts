import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddListingUserIdCol1746689195873 implements MigrationInterface {
    name = 'AddListingUserIdCol1746689195873'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE flow
            ADD COLUMN "listingUserId" integer,
            ADD COLUMN "listingCategoryId" character varying(21)
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE flow
            DROP COLUMN "listingUserId",
            DROP COLUMN "listingCategoryId" character varying(21)
        `)
    }
}
