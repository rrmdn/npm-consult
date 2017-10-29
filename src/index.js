import prompt from 'prompt';
import Promise from 'bluebird';

import {loadPkgJSON} from './utils';

import checkForUpdate from './actions/checkForUpdate';

const getPrompt = Promise.promisify(prompt.get);

async function init() {
  const action = await getPrompt(['to']);
  const packageDefinition = await loadPkgJSON('package-example.json');
  switch (action) {
    case 'update':
      await checkForUpdate(packageDefinition, getPrompt);
      break;
    default:
      break;
  }
  return true;
}

init().catch(err => {
  console.error(err);
  process.exit();
});
