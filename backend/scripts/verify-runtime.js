const fs = require('fs');
const path = require('path');

require('../src/config/env');
require('../src/core/prisma');
require('../src/core/runtimeShutdown');
require('../src/app');
require('../src/routes');

const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf8');

const schemaChecks = [
  ['generator client', schema.includes('generator client')],
  ['datasource provider', schema.includes('provider = "postgresql"')],

];

const failedChecks = schemaChecks.filter(([, passed]) => !passed);

if (failedChecks.length > 0) {
  const labels = failedChecks.map(([label]) => label).join(', ');
  throw new Error(`Runtime schema verification failed: ${labels}`);
}

console.log('Backend runtime verification loaded successfully.');
