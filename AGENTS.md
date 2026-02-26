# Styling-Only Work Rules

These rules apply to any task explicitly scoped to styling-only changes.

## Hard Constraints
- Do **NOT** change routing.
- Do **NOT** change query parameters.
- Do **NOT** change data fetching.
- Do **NOT** change business logic.
- Do **NOT** change component behavior.
- Do **NOT** rename exports.
- Do **NOT** move files.
- Do **NOT** refactor logic.

## Allowed Change Surface
- Only change styling through:
  - `globals.css`
  - Tailwind theme tokens
  - Shared UI components

## Diff Discipline
- Keep diffs minimal and tightly focused on styling.

## Required Checks Before Finishing
Run all of the following:
- `npm run lint`
- `npm run typecheck` (or `tsc --noEmit` if no typecheck script exists)
- `npm run build`
