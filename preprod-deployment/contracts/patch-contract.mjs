import { readFileSync, writeFileSync } from 'fs';

const filePath = './src/managed/bboard/contract/index.js';
let code = readFileSync(filePath, 'utf8');

const importLine = `import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';`;
const patchedImport = `import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';\nimport * as __compactRuntimeTypes from '@midnight-ntwrk/compact-runtime/dist/compact-types.js';`;

// Add the extra import if not already patched
if (!code.includes('__compactRuntimeTypes')) {
  code = code.replace(importLine, patchedImport);
  // Replace all CompactType usages to use the types sub-module
  code = code.replace(/__compactRuntime\.CompactType/g, '__compactRuntimeTypes.CompactType');
  writeFileSync(filePath, code, 'utf8');
  console.log('Patched contract index.js successfully.');
} else {
  console.log('Contract already patched, skipping.');
}
