// @flow
const path = require('path');
const prompt = require('prompt');
const Promise = require('bluebird');
const fs = require('fs');
const R = require('ramda');
const packageJson = require('package-json');
const packageVersion = require('pkg-versions');
const semver = require('semver');

const PACKAGE_DEFINITION_NAME = './package-example.json';

const getPrompt = Promise.promisify(prompt.get);
const readFile = Promise.promisify(fs.readFile);
prompt.start();

class Package {
  name: string;
  dependencies: Array<Package>;
  version: string;
  constructor(name: string, version: string) {
    this.name = name;
    this.version = version;
  }
  resolveDependencies = async () => {
    const currentPackage = await packageJson(this.name, { version: this.version });
    const dependencies = Object.assign(
      {},
      (currentPackage.dependencies || {}),
      (currentPackage.devDependencies)
    );
    this.dependencies = Object.keys(dependencies || {})
      .map(key => new Package(key, dependencies[key]));
    return true;
  }
  toString = () => `${this.name}@${this.version}`
  dependsOn = (packageToUpdate: string): boolean =>
    this.dependencies.find(pkg => pkg.name === packageToUpdate)
}

class PackageVersions {
  name: string;
  versions: Array<Package>;
  constructor(name: string) {
    this.name = name;
    this.versions = [];
  }
  resolveVersions = async () => {
    const versions = await packageVersion(this.name);
    this.versions = Array.from(versions).map(version => new Package(this.name, version));
    await Promise.all(this.versions.map(pkg => pkg.resolveDependencies()));
    return true;
  }
  dependsOn = (packageToUpdate: string): boolean =>
    this.versions.find(pkg => pkg.dependsOn(packageToUpdate))
}

class DependencyGraph {
  dependencyMap: Map;
  dependencies: Array<PackageVersions>;
  constructor(dependencyMap: Map) {
    this.dependencyMap = dependencyMap;
  }
  resolveDependencyGraph = async () => {
    this.dependencies = Array
      .from(this.dependencyMap.keys())
      .map(packageName => new PackageVersions(packageName));
    await Promise.all(this.dependencies.map(pkgVersion => pkgVersion.resolveVersions()));
    return true;
  }
  removePackagesWithout = (packageToUpdate: string) => {
    const newDependencies = [];
    this.dependencies.forEach((pkgVersion) => {
      if (pkgVersion.dependsOn(packageToUpdate)) {
        newDependencies.push(pkgVersion);
      } else {
        this.dependencyMap.delete(pkgVersion.name);
      }
    });
    this.dependencies = newDependencies;
  }
  packagesToUpdate = (packageToUpdate: string, version: string): Array<Package> => {
    const packagesToUpdate = [];
    this.dependencies.forEach((pkgVersions) => {
      let foundPackageVersion;
      pkgVersions.versions.forEach((pkg) => {
        const packageToLookFor = pkg.dependencies.find(dep => dep.name === packageToUpdate);
        if (packageToLookFor) {
          const acceptedRange = semver.validRange(packageToLookFor.version);
          if (acceptedRange) {
            const isOnTheRange = semver.satisfies(version, acceptedRange);
            if (isOnTheRange) {
              foundPackageVersion = pkg.toString();
            }
          }
        }
      });
      if (foundPackageVersion) {
        packagesToUpdate.push(foundPackageVersion);
      }
    });
    return packagesToUpdate;
  }
}

const checkForUpdate = async () => {
  const result = await getPrompt(['library name', 'version']);
  const packageToUpdate = result['library name'];
  const { version } = result;
  const packageDefinitionPath = path.resolve(path.join(process.env.PWD, PACKAGE_DEFINITION_NAME));
  const packageDefinitionRaw = await readFile(packageDefinitionPath);
  const packageDefinition = JSON.parse(packageDefinitionRaw.toString('utf8'));
  const depsList = Object
    .keys(packageDefinition.dependencies)
    .map(dependency => ([dependency, packageDefinition.dependencies[dependency]]))
    .filter(([dependency]) => dependency !== packageToUpdate);
  const depsMap = new Map(depsList);
  const dependencyGraph = new DependencyGraph(depsMap);
  console.log('Building dependency graph...');
  await dependencyGraph.resolveDependencyGraph();
  dependencyGraph.removePackagesWithout(packageToUpdate);
  const availableUpdates = dependencyGraph.packagesToUpdate(packageToUpdate, version);
  if (availableUpdates.length) {
    console.log('You can update to', availableUpdates.join(', '));
  } else {
    console.log('Im afraid that you can not update', packageToUpdate, 'to version', version);
  }
  return true;
};

const consult = async () => {
  const { to } = await getPrompt(['to']);
  switch (to) {
    case 'update':
      await checkForUpdate();
      break;
    default:
      break;
  }
  return true;
};

try {
  consult();
} catch (error) {
  throw error;
}
