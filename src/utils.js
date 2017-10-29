// @flow

import path from 'path';
import fs from 'fs';
import Promise from 'bluebird';

export type DependencyType = {
  name: string,
  version: string,
};

export type PackageJSONType = {
  name: string,
  dependencies: DependencyType,
};

const readFileAsync = Promise.promisify(fs.readFile);

export async function loadPkgJSON(fileName: string): ?PackageJSONType {
  const pkgJSONFile = path.join(process.env.PWD, fileName);
  try {
    const rawPkgJson = await readFileAsync(pkgJSONFile);
    return JSON.parse(rawPkgJson.toString('utf-8'));
  } catch (e) {
    console.log(e.message);
    return null;
  }
}

export function noop() {}
