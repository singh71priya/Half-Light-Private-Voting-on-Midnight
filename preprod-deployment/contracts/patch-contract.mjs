import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Define the file paths for both src and dist
const files = [
  './src/managed/bboard/contract/index.js',
  './dist/managed/bboard/contract/index.js'
];

for (const file of files) {
  try {
    let code = readFileSync(file, 'utf8');
    
    // Remove the bad subpath import
    const badImportRegex = /import \* as __compactRuntimeTypes from '[^']+';\n?/;
    if (badImportRegex.test(code)) {
      code = code.replace(badImportRegex, '');
      // Replace all usages with __compactRuntime
      code = code.replace(/__compactRuntimeTypes\./g, '__compactRuntime.');
      writeFileSync(file, code, 'utf8');
      console.log(`Patched ${file} successfully.`);
    } else {
      console.log(`${file} is already clean or does not have the subpath import.`);
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`Error patching ${file}:`, err);
    }
  }
}
