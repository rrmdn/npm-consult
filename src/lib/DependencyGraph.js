// @flow

import semver from 'semver';
import Package from './Package';
import PackageVersions from './PackageVersions';

class DependencyGraph {
  dependencyMap: Map<string, string>;
  dependencies: Array<PackageVersions>;
  constructor(dependencyMap: Map<string, string>) {
    this.dependencyMap = dependencyMap;
  }
  async resolveDependencyGraph() {
    this.dependencies = Array.from(this.dependencyMap.keys()).map(
      packageName => new PackageVersions(packageName)
    );
    await Promise.all(
      this.dependencies.map(pkgVersion => pkgVersion.resolveVersions())
    );
    return true;
  }
  removePackagesWithout(packageToUpdate: string) {
    const newDependencies = [];
    this.dependencies.forEach(pkgVersion => {
      if (pkgVersion.dependsOn(packageToUpdate)) {
        newDependencies.push(pkgVersion);
      } else {
        this.dependencyMap.delete(pkgVersion.name);
      }
    });
    this.dependencies = newDependencies;
  }
  packagesToUpdate(packageToUpdate: string, version: string): Array<Package> {
    const packagesToUpdate = [];
    this.dependencies.forEach(pkgVersions => {
      let foundPackageVersion;
      pkgVersions.versions.forEach(pkg => {
        const packageToLookFor = pkg.dependencies.find(
          dep => dep.name === packageToUpdate
        );
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

module.exports = DependencyGraph;
