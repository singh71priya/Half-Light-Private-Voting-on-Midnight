import { readFileSync, writeFileSync } from 'fs';

const filePath = './src/managed/bboard/contract/index.js';
let code = readFileSync(filePath, 'utf8');

const importLine = `import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';`;
const patchedImport = `import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';\nimport * as __compactRuntimeTypes from '@midnight-ntwrk/compact-runtime/dist/compact-types.js';`;

if (!code.includes('__compactRuntimeTypes')) {
  code = code.replace(importLine, patchedImport);
  code = code.replace(/new __compactRuntime\.CompactTypeBoolean/g, '__compactRuntimeTypes.CompactTypeBoolean');
  code = code.replace(/__compactRuntime\.CompactTypeBoolean/g, '__compactRuntimeTypes.CompactTypeBoolean');
  code = code.replace(/__compactRuntime\.CompactType/g, '__compactRuntimeTypes.CompactType');
  writeFileSync(filePath, code, 'utf8');
  console.log('Patched contract index.js to use __compactRuntimeTypes successfully.');
} else {
  console.log('Contract index.js already patched.');
}
