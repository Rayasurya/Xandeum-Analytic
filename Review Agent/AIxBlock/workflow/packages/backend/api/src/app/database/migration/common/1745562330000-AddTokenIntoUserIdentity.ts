import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTokenIntoUserIdentity1745562330000 implements MigrationInterface {
    name = 'AddTokenIntoUserIdentity1745562330000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_identity"
            ADD "token" character varying
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_identity" DROP COLUMN "token"
        `)
    }

}
