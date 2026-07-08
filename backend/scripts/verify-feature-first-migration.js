const fs = require('node:fs');
const path = require('node:path');

const backendRoot = path.resolve(__dirname, '..');
const srcRoot = path.join(backendRoot, 'src');

const legacyDirs = [
  'controllers',
  'services',
  'repositories',
  'domain',
  'validators',
];

const legacyImportPatterns = [
  /require\(['\"]\.\.\/controllers\//,
  /require\(['\"]\.\.\/services\//,
  /require\(['\"]\.\.\/repositories\//,
  /require\(['\"]\.\.\/domain\//,
  /require\(['\"]\.\.\/validators\//,
  /require\(['\"]\.\.\/\.\.\/controllers\//,
  /require\(['\"]\.\.\/\.\.\/services\//,
  /require\(['\"]\.\.\/\.\.\/repositories\//,
  /require\(['\"]\.\.\/\.\.\/domain\//,
  /require\(['\"]\.\.\/\.\.\/validators\//,
];

function walkFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function toRelative(filePath) {
  return path.relative(backendRoot, filePath).replace(/\\/g, '/');
}

function checkLegacyDirectories() {
  const findings = [];

  for (const dir of legacyDirs) {
    const absoluteDir = path.join(srcRoot, dir);
    const files = walkFiles(absoluteDir);

    for (const file of files) {
      findings.push(toRelative(file));
    }
  }

  return findings;
}

function checkLegacyImports() {
  const findings = [];
  const sourceFiles = walkFiles(srcRoot).filter((file) => file.endsWith('.js'));

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      if (legacyImportPatterns.some((pattern) => pattern.test(line))) {
        findings.push({
          file: toRelative(file),
          line: index + 1,
          content: line.trim(),
        });
      }
    });
  }

  return findings;
}

function printSection(title) {
  console.log(`\n## ${title}`);
}

function main() {
  const legacyFiles = checkLegacyDirectories();
  const legacyImports = checkLegacyImports();

  printSection('Feature-first migration verification');
  console.log(`Backend root: ${backendRoot}`);

  printSection('Legacy directory files');
  if (legacyFiles.length === 0) {
    console.log('OK: No files found in legacy layer directories.');
  } else {
    legacyFiles.forEach((file) => console.log(`FOUND: ${file}`));
  }

  printSection('Legacy imports');
  if (legacyImports.length === 0) {
    console.log('OK: No legacy layer imports found.');
  } else {
    legacyImports.forEach((finding) => {
      console.log(`FOUND: ${finding.file}:${finding.line} ${finding.content}`);
    });
  }

  if (legacyFiles.length > 0 || legacyImports.length > 0) {
    console.error('\nMigration verification failed. Review findings above before merge.');
    process.exitCode = 1;
    return;
  }

  console.log('\nMigration verification passed.');
}

main();
