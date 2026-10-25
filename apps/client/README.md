# Food360 Client

Public restaurant profiles are resolved by slug at `/<slug>`. The page reads
the public restaurant endpoint from `apps/api` on the server and only renders
fields returned by that endpoint.

## Local development

Start the API and set its URL for Client in `apps/client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

Then run the Client from the repository root:

```sh
pnpm --filter api dev
pnpm --filter client dev
```

Open `http://localhost:3000/<restaurant-slug>`. The API uses the Supabase
anonymous key and honors the existing RLS policies. If anonymous reads are not
allowed for a restaurant, the API will not bypass those policies. No
service-role key belongs in Client configuration.

The current public profile fields are the restaurant name, slug, phone,
address, and currency. The database repository has no public-link collection,
publication flag, description, logo, or cover image contract yet, so the page
does not fabricate those values. The existing `/menu` and `/cart` ordering
routes remain available separately; their current sample catalog is not
connected to the restaurant slug profile.

## Workspace checks

```sh
pnpm --filter client lint
pnpm --filter client check-types
pnpm --filter client build
```
