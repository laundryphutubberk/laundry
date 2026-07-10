import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const projectRoot = process.cwd()
const featuresRoot = path.join(projectRoot, 'src', 'features')
const supportedExtensions = new Set(['.js', '.jsx', '.ts', '.tsx'])
const forbiddenSegments = ['/api/', '/stores/', '/repositories/', '/controllers/']

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await collectFiles(absolutePath))
    else if (supportedExtensions.has(path.extname(entry.name))) files.push(absolutePath)
  }

  return files
}

async function collectComponentRoots() {
  const featureEntries = await readdir(featuresRoot, { withFileTypes: true })
  const componentRoots = []

  for (const featureEntry of featureEntries) {
    if (!featureEntry.isDirectory()) continue

    const featureRoot = path.join(featuresRoot, featureEntry.name)
    const childEntries = await readdir(featureRoot, { withFileTypes: true })
    const componentsEntry = childEntries.find((entry) => entry.isDirectory() && entry.name === 'components')

    if (componentsEntry) {
      componentRoots.push({
        featureName: featureEntry.name,
        directory: path.join(featureRoot, componentsEntry.name),
      })
    }
  }

  return componentRoots
}

function getImportSpecifiers(source) {
  const matches = source.matchAll(/(?:import\s+(?:[^'";]+?\s+from\s+)?|export\s+[^'";]+?\s+from\s+|import\s*\()(['"])([^'"]+)\1/g)
  return [...matches].map((match) => match[2])
}

function isForbiddenImport(specifier) {
  const normalized = specifier.replaceAll('\\', '/')
  return forbiddenSegments.some((segment) => normalized.includes(segment))
}

try {
  const componentRoots = await collectComponentRoots()
  const files = []

  for (const componentRoot of componentRoots) {
    const componentFiles = await collectFiles(componentRoot.directory)
    files.push(...componentFiles.map((file) => ({ file, featureName: componentRoot.featureName })))
  }

  const violations = []

  for (const entry of files) {
    const source = await readFile(entry.file, 'utf8')
    for (const specifier of getImportSpecifiers(source)) {
      if (isForbiddenImport(specifier)) {
        violations.push({
          featureName: entry.featureName,
          file: path.relative(projectRoot, entry.file),
          specifier,
        })
      }
    }
  }

  if (violations.length > 0) {
    console.error('Architecture boundary violations found:')
    for (const violation of violations) {
      console.error(`- [${violation.featureName}] ${violation.file}: ${violation.specifier}`)
    }
    process.exitCode = 1
  } else {
    console.log(`Architecture boundary PASS: ${files.length} component files checked across ${componentRoots.length} frontend features.`)
  }
} catch (error) {
  console.error('Architecture verification failed to run.')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
