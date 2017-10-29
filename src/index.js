import prompt from 'prompt';
import Promise from 'bluebird';

import {loadPkgJSON} from './utils';

import checkForUpdate from './actions/checkForUpdate';

const getPrompt = Promise.promisify(prompt.get);

const app = require('commander');
app.version('0.0.1')
    .command('update <package>')
    .description('check whether your dependency graph supports updating to the specified package.')
    .option('-p, --package <packagefile>', "Specify which package.json file to use.")
    .action(async function (pkg, options) {

        const packageFile = options.package || 'package.json';
        const packageDefinition = await loadPkgJSON(packageFile);

        const packageMeta = /^(.+)@([^@]+)$/.exec(pkg);
        if (!packageMeta) {
            console.error('Please specify package as <package-name>@<version>');
            return 1;
        }
        const packageVersion = packageMeta[2];
        const packageName = packageMeta[1];

        await checkForUpdate(packageDefinition, getPrompt, packageName, packageVersion);
    });

app.parse(process.argv);

if (app.args.length === 0) {
    app.help();
}