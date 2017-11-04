// @flow

import packageJson from 'package-json';

export default class Package {
  name: string;
  dependencies: Array<Package>;
  version: string;
  constructor(name: string, version: string) {
    this.name = name;
    this.version = version;
  }
  async resolveDependencies() {
    const currentPackage = await packageJson(this.name, {
      version: this.version,
    });
    const dependencies = Object.assign(
      {},
      currentPackage.dependencies || {},
      currentPackage.devDependencies
    );
    this.dependencies = Object.keys(dependencies || {}).map(
      key => new Package(key, dependencies[key])
    );
    return true;
  }
  toString() {
    return `${this.name}@${this.version}`;
  }
  getName() {
    return `${this.name}`;
  }
  dependsOn(packageToUpdate: string): boolean {
    return this.dependencies.length
      ? this.dependencies.some(pkg => pkg.getName() === packageToUpdate)
      : false;
  }
  copy() {
    return new Package(this.name, this.version);
  }
}
