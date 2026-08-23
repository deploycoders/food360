# Food360

Food360 is a Turborepo + pnpm SaaS workspace for restaurant menus, ordering,
KDS workflows, and central backend services.

## Development

Run the following command:

```sh
pnpm dev
```

## Apps

- `apps/client`: public WebAR menu and QR Hub on port 3000.
- `apps/admin`: admin dashboard, KDS, and Kanban workflows on port 3001.
- `apps/api`: central backend API on port 3002.

## Packages

- `@food360/types`: shared TypeScript domain interfaces.
- `@food360/database`: Supabase client factories for anon and service-role access.
- `@food360/ui`: shared React UI components.
- `@repo/eslint-config`: ESLint configurations used throughout the monorepo
- `@repo/jest-presets`: Jest configurations
- `@repo/logger`: isomorphic logger (a small wrapper around console.log)
- `@repo/typescript-config`: tsconfig.json's used throughout the monorepo

Each package and app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Jest](https://jestjs.io) test runner for all things JavaScript
- [Prettier](https://prettier.io) for code formatting
