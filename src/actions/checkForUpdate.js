// @flow

import inquirer from 'inquirer';
import packageVersion from 'pkg-versions';
import DependencyGraph from '../lib/DependencyGraph';

import type {PackageJSONType} from '../utils';

export async function checkForUpdateViaArguments(
  packageDefinition: PackageJSONType,
  packageToUpdate: string,
  updateToVersion: string
) {
  const depsList = Object.keys(packageDefinition.dependencies)
    .map(dependency => [dependency, packageDefinition.dependencies[dependency]])
    .filter(([dependency]) => dependency !== packageToUpdate);
  const depsMap = new Map(depsList);
  const dependencyGraph = new DependencyGraph(depsMap);

  console.log('Building dependency graph...');

  await dependencyGraph.resolveDependencyGraph();
  dependencyGraph.removePackagesWithout(packageToUpdate);
  const availableUpdates = dependencyGraph.packagesToUpdate(
    packageToUpdate,
    updateToVersion
  );

  if (availableUpdates.length) {
    console.log('You can update to', availableUpdates.join(', '));
  } else {
    console.log(
      'Im afraid that you can not update',
      packageToUpdate,
      'to version',
      updateToVersion
    );
  }
  return true;
}

export async function checkForUpdate(packageDefinition: PackageJSONType) {
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
  console.log('Building dependency graph...');
  await dependencyGraph.resolveDependencyGraph();
  dependencyGraph.removePackagesWithout(packageToUpdate);
  const availableUpdates = dependencyGraph.packagesToUpdate(
    packageToUpdate,
    version
  );
  if (availableUpdates.length) {
    console.log('You can update to', availableUpdates.join(', '));
  } else {
    console.log(
      'Im afraid that you can not update',
      packageToUpdate,
      'to version',
      version
    );

    return true;
  }
}
