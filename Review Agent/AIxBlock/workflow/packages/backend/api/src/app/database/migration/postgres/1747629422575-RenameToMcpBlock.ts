import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameToMcpBlock1747629422575 implements MigrationInterface {
    name = 'RenameToMcpBlock1747629422575';

    public async up(queryRunner: QueryRunner): Promise<void> {
         // Rename table
        await queryRunner.query(`ALTER TABLE mcp_piece RENAME TO mcp_block`);

        // Rename column
        await queryRunner.query(`ALTER TABLE mcp_block RENAME COLUMN "pieceName" TO "blockName"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert column name
        await queryRunner.query(`ALTER TABLE mcp_block RENAME COLUMN "blockName" TO "pieceName"`);

        // Revert table name
        await queryRunner.query(`ALTER TABLE mcp_block RENAME TO mcp_piece`);
    }
}
