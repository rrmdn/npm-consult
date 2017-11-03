// @flow
import packageVersion from 'pkg-versions';
import Package from './Package';

class PackageVersions {
  name: string;
  versions: Array<Package>;
  constructor(name: string) {
    this.name = name;
    this.versions = [];
  }
  async resolveVersions() {
    const versions = await packageVersion(this.name);
    this.versions = Array.from(versions).map(
      version => new Package(this.name, version)
    );
    await Promise.all(this.versions.map(pkg => pkg.resolveDependencies()));
    return true;
  }
  dependsOn(packageToUpdate: string): boolean {
    return this.versions.length
      ? this.versions.some(pkg => pkg.dependsOn(packageToUpdate))
      : false;
  }
}

export default PackageVersions;
