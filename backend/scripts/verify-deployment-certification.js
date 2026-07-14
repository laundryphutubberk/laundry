const assert = require('node:assert/strict');

const databaseHealthPath = require.resolve('../src/core/databaseHealth');
const healthPath = require.resolve('../src/core/health');
const previousDatabaseHealth = require.cache[databaseHealthPath];
const previousCommit = process.env.RENDER_GIT_COMMIT;
const previousBranch = process.env.RENDER_GIT_BRANCH;

require.cache[databaseHealthPath] = {
  id: databaseHealthPath,
  filename: databaseHealthPath,
  loaded: true,
  exports: { getDatabaseHealth: async () => ({ status: 'ok', durationMs: 1 }) },
};
delete require.cache[healthPath];
process.env.RENDER_GIT_COMMIT = '0123456789abcdef0123456789abcdef01234567';
process.env.RENDER_GIT_BRANCH = 'main';

const { getHealthStatus } = require('../src/core/health');

getHealthStatus()
  .then((health) => {
    assert.equal(health.status, 'ok');
    assert.equal(health.dependencies.database.status, 'ok');
    assert.deepEqual(health.deployment, {
      certification: 'render-auto-deploy-v1',
      commit: '0123456789abcdef0123456789abcdef01234567',
      branch: 'main',
    });
    console.log('DEPLOYMENT_CERTIFICATION_VERIFY=PASS');
  })
  .finally(() => {
    delete require.cache[healthPath];
    if (previousDatabaseHealth) require.cache[databaseHealthPath] = previousDatabaseHealth;
    else delete require.cache[databaseHealthPath];
    if (previousCommit === undefined) delete process.env.RENDER_GIT_COMMIT;
    else process.env.RENDER_GIT_COMMIT = previousCommit;
    if (previousBranch === undefined) delete process.env.RENDER_GIT_BRANCH;
    else process.env.RENDER_GIT_BRANCH = previousBranch;
  });
