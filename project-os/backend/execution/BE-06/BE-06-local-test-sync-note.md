# BE-06 Local Test Sync Note

Status: Action Required

Recent local test output still shows stale files and Vitest v4.

Before running backend tests again, make sure the local workspace is synced with branch `test/step-e10-ci-flow`.

Recommended clean sync flow:

```text
git status
git stash push -u -m local-before-be06-test-fix
git pull --rebase
cd fieldops-be
rmdir /s /q node_modules
npm install
npm ls vitest
npm run test:run
```

Expected test runner after install:

```text
vitest 3.x
```

The active test discovery is controlled by:

```text
fieldops-be/vitest.config.js
```

This config intentionally excludes placeholder test files that contain zero test suites.
