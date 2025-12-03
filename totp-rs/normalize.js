import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { argv } from 'process';


/** @type {'web' | 'node' | 'bundler'} */
let kind = 'web';
if (argv.length > 2) {
    kind = argv[2];
}

/**
 * @typedef {Object} PackageJson
 * @property {string} name - The package name
 * @property {string} type - The module type (either 'commonjs' or 'module')
 * @property {string} description - The package description
 */

/**
 * Reads and parses the package.json file
 * @type {PackageJson}
 */
const target = join('build', `totp-rs-${kind}`, 'pkg', 'package.json');
const pkg = JSON.parse(readFileSync(target));
pkg.type = 'module';
pkg.description = `TOTP implementation in Rust for ${kind}`;
writeFileSync(target, JSON.stringify(pkg, null, 2));
