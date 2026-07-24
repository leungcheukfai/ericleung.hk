# Homepage Navigation Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/` the only public profile and contact destination by removing redundant navigation, standalone pages, and stale GEO references.

**Architecture:** Keep the homepage and its existing `Person`, `WebSite`, and `ProfilePage` JSON-LD as the authoritative entity page. Remove UI and route duplication, then point every machine-readable discovery response at the canonical site origin. Preserve all unrelated working-tree changes.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Bun, Next.js Metadata Routes

## Global Constraints

- Keep the Share control in the profile header.
- Remove About me and Contact from the header and About and Contact from the footer.
- Remove the `/about` and `/contact` pages without adding replacement pages.
- Keep the existing biography, social cards, booking card, and homepage structured data.
- Preserve all unrelated uncommitted work.
- Do not change the remaining visual design.
- Do not create implementation commits because the affected files already contain user-owned uncommitted work and the user did not request commits.

---

### Task 1: Remove Redundant Homepage Navigation

**Files:**
- Modify: `src/content/site.ts:211-219`
- Modify: `src/app/page.tsx:132-150`

**Interfaces:**
- Consumes: `siteConfig.profile.actions` rendered by `SiteHeader`
- Produces: An empty action list and a footer without About or Contact links

- [x] **Step 1: Run the failing navigation regression check**

```bash
rg -n "About me|href=\"/about\"|href=\"/contact\"" src/content/site.ts src/app/page.tsx
```

Expected: the command prints the two profile actions and the two footer anchors, proving the redundant navigation still exists.

- [x] **Step 2: Remove the profile actions**

Replace the `actions` value in `src/content/site.ts` with:

```ts
actions: [],
```

- [x] **Step 3: Remove the footer anchors**

Delete these two elements from `src/app/page.tsx` and leave every other footer link unchanged:

```tsx
<a
  className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
  href="/about"
>
  About
</a>
<a
  className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
  href="/contact"
>
  Contact
</a>
```

- [x] **Step 4: Run the passing navigation regression check**

```bash
if rg -n "About me|href=\"/about\"|href=\"/contact\"" src/content/site.ts src/app/page.tsx; then
  exit 1
fi
```

Expected: exit 0 with no matches.

- [x] **Step 5: Verify the rendered homepage navigation**

```bash
curl --fail --silent --show-error http://localhost:3000/ > /tmp/ericleunghk-home.html
rg -o ">Share<" /tmp/ericleunghk-home.html
if rg -n ">About me<|>About<|>Contact<" /tmp/ericleunghk-home.html; then
  exit 1
fi
```

Expected: `>Share<` is printed; the command exits 0 without finding About me, About, or Contact controls.

### Task 2: Remove Standalone Routes and Consolidate GEO Responses

**Files:**
- Delete: `src/app/about/page.tsx`
- Delete: `src/app/contact/page.tsx`
- Modify: `src/app/llms.txt/route.ts`
- Verify unchanged: `src/app/.well-known/ai.txt/route.ts`
- Modify: `src/app/ai/summary.json/route.ts`
- Modify: `src/app/ai/faq.json/route.ts`
- Modify: `src/app/ai/service.json/route.ts`

**Interfaces:**
- Consumes: `getSiteOrigin()` and `siteConfig`
- Produces: Machine-readable profile, FAQ, and service responses that reference only the canonical homepage

- [x] **Step 1: Run the failing route-reference regression check**

```bash
rg -n "(/about|/contact|aboutUrl|contactUrl)" \
  src/app/about \
  src/app/contact \
  src/app/llms.txt \
  src/app/.well-known/ai.txt \
  src/app/ai
```

Expected: matches are printed from the standalone pages and machine-readable responses.

- [x] **Step 2: Delete the standalone page modules**

Delete `src/app/about/page.tsx` and `src/app/contact/page.tsx`. Remove their now-empty directories.

- [x] **Step 3: Point `llms.txt` to the canonical homepage**

Replace the `body` template in `src/app/llms.txt/route.ts` with:

```ts
const body = `# ${siteConfig.title}

> ${siteConfig.description}

## Profile
- ${origin}/ — biography, projects, interests, social profiles, and ways to connect with Eric Leung.

## Topics
AI, emerging technology, smart home innovation, go-to-market strategy, Hong Kong, Buddhist wisdom, space, books, podcasts, and product building.

## Canonical source
${origin}/
`;
```

- [x] **Step 4: Consolidate `summary.json`**

Replace the URL fields in `src/app/ai/summary.json/route.ts`:

```ts
url: origin,
profileUrl: `${origin}/`,
topics: ['AI', 'emerging technology', 'smart home', 'go-to-market strategy', 'Hong Kong'],
```

Remove `aboutUrl` and `contactUrl`.

- [x] **Step 5: Consolidate the FAQ contact answer**

Use this question object in `src/app/ai/faq.json/route.ts`:

```ts
{
  question: 'How can I contact Eric Leung?',
  answer: `Visit ${origin}/ to find social links or book a meeting.`,
},
```

- [x] **Step 6: Consolidate the service contact URL**

Use this property in `src/app/ai/service.json/route.ts`:

```ts
contact: `${origin}/`,
```

- [x] **Step 7: Run the passing route-reference regression check**

```bash
test ! -e src/app/about/page.tsx
test ! -e src/app/contact/page.tsx
if rg -n "(/about|/contact|aboutUrl|contactUrl)" \
  src/app/llms.txt \
  src/app/.well-known/ai.txt \
  src/app/ai; then
  exit 1
fi
```

Expected: exit 0 with both page modules absent and no stale route references.

### Task 3: Update Discovery Metadata and Verify End to End

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/robots.ts`
- Verify: `src/components/site/structured-data.tsx`

**Interfaces:**
- Consumes: `getSiteOrigin()`
- Produces: A sitemap without deleted routes and an explicit search-crawler allow rule

- [x] **Step 1: Run the failing discovery regression check**

```bash
rg -n "(/about|/contact|OAI-SearchBot)" src/app/sitemap.ts src/app/robots.ts
```

Expected: `/about` and `/contact` are present in the sitemap, while `OAI-SearchBot` is absent.

- [x] **Step 2: Remove deleted routes from the sitemap**

The returned sitemap array in `src/app/sitemap.ts` must contain only these URL values:

```ts
`${BASE_URL}/`
`${BASE_URL}/legal/privacy`
`${BASE_URL}/legal/terms`
```

Delete the complete `/about` and `/contact` entries without changing the remaining metadata.

- [x] **Step 3: Add the OpenAI search crawler to the named rule**

Use this `userAgent` array for the existing AI crawler rule in `src/app/robots.ts`:

```ts
userAgent: [
  'OAI-SearchBot',
  'GPTBot',
  'ClaudeBot',
  'PerplexityBot',
  'Google-Extended',
],
```

Keep its existing `allow` and `disallow` values.

- [x] **Step 4: Run source-level verification**

```bash
if rg -n "(/about|/contact|About me)" \
  src/app/page.tsx \
  src/app/sitemap.ts \
  src/app/llms.txt \
  src/app/.well-known/ai.txt \
  src/app/ai \
  src/content/site.ts; then
  exit 1
fi
rg -n "OAI-SearchBot" src/app/robots.ts
rg -n "'@type': 'Person'|'@type': 'ProfilePage'" src/components/site/structured-data.tsx
```

Expected: no stale About/Contact matches; `OAI-SearchBot`, `Person`, and `ProfilePage` are printed.

- [x] **Step 5: Verify the live endpoints**

```bash
curl --fail --silent --show-error http://localhost:3000/ > /tmp/ericleunghk-final-home.html
curl --fail --silent --show-error http://localhost:3000/sitemap.xml > /tmp/ericleunghk-sitemap.xml
curl --fail --silent --show-error http://localhost:3000/robots.txt > /tmp/ericleunghk-robots.txt
curl --fail --silent --show-error http://localhost:3000/llms.txt > /tmp/ericleunghk-llms.txt
curl --fail --silent --show-error http://localhost:3000/ai/summary.json > /tmp/ericleunghk-summary.json
curl --fail --silent --show-error http://localhost:3000/ai/faq.json > /tmp/ericleunghk-faq.json
curl --fail --silent --show-error http://localhost:3000/ai/service.json > /tmp/ericleunghk-service.json
if rg -n "(/about|/contact|About me)" /tmp/ericleunghk-*; then
  exit 1
fi
```

Expected: every canonical endpoint returns successfully and no response references a removed route.

- [x] **Step 6: Verify removed routes and working-tree preservation**

```bash
test "$(curl --silent --output /dev/null --write-out '%{http_code}' http://localhost:3000/about)" = "404"
test "$(curl --silent --output /dev/null --write-out '%{http_code}' http://localhost:3000/contact)" = "404"
git status --short
git diff --check
```

Expected: both removed routes return 404, `git diff --check` exits 0, and `git status` shows only the existing user changes plus this scoped implementation plan and implementation edits.
