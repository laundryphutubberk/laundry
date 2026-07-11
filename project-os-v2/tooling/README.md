# Project OS V2 Tooling

Status: ACTIVE

Implemented validator:

- execution state shape and lifecycle checks;
- valid document/work status checks;
- one active flow rule;
- required active-flow package and flow-state checks;
- broken local references;
- project-specific content leakage into portable kernel;

Run:

```text
npm run verify
```

The JSON Schemas in `schemas/execution-state.schema.json` and `schemas/flow-state.schema.json` are the portable machine-readable state contracts. Evidence-directory enforcement applies when a flow claims `VERIFIED` or `COMPLETED`.

Tooling PASS applies only to Project OS structural integrity. It does not verify application behavior.
