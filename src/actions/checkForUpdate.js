import DependencyGraph from '../lib/DependencyGraph';

export default async function checkForUpdate(packageDefinition, prompt) {
  const result = await prompt(['library name', 'version']);
  const packageToUpdate = result['library name'];
  const version = result.version;
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
  }
  return true;
}
