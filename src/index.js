import prompt from 'prompt';
import Promise from 'bluebird';

import {loadPkgJSON} from './utils';

import checkForUpdate from './actions/checkForUpdate';

const getPrompt = Promise.promisify(prompt.get);

async function init() {
  const {action} = await getPrompt(['action']);
  const packageDefinition = await loadPkgJSON('package-example.json');
  switch (action) {
    case 'update':
      await checkForUpdate(packageDefinition, getPrompt);
      break;
    default:
      console.log(`there isn't any command with the name ${action}, dude. 😔`);
      break;
  }
  return true;
}

init();
