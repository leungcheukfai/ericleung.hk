# Homepage Navigation Consolidation

## Goal

Make the homepage the single authoritative public profile for Eric Leung. Remove redundant About and Contact navigation and standalone pages while preserving clear GEO and search-engine signals.

## User Experience

- Keep the Share control in the profile header.
- Remove the About me and Contact controls from the profile header.
- Remove the About and Contact links from the footer.
- Remove the `/about` and `/contact` pages.
- Keep the existing biography, social cards, and booking card on the homepage as the visible sources of about and contact information.

## GEO and Search Signals

- Treat `/` as the canonical profile and contact destination.
- Keep the existing `Person`, `WebSite`, and `ProfilePage` JSON-LD on the homepage.
- Remove `/about` and `/contact` from the sitemap.
- Update `llms.txt`, `ai.txt`, and the `/ai/*.json` responses so they do not advertise deleted URLs.
- Preserve crawler access and add an explicit `OAI-SearchBot` rule if it is not already covered by a named rule.
- Do not add replacement navigation or new standalone content.

## Implementation Boundaries

- Change only the action configuration, homepage footer, obsolete routes, sitemap, robots configuration, and machine-readable GEO endpoints that reference the removed pages.
- Preserve all unrelated uncommitted work.
- Do not change the visual design of the remaining Share button, cards, biography, or footer.

## Verification

- The homepage renders successfully and returns HTTP 200.
- The header contains Share but not About me or Contact.
- The footer contains neither About nor Contact.
- `/about` and `/contact` no longer render standalone pages.
- Sitemap and machine-readable GEO endpoints contain no references to `/about` or `/contact`.
- Existing source changes outside this scope remain untouched.
