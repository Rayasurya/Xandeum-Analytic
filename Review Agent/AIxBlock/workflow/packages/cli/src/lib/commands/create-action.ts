import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { assertPieceExists, displayNameToCamelCase, displayNameToKebabCase, findPiece } from '../utils/block-utils';
import { checkIfFileExists, makeFolderRecursive } from '../utils/files';

function createActionTemplate(displayName: string, description: string) {
  const camelCase = displayNameToCamelCase(displayName)
  const actionTemplate = `import { createAction, Property } from 'workflow-blocks-framework';

export const ${camelCase} = createAction({
  name: '${camelCase}',
  displayName: '${displayName}',
  description: '${description}',
  props: {},
  async run() {
    // Action logic here
  },
});
`;

  return actionTemplate
}

const checkIfActionExists = async (actionPath: string) => {
  if (await checkIfFileExists(actionPath)) {
    console.log(chalk.red(`🚨 Action already exists at ${actionPath}`));
    process.exit(1);
  }
}
const createAction = async (blockName: string, displayActionName: string, actionDescription: string) => {
  const actionTemplate = createActionTemplate(displayActionName, actionDescription)
  const actionName = displayNameToKebabCase(displayActionName)
  const pieceFolder = await findPiece(blockName);
  assertPieceExists(pieceFolder)
  console.log(chalk.blue(`Piece path: ${pieceFolder}`))
  const actionsFolder = join(pieceFolder, 'src', 'lib', 'actions')
  const actionPath = join(actionsFolder, `${actionName}.ts`)
  await checkIfActionExists(actionPath)

  await makeFolderRecursive(actionsFolder);
  await writeFile(actionPath, actionTemplate);
  console.log(chalk.yellow('✨'), `Action ${actionPath} created`);
};


export const createActionCommand = new Command('create')
  .description('Create a new action')
  .action(async () => {
    const questions = [
      {
        type: 'input',
        name: 'blockName',
        message: 'Enter the blocck folder name:',
        placeholder: 'google-drive',
      },
      {
        type: 'input',
        name: 'actionName',
        message: 'Enter the action display name',
      },
      {
        type: 'input',
        name: 'actionDescription',
        message: 'Enter the action description',
      }
    ];

    const answers = await inquirer.prompt(questions);
    createAction(answers.blockName, answers.actionName, answers.actionDescription);
  });
