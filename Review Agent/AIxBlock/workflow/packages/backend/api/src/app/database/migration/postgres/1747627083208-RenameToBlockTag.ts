import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameToBlockTag1747627083208 implements MigrationInterface {
    name = 'RenameToBlockTag1747627083208';

    public async up(queryRunner: QueryRunner): Promise<void> {
         // Rename table
        await queryRunner.query(`ALTER TABLE piece_tag RENAME TO block_tag`);

        // Rename column
        await queryRunner.query(`ALTER TABLE block_tag RENAME COLUMN "pieceName" TO "blockName"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert column name
        await queryRunner.query(`ALTER TABLE block_tag RENAME COLUMN "blockName" TO "pieceName"`);

        // Revert table name
        await queryRunner.query(`ALTER TABLE block_tag RENAME TO piece_tag`);
    }
}
