import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenamePieceMetadataFromPieceToBlock1747384077914 implements MigrationInterface {
    name = 'RenamePieceMetadataFromPieceToBlock1747384077914';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Rename table
        await queryRunner.query(`ALTER TABLE piece_metadata RENAME TO block_metadata`);

        // Rename column
        await queryRunner.query(`ALTER TABLE block_metadata RENAME COLUMN "pieceType" TO "blockType"`);

        // Rename index
        await queryRunner.query(`ALTER INDEX idx_piece_metadata_name_project_id_version RENAME TO idx_block_metadata_name_project_id_version`);

        // Rename foreign key constraints
        await queryRunner.query(`ALTER TABLE block_metadata RENAME CONSTRAINT fk_piece_metadata_project_id TO fk_block_metadata_project_id`);
        await queryRunner.query(`ALTER TABLE block_metadata RENAME CONSTRAINT fk_piece_metadata_file TO fk_block_metadata_file`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert foreign key constraint names
        await queryRunner.query(`ALTER TABLE block_metadata RENAME CONSTRAINT fk_block_metadata_project_id TO fk_piece_metadata_project_id`);
        await queryRunner.query(`ALTER TABLE block_metadata RENAME CONSTRAINT fk_block_metadata_file TO fk_piece_metadata_file`);

        // Revert index name
        await queryRunner.query(`ALTER INDEX idx_block_metadata_name_project_id_version RENAME TO idx_piece_metadata_name_project_id_version`);

        // Revert column name
        await queryRunner.query(`ALTER TABLE block_metadata RENAME COLUMN "blockType" TO "pieceType"`);

        // Revert table name
        await queryRunner.query(`ALTER TABLE block_metadata RENAME TO piece_metadata`);
    }
}
