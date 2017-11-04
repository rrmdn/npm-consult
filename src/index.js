import inquirer from 'inquirer';

import {loadPkgJSON} from './utils';

import {
  checkForUpdate,
  checkForUpdateViaArguments,
} from './actions/checkForUpdate';

const app = require('commander');
app
  .version('0.0.1')
  .command('update <package>')
  .description(
    'check whether your dependency graph supports updating to the specified package.'
  )
  .option(
    '-p, --package <packagefile>',
    'Specify which package.json file to use.'
  )
  .action(async function(pkg, options) {
    const packageFile = options.package || 'package.json';
    const packageDefinition = await loadPkgJSON(packageFile);

    const packageMeta = /^(.+)@([^@]+)$/.exec(pkg);
    if (!packageMeta) {
      console.error('Please specify package as <package-name>@<version>');
      return 1;
    }
    const packageVersion = packageMeta[2];
    const packageName = packageMeta[1];

    await checkForUpdateViaArguments(
      packageDefinition,
      packageName,
      packageVersion
    );
  });

app.parse(process.argv);

if (app.args.length === 0) {
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
    const packageDefinition = await loadPkgJSON('example/package-example.json');
    switch (action) {
      case 'update':
        await checkForUpdate(packageDefinition);
        break;
      default:
        console.log(
          `there isn't any command with the name ${action}, dude. 😔`
        );
        break;
    }
    return true;
  }

  init();
}
