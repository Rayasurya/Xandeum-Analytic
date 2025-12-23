import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUrlIntoUserIdentity1745565816000 implements MigrationInterface {
    name = 'AddUrlIntoUserIdentity1745565816000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_identity"
            ADD "url" character varying
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_identity" DROP COLUMN "url"
        `)
    }

}
