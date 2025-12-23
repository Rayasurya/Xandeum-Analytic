import { apId } from 'workflow-shared';
import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddListingCategory1746771085000 implements MigrationInterface {
    name = 'AddListingCategory1746771085000'
    categories = [
        "AI",
        "SecOps",
        "Sales",
        "IT Ops",
        "Marketing",
        "Engineering",
        "DevOps",
        "Design",
        "Finance",
        "HR",
        "Other",
        "Product",
        "Support",
    ];

    public async up(queryRunner: QueryRunner): Promise<void> {
        for (let i = 0; i < this.categories.length; i++) {
            await queryRunner.query(`
                INSERT INTO "listing_category" (
                    "id",
                    "name",
                    "displayName",
                    "description"
                )
                VALUES (
                    '${apId()}',
                    '${this.categories[i]}',
                    '${this.categories[i]}',
                    ''
                )
            `)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
