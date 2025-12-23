import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddListingUserId1746689195873 implements MigrationInterface {
    name = 'AddListingUserId1746689195873'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE flow ADD COLUMN "listingUserId" INTEGER`);
        await queryRunner.query(`ALTER TABLE flow ADD COLUMN "listingCategoryId" TEXT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE flow DROP COLUMN "listingUserId"`);
        await queryRunner.query(`ALTER TABLE flow DROP COLUMN "listingCategoryId"`);
    }
}
