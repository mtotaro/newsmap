---
description: Audits TypeScript usage across the codebase for type safety, strict mode compliance, and modern patterns (May 2026). Pass a file/directory to narrow scope.
argument-hint: "[file or directory — optional]"
---

You are a TypeScript expert. Audit this project's TypeScript usage for type safety, correctness, and modern patterns as of TypeScript 5.x (May 2026).

Target: $ARGUMENTS (if empty, audit full project)

## Steps

1. Read `tsconfig.json` to understand current strictness settings.
2. Use Glob to find all `.ts` and `.tsx` files in scope.
3. Read and analyze the files.

## Checks

### Strictness
- `strict: true` enabled in tsconfig? (covers strictNullChecks, noImplicitAny, etc.)
- `noUncheckedIndexedAccess` enabled?
- `exactOptionalPropertyTypes` enabled?
- Report any `tsconfig.json` options that should be tightened

### Type Safety
- Any `any` type usages — can they be replaced with `unknown` + type guard, or a proper type?
- Type assertions (`as SomeType`) that bypass type checking — are they justified?
- Non-null assertions (`!`) where null check would be safer
- `@ts-ignore` / `@ts-expect-error` — are they necessary and documented?

### Generics & Utility Types
- Functions that could benefit from generics to avoid duplication
- Missed opportunities for `Pick`, `Omit`, `Partial`, `Required`, `Record`, `ReturnType`, `Parameters`
- Overly wide types (e.g., `object`, `{}`) where specific interfaces would be safer

### Discriminated Unions & Type Guards
- Error/result types using union types correctly?
- Type guards (`is` predicates) used where needed?
- Exhaustive switch statements on discriminated unions (missing `never` checks)?

### Async & Promises
- Unhandled promise rejections (missing `await`, missing `try/catch`, floating promises)
- `Promise<void>` vs `Promise<unknown>` used appropriately
- `async` functions that don't need to be async

### Imports & Module Resolution
- Type-only imports using `import type` where appropriate
- Barrel exports causing circular dependency risks?

### React + TypeScript
- Component props typed with interfaces (not inline types for reused shapes)
- Event handler types (`React.ChangeEvent`, `React.FormEvent`) used correctly
- `React.FC` avoided in favor of explicit return type or plain function?
- `children` typed correctly (`React.ReactNode`)

### Drizzle ORM Types
- Inferred types from schema used (`typeof table.$inferSelect`) instead of manual duplication?
- Return types of DB queries typed correctly?

## Output format

```
[SEVERITY] Category — Description
File: path/to/file.ts:line
Issue: what's wrong or missing
Fix: concrete recommendation with code snippet if helpful
```

Severity: 🔴 Critical | 🟡 Warning | 🟢 Suggestion

End with: tsconfig recommendations + top 5 type safety improvements.
