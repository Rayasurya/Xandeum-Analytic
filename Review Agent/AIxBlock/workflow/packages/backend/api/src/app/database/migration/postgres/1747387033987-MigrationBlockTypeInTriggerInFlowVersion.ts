import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrationBlockTypeInTriggerInFlowVersion1747387033987 implements MigrationInterface {
    name = 'MigrationBlockTypeInTriggerInFlowVersion1747387033987';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const flowVersions = await queryRunner.manager.query(`
            SELECT id, trigger FROM flow_version WHERE trigger IS NOT NULL
        `);

        for (const flow of flowVersions) {
            const original = JSON.stringify(flow.trigger);
            const updated = original.replace(/"pieceType":/g, `"blockType":`);
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
            const reverted = original.replace(/"blockType":/g, `"pieceType":`);
            await queryRunner.manager.query(
                `UPDATE flow_version SET trigger = $1 WHERE id = $2`,
                [JSON.parse(reverted), flow.id]
            );
        }
    }
}
