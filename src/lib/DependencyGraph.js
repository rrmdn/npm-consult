// @flow

import semver from 'semver';
import Package from './Package';
import PackageVersions from './PackageVersions';

class Result<Ok, Err> {
  static err = (err: Err): Result<Ok, Err> =>
    new Result(null, err);
  static ok = (ok: Ok): Result<Ok, Err> =>
    new Result(ok, null)
  constructor(ok: Ok, err: Err) {
    this.ok = ok;
    this.err = err;
  }
  match = (ifOk: (ok: Ok) => any, ifErr: (err: Err) => any): Ok => {
    if (this.err) {
      return ifErr(this.err);
    }
    return ifOk(this.ok);
  }
}

export default class DependencyGraph {
  dependencyMap: Map<string, string>;
  dependencies: Array<PackageVersions>;
  constructor(dependencyMap: Map<string, string>) {
    this.dependencyMap = dependencyMap;
  }
  async resolveDependencyGraph() {
    this.dependencies = Array
      .from(this.dependencyMap.keys())
      .map(packageName => new PackageVersions(packageName));
    await Promise.all(this.dependencies.map(pkgVersion => pkgVersion.resolveVersions()));
    return true;
  }
  removePackagesWithout(packageToUpdate: string) {
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
  packagesToUpdate = (
    packageToUpdate: string,
    version: string,
  ): Result<Array<Package>, Array<Package>> => {
    const packagesToUpdate: Array<Package> = [];
    const unsupportedPackages: Array<Package> = [];
    this.dependencies.forEach((pkgVersions) => {
      let foundPackageVersion: Package;
      pkgVersions.versions.forEach((pkg) => {
        const packageToLookFor = pkg.dependencies.find(dep => dep.name === packageToUpdate);
        if (packageToLookFor) {
          const acceptedRange = semver.validRange(packageToLookFor.version);
          if (acceptedRange) {
            const isOnTheRange = semver.satisfies(version, acceptedRange);
            if (isOnTheRange) {
              foundPackageVersion = pkg.copy();
            }
          }
        }
      });
      if (foundPackageVersion) {
        packagesToUpdate.push(foundPackageVersion);
      } else {
        unsupportedPackages
          .push(pkgVersions.versions[pkgVersions.versions.length - 1].copy());
      }
    });
    if (unsupportedPackages.length) {
      return Result.err(unsupportedPackages);
    }
    return Result.ok(packagesToUpdate);
  }
}
