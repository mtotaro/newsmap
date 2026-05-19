---
description: Audits React 19 component patterns, hooks usage, RSC boundaries, performance, and accessibility. Pass a file/directory to narrow scope.
argument-hint: "[file or directory — optional]"
---

You are a React 19 expert. Audit this project's React components for correctness, performance, and modern patterns as of React 19 / May 2026.

Target: $ARGUMENTS (if empty, audit all components in `components/` and `app/`)

## Steps

1. Fetch the latest React docs for React 19 features:
   - https://react.dev/reference/react
   - https://react.dev/blog/2024/12/05/react-19
2. Use Glob to find all `.tsx` files.
3. Read and analyze each component.

## Checks

### React 19 Specific
- `use()` hook used where appropriate (reading promises/context in render)?
- Server Actions used instead of manual fetch + state for mutations?
- `useFormStatus` / `useFormState` (now `useActionState`) used in forms?
- `useOptimistic` used for optimistic UI updates where relevant?
- `ref` as prop (no more `forwardRef` needed in React 19) — old `forwardRef` still used?

### Server vs Client Component Boundaries
- `"use client"` at the lowest possible level in the tree?
- Server Components passing non-serializable props (functions, class instances) to Client Components?
- Context providers correctly wrapped in Client Components?
- `children` pattern used to pass RSC content through Client Component wrappers?

### Hooks
- Rules of Hooks violations (hooks inside conditionals, loops, nested functions)?
- `useEffect` used for side effects that could be handled differently:
  - Data fetching → RSC fetch or React Query
  - Subscriptions → properly cleaned up in return function
  - Derived state → computed inline or `useMemo`
- `useCallback` / `useMemo` used where genuinely needed (not premature optimization)?
- Missing dependency arrays in `useEffect` / `useCallback` / `useMemo`?
- Stale closures in effects?

### State Management
- State lifted too high (causing unnecessary re-renders of unrelated subtrees)?
- Multiple `useState` that should be `useReducer` (complex related state)?
- URL state (`searchParams`) used instead of local state where appropriate for shareable UI?

### Performance
- Large list renders without virtualization (consider if needed)?
- Components that re-render on every parent render without `memo`?
- Expensive calculations not wrapped in `useMemo`?
- Event handlers recreated on every render without `useCallback` when passed to memoized children?
- `key` prop issues (using index as key in dynamic lists)?

### Component Design
- Components doing too many things (violating Single Responsibility)?
- Prop drilling more than 2-3 levels (should use Context or component composition)?
- Render props / HOC patterns that could be simplified with hooks?

### Accessibility (a11y)
- Interactive elements have accessible labels (`aria-label`, `aria-labelledby`)?
- `role="switch"` toggles have `aria-checked`?
- Images have meaningful `alt` text (or `alt=""` for decorative)?
- Focus management correct after modal/dialog open/close?
- Keyboard navigation works for custom interactive elements?

### Error Handling
- Error boundaries wrapping async/suspense boundaries?
- Loading states handled correctly with `Suspense` or local loading state?

## Output format

```
[SEVERITY] Category — Description
File: path/to/Component.tsx:line
Issue: what's wrong
Fix: recommendation with React 19 pattern if applicable
```

Severity: 🔴 Critical | 🟡 Warning | 🟢 Suggestion

End with: top 3 performance wins + top 3 React 19 upgrade opportunities.
