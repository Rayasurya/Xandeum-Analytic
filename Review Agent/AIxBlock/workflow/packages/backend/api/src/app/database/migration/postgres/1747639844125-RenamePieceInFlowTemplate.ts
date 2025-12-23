import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenamePieceInFlowTemplate1747639844125 implements MigrationInterface {
    name = 'RenamePieceInFlowTemplate1747639844125';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const flowTemplates = await queryRunner.manager.query(`
            SELECT id, template FROM flow_template WHERE template IS NOT NULL
        `);

        for (const flow of flowTemplates) {
            const original = JSON.stringify(flow.template);
            let updated = original.replace(/"pieceName":/g, `"blockName":`);
            updated = updated.replace(/"pieceType":/g, `"blockType":`);
            await queryRunner.manager.query(
                `UPDATE flow_template SET template = $1 WHERE id = $2`,
                [JSON.parse(updated), flow.id]
            );
        }

        // Rename column
        await queryRunner.query(`ALTER TABLE flow_template RENAME COLUMN "pieces" TO "blocks"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const flowTemplates = await queryRunner.manager.query(`
            SELECT id, template FROM flow_template WHERE template IS NOT NULL
        `);

        for (const flow of flowTemplates) {
            const original = JSON.stringify(flow.template);
            let reverted = original.replace(/"blockName":/g, `"pieceName":`);
            reverted = reverted.replace(/"blockType":/g, `"pieceType":`);
            await queryRunner.manager.query(
                `UPDATE flow_template SET template = $1 WHERE id = $2`,
                [JSON.parse(reverted), flow.id]
            );
        }

        // Revert column name
        await queryRunner.query(`ALTER TABLE flow_template RENAME COLUMN "blocks" TO "pieces"`);
    }
}
