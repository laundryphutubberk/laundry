import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const projectRoot = process.cwd()
const componentRoot = path.join(projectRoot, 'src', 'features', 'laundry-works', 'components')
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

function getImportSpecifiers(source) {
  const matches = source.matchAll(/(?:import\s+(?:[^'";]+?\s+from\s+)?|export\s+[^'";]+?\s+from\s+|import\s*\()(['"])([^'"]+)\1/g)
  return [...matches].map((match) => match[2])
}

function isForbiddenImport(specifier) {
  const normalized = specifier.replaceAll('\\', '/')
  return forbiddenSegments.some((segment) => normalized.includes(segment))
}

try {
  const files = await collectFiles(componentRoot)
  const violations = []

  for (const file of files) {
    const source = await readFile(file, 'utf8')
    for (const specifier of getImportSpecifiers(source)) {
      if (isForbiddenImport(specifier)) {
        violations.push({ file: path.relative(projectRoot, file), specifier })
      }
    }
  }

  if (violations.length > 0) {
    console.error('Architecture boundary violations found:')
    for (const violation of violations) {
      console.error(`- ${violation.file}: ${violation.specifier}`)
    }
    process.exitCode = 1
  } else {
    console.log(`Architecture boundary PASS: ${files.length} Laundry Work component files checked.`)
  }
} catch (error) {
  console.error('Architecture verification failed to run.')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
