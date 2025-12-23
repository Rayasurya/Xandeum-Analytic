import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenamePieceInOauth1747639252948 implements MigrationInterface {
    name = 'RenamePieceInOauth1747639252948';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Rename column
        await queryRunner.query(`ALTER TABLE oauth_app RENAME COLUMN "pieceName" TO "blockName"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert column name
        await queryRunner.query(`ALTER TABLE oauth_app RENAME COLUMN "blockName" TO "pieceName"`);
    }
}
