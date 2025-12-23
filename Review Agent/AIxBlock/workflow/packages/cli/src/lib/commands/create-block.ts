import chalk from 'chalk';
import { Command } from 'commander';
import { readdir, unlink, writeFile } from 'fs/promises';
import inquirer from 'inquirer';
import assert from 'node:assert';
import { findPiece } from '../utils/block-utils';
import { exec } from '../utils/exec';
import {
  readPackageEslint,
  readProjectJson,
  writePackageEslint,
  writeProjectJson,
} from '../utils/files';

const validateBlockName = async (blockName: string) => {
  console.log(chalk.yellow('Validating block name....'));
  const blockNamePattern = /^(?![._])[a-z0-9-]{1,214}$/;
  if (!blockNamePattern.test(blockName)) {
    console.log(
      chalk.red(
        `🚨 Invalid block name: ${blockName}. Block names can only contain lowercase letters, numbers, and hyphens.`
      )
    );
    process.exit(1);
  }
};

const validatePackageName = async (packageName: string) => {
  console.log(chalk.yellow('Validating package name....'));
  const packageNamePattern = /^(?:@[a-zA-Z0-9-]+\/)?[a-zA-Z0-9-]+$/;
  if (!packageNamePattern.test(packageName)) {
    console.log(
      chalk.red(
        `🚨 Invalid package name: ${packageName}. Package names can only contain lowercase letters, numbers, and hyphens.`
      )
    );
    process.exit(1);
  }
};

const checkIfPieceExists = async (blockName: string) => {
  const pieceFolder = await findPiece(blockName);
  if (pieceFolder) {
    console.log(chalk.red(`🚨 Block already exists at ${pieceFolder}`));
    process.exit(1);
  }
};

const nxGenerateNodeLibrary = async (
  blockName: string,
  packageName: string,
  blockType: string
) => {
  const nxGenerateCommand = [
    `npx nx generate @nx/node:library`,
    `--directory=packages/blocks/${blockType}/${blockName}`,
    `--name=blocks-${blockName}`,
    `--importPath=${packageName}`,
    '--publishable',
    '--buildable',
    '--projectNameAndRootFormat=as-provided',
    '--strict',
    '--unitTestRunner=none',
  ].join(' ');

  console.log(chalk.blue(`🛠️ Executing nx command: ${nxGenerateCommand}`));

  await exec(nxGenerateCommand);
};

const removeUnusedFiles = async (blockName: string, blockType: string) => {
  const path = `packages/blocks/${blockType}/${blockName}/src/lib/`;
  const files = await readdir(path);
  for (const file of files) {
    await unlink(path + file);
  }
};
function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
const generateIndexTsFile = async (blockName: string, blockType: string) => {
  const blockNameCamelCase = blockName
    .split('-')
    .map((s, i) => {
      if (i === 0) {
        return s;
      }

      return s[0].toUpperCase() + s.substring(1);
    })
    .join('');

  const indexTemplate = `
    import { createPiece, PieceAuth } from "workflow-blocks-framework";

    export const ${blockNameCamelCase} = createPiece({
      displayName: "${capitalizeFirstLetter(blockName)}",
      auth: PieceAuth.None(),
      minimumSupportedRelease: '0.36.1',
      logoUrl: "https://example.com/pieces/${blockName}.png",
      authors: [],
      actions: [],
      triggers: [],
    });
    `;

  await writeFile(
    `packages/blocks/${blockType}/${blockName}/src/index.ts`,
    indexTemplate
  );
};
const updateProjectJsonConfig = async (
  blockName: string,
  blockType: string
) => {
  const projectJson = await readProjectJson(
    `packages/blocks/${blockType}/${blockName}`
  );

  assert(
    projectJson.targets?.build?.options,
    '[updateProjectJsonConfig] targets.build.options is required'
  );

  projectJson.targets.build.options.buildableProjectDepsInPackageJsonType =
    'dependencies';
  projectJson.targets.build.options.updateBuildableProjectDepsInPackageJson =
    true;

    const lintFilePatterns = projectJson.targets.lint?.options?.lintFilePatterns;

    if (lintFilePatterns) {
    const patternIndex = lintFilePatterns.findIndex((item) =>
      item.endsWith('package.json')
    );
    if (patternIndex !== -1) lintFilePatterns?.splice(patternIndex, 1);
  } else {
  projectJson.targets.lint = {
    executor: '@nx/eslint:lint',
    outputs: ['{options.outputFile}'],
  };
}

  await writeProjectJson(
    `packages/blocks/${blockType}/${blockName}`,
    projectJson
  );
};
const updateEslintFile = async (blockName: string, blockType: string) => {
  const eslintFile = await readPackageEslint(
    `packages/blocks/${blockType}/${blockName}`
  );
  eslintFile.overrides.splice(
    eslintFile.overrides.findIndex((rule: any) => rule.files[0] == '*.json'),
    1
  );
  await writePackageEslint(
    `packages/blocks/${blockType}/${blockName}`,
    eslintFile
  );
};
const setupGeneratedLibrary = async (blockName: string, blockType: string) => {
  await removeUnusedFiles(blockName, blockType);
  await generateIndexTsFile(blockName, blockType);
  await updateProjectJsonConfig(blockName, blockType);
  await updateEslintFile(blockName, blockType);
};

export const createPiece = async (
  blockName: string,
  packageName: string,
  blockType: string
) => {
  await validateBlockName(blockName);
  await validatePackageName(packageName);
  await checkIfPieceExists(blockName);
  await nxGenerateNodeLibrary(blockName, packageName, blockType);
  await setupGeneratedLibrary(blockName, blockType);
  console.log(chalk.green('✨  Done!'));
  console.log(
    chalk.yellow(
      `The block has been generated at: packages/blocks/${blockType}/${blockName}`
    )
  );
};

export const createBlockCommand = new Command('create')
  .description('Create a new block')
  .action(async () => {
    const questions = [
      {
        type: 'input',
        name: 'blockName',
        message: 'Enter the block name:',
      },
      {
        type: 'input',
        name: 'packageName',
        message: 'Enter the package name:',
        default: (answers: any) => `workflow-${answers.blockName}`,
        when: (answers: any) => answers.blockName !== undefined,
      },
      {
        type: 'list',
        name: 'blockType',
        message: 'Select the block type:',
        choices: ['community', 'custom'],
        default: 'community',
      },
    ];

    const answers = await inquirer.prompt(questions);
    createPiece(answers.blockName, answers.packageName, answers.blockType);
  });
