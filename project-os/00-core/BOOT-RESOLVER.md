# Boot Resolver

Purpose: Resolve the minimum boot path for a given role and task.

Resolution:
1. Core Boot (identity, mission, runtime)
2. Responsibility Boot (role-specific)
3. Execution Boot (phase/task)
4. Module Boot (current module)

Stop loading when required context is complete.

Never load unrelated domains by default.