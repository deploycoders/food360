# Food360 Linktree

Digital restaurant hub and ordering flow for the Food360 workspace.

## Getting Started

From the repository root, install dependencies and run this app:

```sh
pnpm install
pnpm --filter linktree dev
```

Open [http://localhost:3003](http://localhost:3003).

To persist orders through `apps/api`, copy `.env.example` to `.env.local` and
set `NEXT_PUBLIC_RESTAURANT_ID` to the restaurant UUID in Supabase. Set
`NEXT_PUBLIC_API_URL=http://localhost:3002` for the local API. Without those
values, the menu remains usable in local mode without persistence.

Useful workspace commands:

```sh
pnpm --filter linktree check-types
pnpm --filter linktree lint
pnpm --filter linktree build
```

The app uses [Next.js](https://nextjs.org) and the App Router.
