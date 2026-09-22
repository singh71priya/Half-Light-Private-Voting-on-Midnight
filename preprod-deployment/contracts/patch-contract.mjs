// This script is kept for CI compatibility but is intentionally a no-op.
// The compact-runtime v0.16.0 already exports CompactTypeBytes, CompactTypeEnum,
// CompactTypeVector, CompactTypeUnsignedInteger, and CompactTypeBoolean from its
// main entry point, so no patching is required.
import { readFileSync, writeFileSync } from 'fs';

const filePath = './src/managed/bboard/contract/index.js';
let code = readFileSync(filePath, 'utf8');

// Remove any stale __compactRuntimeTypes patches that may have been applied
if (code.includes('__compactRuntimeTypes')) {
  code = code.replace(/\nimport \* as __compactRuntimeTypes from[^\n]+\n/, '\n');
  code = code.replace(/__compactRuntimeTypes\.CompactType/g, '__compactRuntime.CompactType');
  writeFileSync(filePath, code, 'utf8');
  console.log('Removed stale __compactRuntimeTypes patch from contract index.js');
} else {
  console.log('Contract index.js is clean, no patch needed.');
}
