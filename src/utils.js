// @flow

import path from 'path';
import fs from 'fs';
import Promise from 'bluebird';

type DependencyType = {
  name: string,
  version: string,
};

type PackageJSONType = {
  name: string,
  dependencies: DependencyType,
};

const readFileAsync = Promise.promisify(fs.readFile);

export async function loadPkgJSON(fileName: string): ?PackageJSONType {
  const pkgJSONFile = path.join(process.env.PWD, fileName);
  const rawPkgJson = await readFileAsync(pkgJSONFile);
  return JSON.parse(rawPkgJson.toString('utf-8'));
}

export function noop() {}
