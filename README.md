# `ericleung.hk`

Config-driven personal website with a bento layout, private analytics, and Beehiiv-powered newsletter signup.

## License And Attribution

This project is based on [OpenBio](https://github.com/vanxh/openbio) and has been modified for `ericleung.hk`.

- This repository remains licensed under `AGPL-3.0`
- The public site links to the modified source code, original project, and license
- The original `LICENSE` file is preserved in this repository

## What Changed

- Public homepage lives at `/`
- Private analytics and subscriber dashboard lives at `/admin`
- Content is edited in `src/content/site.ts`
- Local assets such as avatar photos should live in `public/`
- Public signup, billing, multi-user dashboard, and profile claiming routes were removed

## Edit Your Personal Info

Update `src/content/site.ts`:

- `siteConfig.title` and `siteConfig.description` control metadata and OG text
- `siteConfig.profile` controls your name, handle, bio, location, avatar, and top action buttons
- `siteConfig.theme` controls the theme preset, dark mode, and accent color
- `siteConfig.cards` controls the bento grid cards shown on the homepage
- `siteConfig.footer.text` controls the footer copy

The card IDs should stay stable because click analytics use `card.id`.

## Card Types

The homepage supports these card types inside `src/content/site.ts`:

- `link`
- `note`
- `image`
- `map`
- `github`
- `countdown`
- `weather`
- `twitter`
- `music`
- `podcasts`
- `youtube-channels`
- `books`
- `favorites`
- `calendar`
- `email-collect`
- `views`

Each card needs:

- `id`
- `type`
- `size`

Optional `position` values let you pin a card on the grid. If you omit `position`, the layout auto-packs in card order.

## Local Development

1. Install dependencies:

```sh
bun install
```

2. Copy the environment file:

```sh
cp .env.example .env
```

3. Set these required variables:

- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `SITE_ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

4. To wire the homepage subscribe card to Beehiiv, also add:

- `BEEHIIV_API_KEY`
- `BEEHIIV_PUBLICATION_ID`

5. Push the schema:

```sh
bun run db:push
```

6. Start the app:

```sh
bun dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Deployment To Vercel

1. Create a Vercel project from this repo.
2. Attach `ericleung.hk` as the production domain.
3. Attach `www.ericleung.hk` and redirect it to the apex domain.
4. Add these environment variables in Vercel:

- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL=https://ericleung.hk`
- `SITE_ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `BEEHIIV_API_KEY`
- `BEEHIIV_PUBLICATION_ID`

5. Run `bun run db:push` once against your production database before or after the first deploy.
6. Redeploy.

Use a managed Postgres database such as Neon for production.

## Analytics And Subscribers

- Page views are stored in `site_view`
- Card clicks are stored in `site_click`
- Homepage email signups are sent to Beehiiv and mirrored into `site_subscriber`
- `/admin` is protected by a password-backed signed cookie
- Subscribers can be exported from `/admin/subscribers.csv`
