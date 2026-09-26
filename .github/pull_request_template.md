## Summary

<!-- What does this PR do? Why is it needed? Link any related issues. -->

Fixes #

## Changes

<!-- List the concrete changes made. Be specific — no vague descriptions. -->

- 

## Testing

<!-- Describe how you verified the change. Commands run, manual steps, screenshots. -->

- [ ] `pytest --tb=short` passes with 0 failures
- [ ] `flake8 . --count` returns 0 errors
- [ ] `black --check .` passes
- [ ] `python manage.py check` passes
- [ ] `python manage.py makemigrations --check --dry-run` — no pending migrations

## Checklist

- [ ] Self-reviewed the diff before opening PR
- [ ] New tests added for new behavior (or existing tests updated)
- [ ] No secrets, credentials, or `.env` values committed
- [ ] `SECURITY.md` updated if this changes a security surface
- [ ] `DEPLOYMENT.md` updated if this changes the deployment procedure
- [ ] Migration squash not required (or done if required)
