import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddListingPreviewCol1746602411215 implements MigrationInterface {
    name = 'AddListingFlow1746602411215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE flow
            ADD COLUMN "listingPreview" TEXT
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE flow
            DROP COLUMN "listingPreview"
        `)
    }
}
