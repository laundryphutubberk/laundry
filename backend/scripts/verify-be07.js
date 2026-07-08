const { spawn } = require('child_process');
const path = require('path');

const backendRoot = path.resolve(__dirname, '..');

const verificationSteps = [
  {
    name: 'Policy unit verification',
    command: 'node',
    args: ['scripts/verify-policy-tests.js'],
  },
  {
    name: 'Service policy verification',
    command: 'node',
    args: ['scripts/verify-service-policy-tests.js'],
  },
  {
    name: 'HTTP policy integration verification',
    command: 'node',
    args: ['scripts/verify-http-policy-tests.js'],
  },
  {
    name: 'Runtime architecture verification',
    command: 'node',
    args: ['scripts/verify-runtime.js'],
  },
];

const runStep = (step) =>
  new Promise((resolve) => {
    const startedAt = Date.now();
    console.log(`\n▶ ${step.name}`);

    const child = spawn(step.command, step.args, {
      cwd: backendRoot,
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || 'test',
      },
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('close', (code) => {
      const durationMs = Date.now() - startedAt;
      const passed = code === 0;

      console.log(`${passed ? '✅' : '❌'} ${step.name} ${passed ? 'passed' : 'failed'} (${durationMs}ms)`);

      resolve({
        name: step.name,
        passed,
        code,
        durationMs,
      });
    });
  });

const run = async () => {
  console.log('BE-07 Verification Orchestrator');
  console.log('================================');

  const results = [];

  for (const step of verificationSteps) {
    const result = await runStep(step);
    results.push(result);

    if (!result.passed) {
      break;
    }
  }

  console.log('\nBE-07 Verification Summary');
  console.log('--------------------------');

  results.forEach((result) => {
    console.log(`${result.passed ? 'PASS' : 'FAIL'} | ${result.name} | ${result.durationMs}ms`);
  });

  const failed = results.find((result) => !result.passed);

  if (failed) {
    console.error(`\nBE-07 verification failed at: ${failed.name}`);
    process.exit(failed.code || 1);
  }

  console.log('\nBE-07 verification passed.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
