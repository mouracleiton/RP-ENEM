#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directory containing curriculum JSON files
const curriculumDir = __dirname;

// Read all JSON files (excluding package.json, manifest.json, checkpoint files, and this script)
const files = fs.readdirSync(curriculumDir)
  .filter(file =>
    file.endsWith('.json') &&
    file !== 'package.json' &&
    file !== 'manifest.json' &&
    !file.startsWith('.process-catalog')
  )
  .sort();

// Create manifest object
const manifest = {
  version: '1.0',
  generatedAt: new Date().toISOString(),
  totalFiles: files.length,
  files: files
};

// Write manifest file
fs.writeFileSync(
  path.join(curriculumDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log(`Generated manifest with ${files.length} curriculum files:`);
files.forEach(file => console.log(`  - ${file}`));
console.log('\nManifest saved to manifest.json');