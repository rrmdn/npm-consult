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
  const packageDefinition = await loadPkgJSON('package-example.json');
  switch (action) {
    case 'update':
      await checkForUpdate(packageDefinition);
      break;
    default:
      console.log(`there isn't any command with the name ${action}, dude. 😔`);
      break;
  }
  return true;
}

init();
