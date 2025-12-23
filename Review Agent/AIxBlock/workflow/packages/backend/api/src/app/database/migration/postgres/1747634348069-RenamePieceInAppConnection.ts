import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenamePieceInAppConnection1747634348069 implements MigrationInterface {
    name = 'RenamePieceInAppConnection1747634348069';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Rename column
        await queryRunner.query(`ALTER TABLE app_connection RENAME COLUMN "pieceName" TO "blockName"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert table name
        await queryRunner.query(`ALTER TABLE app_connection RENAME TO mcp_piece`);
    }
}
