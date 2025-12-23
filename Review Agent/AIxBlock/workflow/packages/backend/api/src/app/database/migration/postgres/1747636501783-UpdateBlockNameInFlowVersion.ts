import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateBlockNameInFlowVersion1747636501783 implements MigrationInterface {
    name = 'UpdateBlockNameInFlowVersion1747636501783';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const flowVersions = await queryRunner.manager.query(`
            SELECT id, trigger FROM flow_version WHERE trigger IS NOT NULL
        `);

        for (const flow of flowVersions) {
            const original = JSON.stringify(flow.trigger);
            const updated = original.replace(/"pieceName":/g, `"blockName":`);
            await queryRunner.manager.query(
                `UPDATE flow_version SET trigger = $1 WHERE id = $2`,
                [JSON.parse(updated), flow.id]
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert trigger blockType -> pieceType
        const flowVersions = await queryRunner.manager.query(`
            SELECT id, trigger FROM flow_version WHERE trigger IS NOT NULL
        `);

        for (const flow of flowVersions) {
            const original = JSON.stringify(flow.trigger);
            const reverted = original.replace(/"blockName":/g, `"pieceName":`);
            await queryRunner.manager.query(
                `UPDATE flow_version SET trigger = $1 WHERE id = $2`,
                [JSON.parse(reverted), flow.id]
            );
        }
    }
}
