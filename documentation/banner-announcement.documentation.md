# NileCart Banner & Announcement CMS — User & Developer Reference

*Dynamic marketing content: hero banners, promotional visuals, and storefront announcement bars — managed from the Admin Dashboard without code deploys.*

---

# Part A — User Perspective

*For customers, product managers, marketing teams, business stakeholders, and anyone who does not need code-level detail.*

---

## A.1 What Is the Banner & Announcement System?

NileCart’s **Banner & Announcement CMS** lets platform admins create, schedule, target, and publish marketing content that appears automatically on the storefront.

There are two main content types:

| Content | Where shoppers see it | Typical use |
|---------|----------------------|-------------|
| **Banner** | Homepage hero carousel (and future placements by type) | Seasonal campaigns, sale visuals, collection launches |
| **Announcement** | Thin bar above (or sticky with) the site header | Free-shipping notices, maintenance messages, flash offers |

Both are controlled entirely from the **Admin Dashboard**. Marketing can go live, pause, or expire **without a developer redeploying the website**.

---

## A.2 Why It Matters

### For everyday shoppers

| Benefit | What it means for you |
|---------|------------------------|
| **Relevant offers** | You see current campaigns, not outdated hardcoded sale text |
| **Clear CTAs** | Banner buttons and announcement bars can link to products, categories, or pages |
| **Better mobile experience** | Banners can use a separate mobile image sized for phones |
| **Less clutter** | You can dismiss most announcement bars for the session |

### For marketing & business stakeholders

| Benefit | What it means for the business |
|---------|--------------------------------|
| **No deploy dependency** | Publish, unpublish, and reorder content from Admin |
| **Campaign scheduling** | Set start and end times so sales go live automatically |
| **Audience control** | Show content to everyone, guests only, or logged-in users; desktop and/or mobile |
| **Priority & order** | Control which announcement wins and how banners are ordered |
| **Deep links** | Send shoppers to products, categories, brands, collections, custom pages, or external URLs |
| **Preview before publish** | Admin forms include live previews (banner desktop/mobile; announcement colors) |

---

## A.3 Banner Types

Admins pick a **type** when creating a banner. Today the homepage carousel primarily uses **Hero** banners. Other types are stored for placement and filtering as the homepage CMS expands.

| Type | Label | Typical purpose |
|------|-------|-----------------|
| `hero` | Hero Banner | Main homepage carousel |
| `promotional` | Promotional Banner | General promo strips / campaigns |
| `category` | Category Banner | Drive traffic to a category |
| `offer` | Offer Banner | Discount / deal creatives |
| `collection` | Collection Banner | Featured collections |
| `flash_sale` | Flash Sale Banner | Time-bound flash sale creatives |

---

## A.4 Announcement Types

| Type | Label | Typical purpose |
|------|-------|-----------------|
| `top_bar` | Top Notification Bar | Default bar above the header (scrolls away) |
| `sticky` | Sticky Announcement | Stays with the sticky header while scrolling |
| `campaign` | Campaign Message | Marketing campaign callouts |
| `seasonal` | Seasonal Offer | Festival / seasonal messaging |
| `shipping` | Shipping Update | Free shipping, delays, policy notes |
| `maintenance` | Maintenance Notice | Planned downtime / system messages |

Only the **highest-priority active** announcement (that matches schedule + targeting) is shown on the storefront at a time.

---

## A.5 Who Can Do What?

| Action | Admin | Seller | Customer | Guest |
|--------|-------|--------|----------|-------|
| Create / edit / reorder / publish banners | Yes | No | No | No |
| Create / edit / publish announcements | Yes | No | No | No |
| Upload banner images (S3) | Yes | No* | No | No |
| See active banners on home | Yes | Yes | Yes | Yes (if targeting allows) |
| See active announcement bar | Yes | Yes | Yes | Yes (if targeting allows) |
| Dismiss announcement (session) | Yes | Yes | Yes | Yes (when dismissible) |

\*Sellers have other upload folders (store logos/banners, products). **Platform banners** use the admin `platform-banners` folder.

---

## A.6 Admin Workflows — Banners

### Create a banner

1. Log in to **Admin Dashboard** → **All Banners** → **Create Banner** (or nav **Create Banner**)
2. Choose **Type** (usually Hero for homepage)
3. Enter **Title**, optional subtitle and description
4. Upload **Desktop image** (required) and optional **Mobile image**
5. Set **CTA text** and a **deep link** (product / category / brand / collection / page / external URL)
6. Set **Display order** (lower = earlier in carousel) and **Priority** (higher wins ties)
7. Optionally set **Starts at** / **Ends at**
8. Configure **Targeting**: devices (all / desktop / mobile) and visibility (everyone / guests / logged-in)
9. Toggle **Published (active)** and use the live **Desktop / Mobile preview**
10. Save — content appears on the storefront after the next cache refresh (~60 seconds)

### Reorder banners

On **All Banners**, use the **up / down** arrows on each card. Order is saved via the admin reorder API and reflected in the homepage carousel.

### Publish / unpublish

Use **Publish** / **Unpublish** on a banner card, or uncheck **Published** in the edit form. Unpublished banners never appear on the public storefront.

### Remove a banner

**Remove** soft-deactivates the banner (`isActive: false`). It stops showing publicly but remains in the admin list for reactivation or editing.

### Status badges (admin catalog)

| Badge | Meaning |
|-------|---------|
| **Live** | Active and inside the schedule window (or no schedule) |
| **Scheduled** | Active but start time is still in the future |
| **Expired** | Active but end time is in the past |
| **Draft** | Not active (`isActive: false`) |

---

## A.7 Admin Workflows — Announcements

### Create an announcement

1. **Admin Dashboard** → **All Announcements** → **Create Announcement**
2. Choose **Type** (e.g. Top Notification Bar or Sticky)
3. Write the **Message** (keep it short — it appears in a thin bar)
4. Optionally set **Background** and **Text** colors (live preview updates as you type)
5. Add an optional **deep link** so the whole message is tappable
6. Set **Priority** (higher shows first when multiple are eligible)
7. Optionally schedule **Starts at** / **Ends at**
8. Configure **Targeting** and whether the bar is **Dismissible**
9. Toggle **Active** and save

### Publish / deactivate

Use **Activate** / **Deactivate** on the catalog card, or the Active checkbox on the form. **Deactivate** (and the destructive remove action) soft-hides the announcement — it is not hard-deleted from the database.

---

## A.8 What Shoppers See on the Storefront

### Homepage hero

1. Open the NileCart storefront home page
2. If active hero banners exist (and match device/auth targeting), a **carousel** appears
3. Desktop uses the desktop image; phones prefer the mobile image when provided
4. **CTA** buttons navigate to the resolved deep link (product, category, page, etc.)
5. If no banners are active, the hero section is **hidden** (no hardcoded Unsplash fallback)

### Announcement bar

1. On the **home page only**, the top eligible announcement may appear
2. Colors come from admin settings (or a default amber gradient if unset)
3. If a link is configured, the message is clickable
4. If **Dismissible**, an **X** hides it for the browser session (keyed by announcement id)
5. **Sticky** type keeps the bar with the sticky header while scrolling; other types sit above the header and scroll away

Content updates after Admin changes are visible within about **one minute** (ISR / CDN cache), without redeploying the Next.js app.

---

## A.9 Scheduling & Targeting Rules (Plain Language)

| Rule | Meaning |
|------|---------|
| **Active required** | Inactive content never shows publicly |
| **Schedule window** | Optional start/end; empty dates mean “always” (while active) |
| **One announcement** | Highest priority eligible announcement wins |
| **Banner order** | Sorted by display order ascending, then priority |
| **Devices** | All devices, or desktop-only / mobile-only |
| **Auth visibility** | Everyone, guests only, or logged-in users only |
| **Deep links** | Preferred over legacy plain URL fields when both exist |

---

## A.10 What Is Not Available Yet

| Feature | Status |
|---------|--------|
| Admin UI for Home Sections drag layout | API exists; no full builder UI yet |
| Campaigns / Flash Sales / Collections admin CRUD pages | Backend models + public APIs exist; dashboard UIs deferred |
| Version history / audit trail of content edits | Not implemented |
| Country / region / segment audience rules | Not implemented (device + auth only) |
| Redis / edge marketing cache layer | Relies on HTTP Cache-Control + Next revalidate |
| Multiple simultaneous announcement bars | Only top priority announcement is composed on `/home` |

---

---

# Part B — Developer Perspective

*For engineers implementing, integrating, or maintaining the marketing CMS.*

---

## B.1 Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│  nileCart-dashboard (Admin)                                     │
│  Banners / BannerForm  → CRUD + reorder + status                │
│  Announcements / Form  → CRUD + status                          │
│  ImageUpload           → S3 presign (platform-banners)          │
└───────────────────────────────┬─────────────────────────────────┘
                                │ JWT admin
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  nileCart-server                                                │
│  Banner / Announcement models + targeting + deepLink            │
│  GET /home  — compose announcement + sections (hero banners…)   │
│  GET /banners, GET /announcements — public filtered lists       │
│  /admin/banners, /admin/announcements — management APIs         │
│  optionalAuth on public routes for auth targeting               │
└───────────────────────────────┬─────────────────────────────────┘
                                │ SSR / revalidate 60s
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  nileCart-next-web (Storefront)                                 │
│  fetchHome() + getHeroBanners() → Header + Banner components    │
│  Device from User-Agent; cookie forwarded for auth targeting    │
└─────────────────────────────────────────────────────────────────┘
```

**Layering (server):** Model → Repository → Service → Controller → Route

**Source of truth files:**

| Area | Path |
|------|------|
| Banner model | `src/models/Banner.js` |
| Announcement model | `src/models/Announcement.js` |
| Deep link schema | `src/models/schemas/deepLink.schema.js` |
| Targeting schema | `src/models/schemas/targeting.schema.js` |
| Marketing enums | `src/constants/marketing.js` |
| Schedule helpers | `src/utils/helpers/scheduleHelpers.js` |
| Targeting helpers | `src/utils/helpers/targetingHelpers.js` |
| Deep link helpers | `src/utils/helpers/deepLinkHelpers.js` |
| Formatters | `src/utils/helpers/storedImageHelpers.js` |
| Banner service | `src/services/banner.service.js` |
| Announcement service | `src/services/announcement.service.js` |
| Home composition | `src/services/home.service.js` |
| Public routes | `src/routes/banner.routes.js`, `announcement.routes.js`, `home.routes.js` |
| Admin routes | `src/routes/admin.routes.js` |
| Admin UI | `nileCart-dashboard/src/pages/admin/Banners.jsx`, `BannerForm.jsx`, `AnnouncementsList.jsx`, `AnnouncementForm.jsx` |
| Admin components | `nileCart-dashboard/src/components/admin/BannerForm.jsx`, `BannerCatalog.jsx`, `AnnouncementForm.jsx`, `AnnouncementCatalog.jsx`, `MarketingFields.jsx` |
| Storefront data | `nileCart-next-web/src/lib/data/home.js` |
| Storefront UI | `nileCart-next-web/src/components/banner.jsx`, `header.jsx`, `app/page.js` |

---

## B.2 Database Schema

### Shared: `deepLink`

| Field | Type | Description |
|-------|------|-------------|
| `kind` | Enum | `product`, `category`, `brand`, `collection`, `external`, `page` |
| `ref` | String | Slug or id (product/category/brand/collection) |
| `url` | String | Absolute URL (external) or path (page) |

Resolved to storefront `ctaHref` / `href` via `resolveDeepLink()`:

| Kind | Resolved path |
|------|----------------|
| `product` | `/product/{ref}` |
| `category` | `/category/{ref}` |
| `brand` | `/brand/{ref}` |
| `collection` | `/collections/{ref}` |
| `external` | `url` as provided |
| `page` | `url` or `/{ref}` |

### Shared: `targeting`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `devices` | String[] | `["all"]` | `all`, `desktop`, `mobile` |
| `auth` | String | `"all"` | `all`, `guest`, `authenticated` |

### Banner

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | String | Yes | — | Primary headline |
| `subtitle` | String | No | — | Eyebrow / sale line |
| `description` | String | No | — | Supporting copy |
| `type` | Enum | No | `hero` | See banner types |
| `image` | `{ url, key }` | Yes (create) | — | Desktop / default image (S3) |
| `mobileImage` | `{ url, key }` | No | — | Mobile crop; public API falls back to `image` |
| `ctaText` | String | No | `"Shop Now"` | Button label |
| `ctaLink` | String | No | — | Legacy flat URL; synced from deepLink when possible |
| `deepLink` | Object | No | — | Structured navigation target |
| `displayOrder` | Number | No | `0` | Ascending carousel order |
| `priority` | Number | No | `0` | Tie-break (desc) |
| `isActive` | Boolean | No | `true` | Publish flag |
| `startsAt` / `endsAt` | Date | No | — | Schedule window |
| `targeting` | Object | No | all/all | Device + auth rules |

**Indexes:** `{ isActive, type, displayOrder }`, `{ startsAt, endsAt }`

**Delete behavior:** soft — sets `isActive: false`.

### Announcement

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `message` | String | Yes | — | Bar text |
| `type` | Enum | No | `top_bar` | See announcement types |
| `isActive` | Boolean | No | `true` | Publish flag |
| `priority` | Number | No | `0` | Higher = preferred on `/home` |
| `startsAt` / `endsAt` | Date | No | — | Schedule window |
| `backgroundColor` | String | No | — | CSS color |
| `textColor` | String | No | — | CSS color |
| `link` | String | No | — | Legacy flat URL |
| `deepLink` | Object | No | — | Structured target |
| `dismissible` | Boolean | No | `true` | Allow session dismiss |
| `targeting` | Object | No | all/all | Device + auth rules |

**Indexes:** `{ isActive, priority }`, `{ startsAt, endsAt }`

**Delete behavior:** soft — sets `isActive: false` (aligned with banners).

### Home composition (related)

`HomeSection` with type `hero_banner` resolves active banners into `GET /home` → `sections[].data.banners`. Default sections are seeded from `src/constants/homeSections.js` when the collection is empty. Top-level `announcement` on `/home` is **not** taken from an `announcement_bar` section payload; it is the highest-priority matching announcement document.

---

## B.3 Public Visibility Pipeline

Public list and home composition apply filters in this order:

1. **`isActive: true`**
2. **Schedule** via `publicActiveFilter()` / `getActiveDateFilter()` in `scheduleHelpers.js`  
   - Null/missing start and end ⇒ always in window  
   - Otherwise `startsAt ≤ now` and `endsAt ≥ now` as applicable
3. **Targeting** via `filterByTargeting(docs, audience)` in `targetingHelpers.js`

### Audience context

Built by `buildAudienceContext(req)`:

| Signal | Source |
|--------|--------|
| `device` | Query `?device=desktop\|mobile`, else User-Agent heuristic |
| `auth` | `authenticated` if `optionalAuth` attached `req.user`, else `guest` |

Public marketing routes mount `optionalAuth` so a cookie/Bearer (when present) enables authenticated targeting without requiring login.

### Sorting

| Entity | Sort |
|--------|------|
| Banners | `displayOrder` ASC, then `priority` DESC |
| Announcements | `priority` DESC, then `createdAt` DESC |
| Home top announcement | First after announcement sort + targeting filter |

### Caching

| Layer | Behavior |
|-------|----------|
| HTTP | `Cache-Control: public, s-maxage=60, stale-while-revalidate=120` on public marketing GETs (`MARKETING_CACHE_CONTROL`) |
| Next SSR | `serverGet(..., { revalidate: 60 })` |
| Images | S3 public URLs via existing upload/presign flow (`platform-banners`) |

There is **no cron** to publish/expire marketing content — expiry is **query-time**.

---

## B.4 API Reference

Base path assumes API prefix `/api` (as mounted by the server).

### Public — banners

| Method | Endpoint | Auth | Action |
|--------|----------|------|--------|
| `GET` | `/banners?device=` | Optional | Active, scheduled, targeted banners |

### Public — announcements

| Method | Endpoint | Auth | Action |
|--------|----------|------|--------|
| `GET` | `/announcements?device=` | Optional | Active list (targeted) |
| `GET` | `/announcements/:id` | Optional | Single active announcement |

### Public — home composition

| Method | Endpoint | Auth | Action |
|--------|----------|------|--------|
| `GET` | `/home?device=` | Optional | `{ announcement, sections[], popup }` |

Hero banners live under a `hero_banner` section’s `data.banners`. Storefront may fall back to `GET /banners` if the hero section is empty.

### Admin — banners (`protect` + `authorize("admin")`)

| Method | Endpoint | Action |
|--------|----------|--------|
| `GET` | `/admin/banners` | List all (dashboard shape with `{ url, key }` images) |
| `POST` | `/admin/banners` | Create (`title` + `image` required) |
| `PUT` | `/admin/banners/reorder` | Body `{ items: [{ id, displayOrder }] }` |
| `PUT` | `/admin/banners/:id` | Update allowlisted fields |
| `PATCH` | `/admin/banners/:id/status` | Toggle / set `isActive` |
| `DELETE` | `/admin/banners/:id` | Soft deactivate |

### Admin — announcements

| Method | Endpoint | Action |
|--------|----------|--------|
| `GET` | `/admin/announcements` | List all |
| `POST` | `/admin/announcements` | Create (`message` required) |
| `PUT` | `/admin/announcements/:id` | Update |
| `PATCH` | `/admin/announcements/:id/status` | Toggle / set `isActive` |
| `DELETE` | `/admin/announcements/:id` | Soft deactivate |

### Public response shape (banner)

Important public fields (via `formatBannerForPublic`):

```json
{
  "_id": "...",
  "title": "Summer Collection 2026",
  "subtitle": "Up To 70% OFF",
  "description": "...",
  "type": "hero",
  "image": "https://cdn.example/desktop.jpg",
  "mobileImage": "https://cdn.example/mobile.jpg",
  "ctaText": "Shop Now",
  "ctaLink": "/sale",
  "ctaHref": "/sale",
  "deepLink": { "kind": "page", "url": "/sale" },
  "displayOrder": 10,
  "priority": 0,
  "startsAt": null,
  "endsAt": null
}
```

### Public response shape (announcement on `/home`)

```json
{
  "_id": "...",
  "message": "Free shipping above ₹999",
  "type": "top_bar",
  "backgroundColor": "#111111",
  "textColor": "#ffffff",
  "priority": 10,
  "dismissible": true,
  "link": null,
  "href": "/shipping",
  "deepLink": { "kind": "page", "url": "/shipping" }
}
```

---

## B.5 Deep Links & Legacy URLs

- Prefer structured `deepLink` in admin forms.
- On create/update, services call `normalizeDeepLink` and may sync `ctaLink` / `link` via `legacyUrlFromDeepLink`.
- Public formatters always expose resolved `ctaHref` (banners) or `href` (announcements), falling back to legacy string fields.
- Storefront should navigate using `ctaHref` / `href` first.

---

## B.6 Frontend Implementation

### Admin dashboard

| Route | Purpose |
|-------|---------|
| `/admin/banners` | Catalog, reorder, publish, soft-remove |
| `/admin/banners/new` | Create |
| `/admin/banners/:id/edit` | Edit + preview |
| `/admin/announcements` | Catalog |
| `/admin/announcements/new` | Create |
| `/admin/announcements/:id/edit` | Edit + color preview |

Shared UI pieces:

- `MarketingFields.jsx` — deep link + targeting controls  
- `bannerUtils.js` / `announcementUtils.js` — form ↔ API payload mapping, schedule helpers  
- `constants/marketing.js` — type labels mirrored from server enums  

Client API: `nileCart-dashboard/src/services/adminService.js`  
(`listBanners`, `createBanner`, `reorderBanners`, `toggleBannerStatus`, `listAnnouncements`, `toggleAnnouncementStatus`, …)

Uploads: `ImageUpload` → folder `UPLOAD_FOLDERS.PLATFORM_BANNERS` (`platform-banners`).

### Storefront (Next.js)

| Piece | Behavior |
|-------|----------|
| `lib/data/home.js` | `detectDevice()`, `fetchHome()`, `getHeroBanners()` with `/banners` fallback |
| `app/page.js` | SSR parallel fetch home + products + categories; pass props |
| `components/banner.jsx` | Client carousel; props `banners`; CTA via `Link`; mobile/desktop images |
| `components/header.jsx` | Props `announcement`; session dismiss key `nilecart-announcement-dismissed:{id}`; sticky vs top_bar placement |

`serverGet` with `authenticated: true` forwards the `token` cookie when present so home/banners can honor auth targeting without failing for guests.

---

## B.7 End-to-End Lifecycle

```text
Admin creates banner/announcement (active + schedule + targeting)
        │
        ▼
MongoDB document persisted (images as { url, key } on S3)
        │
        ▼
Public GET /home or /banners|/announcements
  → schedule filter → targeting filter → format (URLs + ctaHref)
        │
        ▼
Next SSR caches ~60s → Header + Banner render
        │
        ▼
Admin unpublishes / schedule ends
        │
        ▼
Next request after revalidate → content disappears (no deploy)
```

---

## B.8 API Examples

### Create hero banner (admin)

```http
POST /api/admin/banners
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Summer Collection 2026",
  "subtitle": "Up To 70% OFF",
  "description": "Discover trendy dresses and accessories.",
  "type": "hero",
  "image": {
    "url": "https://cdn.example/banners/summer-desktop.jpg",
    "key": "platform-banners/summer-desktop.jpg"
  },
  "mobileImage": {
    "url": "https://cdn.example/banners/summer-mobile.jpg",
    "key": "platform-banners/summer-mobile.jpg"
  },
  "ctaText": "Shop Now",
  "deepLink": { "kind": "page", "url": "/sale" },
  "displayOrder": 10,
  "priority": 5,
  "isActive": true,
  "startsAt": "2026-06-01T00:00:00.000Z",
  "endsAt": "2026-08-31T23:59:59.000Z",
  "targeting": {
    "devices": ["all"],
    "auth": "all"
  }
}
```

### Reorder banners (admin)

```http
PUT /api/admin/banners/reorder
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "items": [
    { "id": "665f...", "displayOrder": 10 },
    { "id": "665e...", "displayOrder": 20 }
  ]
}
```

### Create announcement (admin)

```http
POST /api/admin/announcements
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "message": "Free shipping above ₹999 this weekend",
  "type": "sticky",
  "backgroundColor": "#111111",
  "textColor": "#ffffff",
  "priority": 20,
  "dismissible": true,
  "deepLink": { "kind": "page", "url": "/shipping" },
  "isActive": true,
  "targeting": {
    "devices": ["all"],
    "auth": "all"
  }
}
```

### Fetch homepage composition (storefront / public)

```http
GET /api/home?device=mobile
Cookie: token=<optional_customer_token>
```

Example success body (abridged):

```json
{
  "success": true,
  "announcement": {
    "_id": "...",
    "message": "Free shipping above ₹999 this weekend",
    "type": "sticky",
    "href": "/shipping",
    "dismissible": true
  },
  "sections": [
    {
      "key": "hero-main",
      "type": "hero_banner",
      "data": {
        "banners": [
          {
            "title": "Summer Collection 2026",
            "image": "https://cdn.example/...",
            "mobileImage": "https://cdn.example/...",
            "ctaHref": "/sale"
          }
        ]
      }
    }
  ],
  "popup": null
}
```

### Toggle announcement status (admin)

```http
PATCH /api/admin/announcements/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{ "isActive": false }
```

---

## B.9 Business Rules Summary (Technical)

1. **Only admins** create and manage banners and announcements.
2. **Public visibility** requires `isActive` + schedule window + targeting match.
3. **Query-time scheduling** — no marketing publish cron.
4. **One composed announcement** on `GET /home` (highest priority after filters).
5. **Banner ordering** is `displayOrder` then `priority`; reorder API bulk-updates `displayOrder`.
6. **Soft delete** for both entities (`isActive: false`).
7. **Deep link resolution** is server-side; clients consume `ctaHref` / `href`.
8. **`optionalAuth`** on public marketing routes enables auth targeting without requiring login.
9. **Images** are S3-backed `{ url, key }`; public responses flatten to URL strings.
10. **Storefront home** hides the hero when no banners resolve (no static fallback creatives).

---

## B.10 Testing Checklist

- [ ] Admin create banner with desktop image → appears in admin catalog as Live/Scheduled
- [ ] Admin create announcement with colors → live preview matches form
- [ ] `GET /home` returns top announcement + hero `data.banners`
- [ ] Inactive content excluded from public endpoints
- [ ] Future `startsAt` → Scheduled in admin; absent from public until window opens
- [ ] Past `endsAt` → excluded from public
- [ ] Device targeting: mobile-only banner absent when `?device=desktop`
- [ ] Auth targeting: guest-only announcement absent when authenticated cookie present
- [ ] Banner reorder updates carousel order after revalidate
- [ ] Soft delete / deactivate removes content from storefront
- [ ] Deep link `kind: product` resolves to `/product/{ref}` in `ctaHref`
- [ ] Storefront CTA navigates correctly; mobile image used on small viewports
- [ ] Dismissible announcement stays hidden for session; new `_id` shows again
- [ ] Sticky announcement remains with sticky header on scroll
- [ ] Empty active banners → no hero carousel rendered on home

---

## B.11 Known Gaps & Future Improvements

| Gap | Recommendation |
|-----|----------------|
| Home Sections admin UI missing | Build drag-reorder section builder on existing `/admin/home-sections` APIs |
| Campaigns / Flash Sales / Collections UI | Mirror BannerForm patterns against existing models/services |
| Geo / segment targeting | Extend `targeting` schema + audience context (IP/geo or user profile) |
| Version history | Snapshot on update or append-only `MarketingContentRevision` collection |
| Multi-announcement rotation | Optional carousel or stacked bars with per-type slots |
| Redis cache | Cache `GET /home` by `{ device, authBucket }` with short TTL + admin bust |
| Stronger schedule queries | Treat missing `startsAt`/`endsAt` fields explicitly with `$in: [null, undefined]` / `$exists` if legacy docs differ |
| Path consistency | Confirm storefront routes (`/product`, `/category`, …) match `resolveDeepLink` outputs |

---

## B.12 Related Documentation

- Catalog (categories/products for deep-link destinations): `documentation/catalog.documentation.md`
- Coupons (promotional offers at checkout): `documentation/coupon.documentation.md`
- Wishlist (customer save-for-later): `documentation/wishlist.documentation.md`
- Seller onboarding (seller store banners are separate from platform banners): `documentation/seller-onboarding.documentation.md`

---

*Last updated to reflect the Core Complete Banner & Announcement CMS: typed content, deep links, device/auth targeting, admin CRUD with reorder/preview/publish, and storefront wiring via `GET /home`.*
