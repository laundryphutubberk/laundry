const http = require('node:http');

const DEFAULT_BASE_URL = 'http://localhost:3000';
const baseUrl = process.env.SMOKE_BASE_URL || DEFAULT_BASE_URL;

function requestJson(pathname) {
  const url = new URL(pathname, baseUrl);

  return new Promise((resolve) => {
    const req = http.request(
      url,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
      (res) => {
        let body = '';

        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = body ? JSON.parse(body) : null;
          } catch (_error) {
            parsed = body;
          }

          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            body: parsed,
          });
        });
      },
    );

    req.on('error', (error) => {
      resolve({
        ok: false,
        statusCode: 0,
        error,
      });
    });

    req.end();
  });
}

function printResult(label, result) {
  const status = result.ok ? 'PASS' : 'FAIL';
  console.log(`${status}: ${label} -> ${result.statusCode}`);

  if (!result.ok) {
    if (result.error) {
      console.log(`  error: ${result.error.message}`);
    } else {
      console.log(`  body: ${JSON.stringify(result.body)}`);
    }
  }
}

function extractFirstWorkId(result) {
  const body = result.body;

  if (!body || typeof body !== 'object') {
    return null;
  }

  const candidates = [
    body.data,
    body.items,
    body.data && body.data.items,
    body.result,
    body.result && body.result.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0 && candidate[0] && candidate[0].id) {
      return candidate[0].id;
    }
  }

  return null;
}

async function main() {
  console.log(`Feature-first runtime smoke test`);
  console.log(`Base URL: ${baseUrl}`);

  const checks = [];

  const health = await requestJson('/api/health');
  checks.push(['GET /api/health', health]);

  const works = await requestJson('/api/laundry/works');
  checks.push(['GET /api/laundry/works', works]);

  const firstWorkId = extractFirstWorkId(works);

  if (firstWorkId) {
    const workDetail = await requestJson(`/api/laundry/works/${firstWorkId}`);
    checks.push([`GET /api/laundry/works/${firstWorkId}`, workDetail]);

    const bags = await requestJson(`/api/laundry/works/${firstWorkId}/bags`);
    checks.push([`GET /api/laundry/works/${firstWorkId}/bags`, bags]);
  } else {
    console.log('SKIP: Work detail and bag smoke checks skipped because no Laundry Work id was found.');
  }

  let failed = 0;
  for (const [label, result] of checks) {
    printResult(label, result);
    if (!result.ok) {
      failed += 1;
    }
  }

  if (failed > 0) {
    console.error(`\nSmoke test failed: ${failed} check(s) failed.`);
    process.exitCode = 1;
    return;
  }

  console.log('\nSmoke test passed.');
}

main();
