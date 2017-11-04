// @flow

import inquirer from 'inquirer';
import packageVersion from 'pkg-versions';
import chalk from 'chalk';
import DependencyGraph from '../lib/DependencyGraph';

import type {PackageJSONType} from '../utils';

export default async function checkForUpdate(
  packageDefinition: PackageJSONType
) {
  const {packageToUpdate} = await inquirer.prompt([
    {
      type: 'list',
      name: 'packageToUpdate',
      message: 'Which package do you want to update?',
      choices: Object.keys(packageDefinition.dependencies).map(key => ({
        name: key,
        value: key,
      })),
    },
  ]);
  console.log('Loading available versions of', packageToUpdate);
  const packageVersionList = await packageVersion(packageToUpdate);
  const {version} = await inquirer.prompt([
    {
      type: 'list',
      choices: Array.from(packageVersionList)
        .reverse()
        .map(pkgVersion => ({
          name: `${packageToUpdate}@${pkgVersion}`,
          value: pkgVersion,
        })),
      name: 'version',
      message: `Which version of ${packageToUpdate} do you want to update to?`,
    },
  ]);
  const depsList = Object.keys(packageDefinition.dependencies)
    .map(dependency => [dependency, packageDefinition.dependencies[dependency]])
    .filter(([dependency]) => dependency !== packageToUpdate);
  const depsMap = new Map(depsList);
  const dependencyGraph = new DependencyGraph(depsMap);
  console.log(chalk.blue('Building dependency graph...'));
  await dependencyGraph.resolveDependencyGraph();
  dependencyGraph.removePackagesWithout(packageToUpdate);
  const updateResult = dependencyGraph.packagesToUpdate(
    packageToUpdate,
    version,
  );
  updateResult.match(
    (supportedPackages) => {
      console.log('You can update to these packages');
      supportedPackages.forEach((pkg) => {
        console.log(chalk.green(`${pkg.name}@${pkg.version}`));
      });
    },
    (unsupportedPackages) => {
      console.log(`Can not upgrade to ${packageToUpdate}@${version}, unsupported packages:`);
      unsupportedPackages.forEach((pkg) => {
        console.log(chalk.red(`${pkg.name}@${pkg.version}`));
      });
    },
  );
  return true;
}
