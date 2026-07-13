# Google Account Linking Foundation Decisions

Status: APPROVED

- Link and unlink intents expire after ten minutes and are bound to the authenticated User and session/access context.
- Password step-up grants expire after five minutes, store only a secret hash and are purpose/target/context bound.
- Provider subject is the ownership key; email remains a snapshot and never links automatically.
- Completion consumes intent and grant transactionally and uses database uniqueness/conditional writes for race safety.
- Unlink marks durable ownership inactive and requires another usable authentication method.
