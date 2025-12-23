import chalk from "chalk";
import { Command } from "commander";
import inquirer from "inquirer";
import { buildPiece, findPiece } from '../utils/block-utils';

async function buildPieces(blockName: string) {
    const pieceFolder = await findPiece(blockName);
    const { outputFolder } = await buildPiece(pieceFolder);
    console.info(chalk.green(`Block '${blockName}' built and packed successfully at ${outputFolder}.`));
}

export const buildBlockCommand = new Command('build')
    .description('Build blocks without publishing')
    .action(async () => {
        const questions = [
            {
                type: 'input',
                name: 'name',
                message: 'Enter the block folder name',
                placeholder: 'google-drive',
            },
        ];
        const answers = await inquirer.prompt(questions);
        await buildPieces(answers.name);
    });
