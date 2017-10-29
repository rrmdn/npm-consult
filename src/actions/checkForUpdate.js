// @flow

import DependencyGraph from '../lib/DependencyGraph';

import type {PackageJSONType} from '../utils';

export default async function checkForUpdate(packageDefinition: PackageJSONType,
                                             prompt: any,
                                             packageToUpdate: string,
                                             updateToVersion: string) {
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
