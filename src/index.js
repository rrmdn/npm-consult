#!/usr/bin/env node

import inquirer from 'inquirer';

import {loadPkgJSON} from './utils';

import checkForUpdate from './actions/checkForUpdate';

async function init() {
  const {action} = await inquirer.prompt([
    {
      type: 'list',
      choices: [
        {
          name: 'update (Update a package to the most feasible version)',
          value: 'update',
        },
      ],
      name: 'action',
      message: 'What do you want to do?',
    },
  ]);
  try {
    const packageDefinition = await loadPkgJSON('package.json');
    switch (action) {
      case 'update':
        await checkForUpdate(packageDefinition);
        break;
      default:
        console.log(`there isn't any command with the name ${action}, dude. 😔`);
        break;
    }
  } catch (error) {
    console.log(error);
  }

  return true;
}

init();
