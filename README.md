# @mlsapi/js

The official TypeScript & JavaScript Node.js SDK for **[mlsapi.dev](https://mlsapi.dev)**.

Access real-time MLS listing data, property intelligence, CapEx lifecycle analysis, AI-generated marketing copy, and the complete suite of **Studio Visual AI** generative tools (virtual staging, twilight conversion, decluttering, 3D dollhouse floor plans, 4K upscaling, ad creatives, and video generation).

[![npm version](https://img.shields.io/npm/v/@mlsapi/js.svg?style=flat-square)](https://www.npmjs.com/package/@mlsapi/js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration & Authentication](#configuration--authentication)
- [Core Features & Code Examples](#core-features--code-examples)
  - [1. Real-Time MLS Listing Lookup & Ingestion](#1-real-time-mls-listing-lookup--ingestion)
  - [2. Property Intelligence & CapEx Analysis](#2-property-intelligence--capex-analysis)
  - [3. Marketing Content Generation](#3-marketing-content-generation)
  - [4. Media Upload to Global CDN](#4-media-upload-to-global-cdn)
  - [5. Virtual Room Staging (29 Architectural Styles)](#5-virtual-room-staging-29-architectural-styles)
  - [6. Day-to-Dusk Twilight & Exterior Enhancement](#6-day-to-dusk-twilight--exterior-enhancement)
  - [7. Declutter & Clean Space](#7-declutter--clean-space)
  - [8. De-Staging (Empty Room) & Floor Restoration](#8-de-staging-empty-room--floor-restoration)
  - [9. Furniture & Surface Material Replacement](#9-furniture--surface-material-replacement)
  - [10. 3x3 Designer Wall Paint Swatches](#10-3x3-designer-wall-paint-swatches)
  - [11. 2D Blueprint to 3D Isometric Dollhouse](#11-2d-blueprint-to-3d-isometric-dollhouse)
  - [12. 4K Super-Resolution Upscaling](#12-4k-super-resolution-upscaling)
  - [13. Branded Multi-Placement Ad Creatives](#13-branded-multi-placement-ad-creatives)
  - [14. AI Video Walkthroughs & Voice/Subtitle Polish](#14-ai-video-walkthroughs--voicesubtitle-polish)
- [Asynchronous Jobs & Progress Callbacks](#asynchronous-jobs--progress-callbacks)
- [Error Handling](#error-handling)
- [Supported Presets Reference](#supported-presets-reference)
- [Companion WordPress Plugin](#companion-wordpress-plugin)
- [License](#license)

---

## Installation

Install via your favorite package manager:

```bash
# npm
npm install @mlsapi/js

# pnpm
pnpm add @mlsapi/js

# yarn
yarn add @mlsapi/js

# bun
bun add @mlsapi/js
```

Requires **Node.js 18+**, Bun, Deno, or edge/browser runtimes with native `fetch` support.

---

## Quick Start

```typescript
import { MlsApiClient } from '@mlsapi/js';

// Initialize the client with your API key
const mls = new MlsApiClient({
  apiKey: process.env.MLSAPI_KEY, // or automatically reads process.env.MLSAPI_KEY
});

async function main() {
  // 1. Fetch MLS listing data
  const listing = await mls.listings.getAndWait('A12079565');
  console.log(`Property: ${listing.address.formatted} - $${listing.price.toLocaleString()}`);

  // 2. Perform AI Virtual Staging on an empty room photo
  const staged = await mls.studio.staging.stageAndWait({
    photo_url: listing.photos[0],
    room_type: 'living_room',
    style: 'scandinavian',
  });

  console.log('Staged photo ready:', staged.staged_photo_url);
  console.log('Before/after slider comparison:', staged.before_after_comparison_url);
}

main().catch(console.error);
```

---

## Configuration & Authentication

Obtain an API key from the [mlsapi.dev Dashboard](https://mlsapi.dev).

```typescript
import { MlsApiClient } from '@mlsapi/js';

const mls = new MlsApiClient({
  apiKey: 'sk_live_...',              // Your secret API key
  environment: 'live',                // 'live' (production) or 'test' (sandbox playground)
  baseUrl: 'https://mlsapi.dev',   // Optional custom endpoint or local mock
  timeoutMs: 60_000,                  // Request timeout in milliseconds (default: 60s)
  maxRetries: 3,                      // Automatic retries on rate limits (429) & 5xx errors
});
```

---

## Core Features & Code Examples

### 1. Real-Time MLS Listing Lookup & Ingestion

Ingest property records by MLS number. If the property has not yet been cached, the backend immediately enqueues live scraping and photo downloading.

```typescript
// Auto-wait until scraping completes (recommended)
const listing = await mls.listings.getAndWait('A12079565', {
  timeoutMs: 45_000,
  onProgress: (job) => console.log(`Ingesting listing: step "${job.step}"`),
});

console.log(listing.address.city, listing.specifications.beds, listing.specifications.baths_full);
console.log(`Downloaded ${listing.photo_count} high-res photos:`, listing.photos);

// Or handle the asynchronous job manually (HTTP 202 returns an ingest job)
import { isIngestJob } from '@mlsapi/js';
const response = await mls.listings.get('A12079565');
if (isIngestJob(response)) {
  console.log(`Ingestion job ${response.status}: ${response.job_id}`);
}
```

---

### 2. Property Intelligence & CapEx Analysis

Synthesize public tax records, historical ownership, school zoning, replacement horizons for major structural systems (roof, HVAC, water heater, impact windows), and investor yields.

```typescript
const intel = await mls.intelligence.get('A12079565', {
  includeLlm: true,      // Deep AI analysis of remarks and conditions
  investorMode: true,    // Include estimated rent, gross yield, and HOA flags
});

console.log('Estimated Monthly Rent:', intel.llm_derived_intelligence?.investor_insights.estimated_monthly_rent);
console.log('Gross Yield:', intel.llm_derived_intelligence?.investor_insights.estimated_gross_yield_pct, '%');
console.log('Roof condition:', intel.llm_derived_intelligence?.systems_and_capex.roof?.condition);
console.log('Impact windows detected:', intel.llm_derived_intelligence?.systems_and_capex.storm_protection?.has_impact_windows);
```

---

### 3. Marketing Content Generation

Generate multi-channel marketing campaigns tailored by tone, target audience, and channel format.

```typescript
const copy = await mls.content.generate('A12079565', {
  outputs: ['social', 'email_blast', 'video_script', 'flyer_bullets', 'mls_remarks'],
  social_platforms: ['instagram', 'linkedin', 'facebook'],
  tone: 'luxury',
  target_audience: 'High-net-worth buyers relocating to South Florida',
});

// All generated copy is nested under `content`
console.log('Instagram Caption:\n', copy.content.social?.instagram?.caption);
console.log('Instagram Hashtags:\n', copy.content.social?.instagram?.hashtags);
console.log('LinkedIn Post:\n', copy.content.social?.linkedin?.post_copy);
console.log('TikTok/Reel Video Script:\n', copy.content.video_script?.scenes);
console.log('MLS Public Remarks:\n', copy.content.mls_remarks);
```

---

### 4. Media Upload to Global CDN

Upload local images, Buffers, or Streams directly to the `mlsapi.dev` CDN to use as inputs for any Studio operation.

```typescript
import fs from 'node:fs';

// 1. Upload from a local file path
const upload1 = await mls.studio.upload('./photos/vacant_condo.jpg');
console.log('CDN URL:', upload1.url);

// 2. Upload from a Buffer or Stream
const buffer = fs.readFileSync('./photos/blueprint.png');
const upload2 = await mls.studio.upload(buffer, {
  filename: 'blueprint.png',
  contentType: 'image/png',
});
```

---

### 5. Virtual Room Staging (29 Architectural Styles)

Furnish vacant room photos with photorealistic staging adhering to real estate staging standards.

```typescript
const staged = await mls.studio.staging.stageAndWait({
  photo_url: 'https://cdn.mlsapi.dev/uploads/vacant_condo.jpg',
  room_type: 'living_room',
  style: 'luxury',              // 'modern' | 'scandinavian' | 'japandi' | 'coastal' | etc.
  preserve_flooring: true,      // Keep original hardwood/tile flooring
  custom_staging_instructions: 'Include a white boucle sectional, marble coffee table, and fiddle-leaf fig tree',
});

console.log('Staged photo:', staged.staged_photo_url);
console.log('Staging manifest:', staged.staging_manifest);
```

---

### 6. Day-to-Dusk Twilight & Exterior Enhancement

Transform daytime exterior photos into dramatic golden-hour twilight scenes with warm interior illumination, or enhance sunny curb appeal.

```typescript
// Twilight Day-to-Dusk conversion
const twilight = await mls.studio.staging.twilightAndWait({
  photo_url: 'https://cdn.mlsapi.dev/uploads/exterior_day.jpg',
  mode: 'day_to_dusk', // or 'blue_sky_replace'
});
console.log('Twilight exterior:', twilight.enhanced_photo_url);

// Exterior enhancements (blue sky, green lawn, pool cleaning)
const enhanced = await mls.studio.enhance.exteriorAndWait({
  photo_url: 'https://cdn.mlsapi.dev/uploads/exterior_overcast.jpg',
  enhancements: ['blue_sky', 'green_grass', 'clean_pool', 'tidy_garden'],
});
console.log('Enhanced curb appeal:', enhanced.enhanced_photo_url);
```

---

### 7. Declutter & Clean Space

Remove tenant clutter, wires, boxes, children's toys, and moving messes while strictly keeping walls, floors, and primary structural furniture intact.

```typescript
const clean = await mls.studio.staging.declutterAndWait({
  photo_url: 'https://cdn.mlsapi.dev/uploads/cluttered_kitchen.jpg',
  room_type: 'kitchen',
  removal_targets: ['dishes', 'refrigerator magnets', 'trash cans', 'countertop appliances'],
});

console.log('Clean photo:', clean.decluttered_photo_url);
console.log('Items removed:', clean.items_removed);
```

---

### 8. De-Staging (Empty Room) & Floor Restoration

Strip out outdated furniture to present prospective buyers with a clean architectural canvas, with optional floor restoration.

```typescript
const emptied = await mls.studio.staging.emptyAndWait({
  photo_url: 'https://cdn.mlsapi.dev/uploads/dated_bedroom.jpg',
  room_type: 'bedroom',
  restore_flooring: 'hardwood', // 'hardwood' | 'tile' | 'carpet' | 'polished_concrete'
});

console.log('Empty room:', emptied.empty_photo_url);
```

---

### 9. Furniture & Surface Material Replacement

Replace outdated furniture items with modern pieces or resurface materials like kitchen countertops and flooring.

```typescript
// Precision furniture swap
const newSofa = await mls.studio.staging.replaceFurnitureAndWait({
  room_photo_url: 'https://cdn.mlsapi.dev/uploads/living.jpg',
  target_furniture: 'sofa',
  product_description: 'Low-profile minimalist Italian leather cream couch',
  // Or provide an exact product catalog photo:
  // reference_product_image_url: 'https://example.com/west-elm-sofa.jpg',
});

// Countertop or flooring replacement
const newKitchen = await mls.studio.staging.replaceMaterialAndWait({
  room_photo_url: 'https://cdn.mlsapi.dev/uploads/kitchen.jpg',
  surface_type: 'countertops',
  material_preset: 'Calacatta Gold Italian Marble with subtle grey and gold veining',
});
```

---

### 10. 3x3 Designer Wall Paint Swatches

Test curated designer paint colors on room walls with an instant 3x3 comparison grid.

```typescript
const swatches = await mls.studio.staging.wallColorsAndWait({
  photo_url: 'https://cdn.mlsapi.dev/uploads/living_room.jpg',
  palette_preset: 'popular_neutrals', // 'popular_neutrals' | 'modern_earth' | 'coastal_breeze' | 'moody_darks'
});

console.log('3x3 comparison grid:', swatches.comparison_grid_3x3_url);
for (const swatch of swatches.swatch_results) {
  console.log(`Color: ${swatch.color_name} (${swatch.hex}) -> ${swatch.image_url}`);
}
```

---

### 11. 2D Blueprint to 3D Isometric Dollhouse

Convert 2D floor plans, architectural blueprints, or hand sketches into 3D isometric cutaway dollhouse renders.

```typescript
// Step 1: Analyze floor plan geometry
const analysis = await mls.studio.floorplan.analyze({
  floorplan_image_url: 'https://cdn.mlsapi.dev/uploads/floorplan.png',
  style: 'modern',
});
console.log('Total rooms detected:', analysis.spatial_summary.total_rooms_detected);

// Step 2: Render 3D isometric dollhouse view
const dollhouse = await mls.studio.floorplan.render3dAndWait({
  floorplan_image_url: 'https://cdn.mlsapi.dev/uploads/floorplan.png',
  style: 'modern',
  include_room_closeups: true,
});

console.log('3D Dollhouse render:', dollhouse.isometric_3d_dollhouse_url);
console.log('Room closeups:', dollhouse.room_renders);
```

---

### 12. 4K Super-Resolution Upscaling

Upscale low-resolution or compressed MLS photos up to 4K resolution with AI detail reconstruction.

```typescript
const upscaled = await mls.studio.enhance.upscaleAndWait({
  image_url: 'https://cdn.mlsapi.dev/uploads/lowres_photo.jpg',
  scale_factor: 4,          // 2 or 4
  enhance_details: true,
});

console.log('4K Upscaled image:', upscaled.upscaled_image_url);
console.log('Resolution:', upscaled.target_resolution);
```

---

### 13. Branded Multi-Placement Ad Creatives

Generate compliant real estate ad creatives with agent branding kits, MLS property badges, and typography across all social and print dimensions.

```typescript
const ads = await mls.studio.creatives.generateAndWait({
  mls_id: 'A12079565',
  trigger: 'just_listed', // 'just_listed' | 'open_house' | 'price_improved' | 'just_sold'
  direction: 'magazine',  // 'magazine' | 'bold' | 'warm'
  placements: ['feed_portrait', 'square', 'link', 'flyer'],
  brand_kit: {
    agent_name: 'Sarah Connor',
    brokerage_name: 'Compass Beverly Hills',
    phone: '(310) 555-0199',
    primary_brand_color: '#0F172A',
    agent_headshot_url: 'https://cdn.example.com/sarah-headshot.jpg',
  },
});

console.log('1:1 Square Feed Ad:', ads.creatives.square?.image_url);
console.log('4:5 Portrait Feed Ad:', ads.creatives.feed_portrait?.image_url);
console.log('Fair Housing compliance passed:', ads.compliance.fair_housing_passed);
```

---

### 14. AI Video Walkthroughs & Voice/Subtitle Polish

Polish realtor walkthrough videos with studio voice leveling, Hormozi-style animated captions, and automatic vertical 9:16 re-framing.

```typescript
const polishedVideo = await mls.studio.video.enhanceAndWait({
  video_url: 'https://cdn.mlsapi.dev/uploads/raw_walkthrough.mp4',
  features: {
    studio_voice: true,        // Clean up wind/echo and enhance voice
    animated_subtitles: true,  // Hormozi-style animated word-by-word subtitles
    smart_reframe: true,       // Auto-track agent and reframe to 9:16 vertical
  },
  subtitle_style: {
    font_theme: 'hormozi_bold',
    primary_color: '#FFFFFF',
    highlight_color: '#FFDE59',
    safe_zone: 'instagram_reels',
  },
  export_aspect_ratios: ['9:16', '16:9'],
});

console.log('Reels / TikTok Video:', polishedVideo.mastered_videos[0].url);
```

---

## Asynchronous Jobs & Progress Callbacks

Every Studio operation returns immediately with a `StudioJob` (`202 Accepted`) when using the standard method (e.g. `stage(...)`), or polls until completion when using the `*AndWait(...)` companion method.

### Custom Polling Options

```typescript
const result = await mls.studio.staging.stageAndWait(
  {
    photo_url: 'https://cdn.mlsapi.dev/uploads/room.jpg',
    style: 'japandi',
  },
  {
    pollIntervalMs: 2_000,    // Poll every 2 seconds (default: 2,000ms)
    timeoutMs: 120_000,       // Max wait time (default: 90,000ms)
    onProgress: (job) => {
      console.log(`[${job.progress_percentage}%] ${job.current_step}`);
    },
  }
);
```

### Manual Job Tracking

```typescript
// Dispatch without waiting
const job = await mls.studio.staging.stage({ photo_url: '...' });
console.log(`Track job later: ${job.job_id}`);

// Check status later
const currentStatus = await mls.studio.jobs.get(job.job_id);

// Or wait for it when ready
const completedJob = await mls.studio.jobs.waitFor(job.job_id);
console.log('Result:', completedJob.result);
```

---

## Error Handling

All API errors inherit from `MlsApiError` and include the HTTP status code, error code, and server message.

```typescript
import {
  MlsApiError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  JobTimeoutError,
} from '@mlsapi/js';

try {
  const listing = await mls.listings.getAndWait('INVALID_ID');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API Key:', error.message);
  } else if (error instanceof NotFoundError) {
    console.error('Listing or resource not found:', error.message);
  } else if (error instanceof RateLimitError) {
    console.error('Rate limited. Quota resets in:', error.retryAfterSeconds);
  } else if (error instanceof JobTimeoutError) {
    console.error('Job processing took longer than timeout limit.');
  } else if (error instanceof MlsApiError) {
    console.error(`API Error [${error.code}]:`, error.message);
  } else {
    throw error;
  }
}
```

---

## Supported Presets Reference

### Interior Design Styles (29 Presets)

| | | |
|---|---|---|
| `modern` | `luxury` | `scandinavian` |
| `japandi` | `industrial` | `bohemian` |
| `minimalist` | `coastal` | `mid_century_modern` |
| `art_deco` | `farmhouse` | `mediterranean` |
| `contemporary` | `rustic` | `transitional` |
| `french_country` | `hollywood_regency` | `eclectic` |
| `zen` | `bauhaus` | `victorian` |
| `tropical` | `modern_craftsman` | `southwestern` |
| `wabi_sabi` | `shabby_chic` | `chalet` |
| `urban_loft` | `custom` | |

### Room Types (12 Types)

`living_room`, `bedroom`, `primary_bedroom`, `dining_room`, `kitchen`, `bathroom`, `patio`, `outdoor_patio`, `home_office`, `entryway`, `basement`, `commercial_lobby`.

---

## Companion WordPress Plugin

If you are developing for WordPress or building a real estate portal on WordPress, see our companion plugin in `wordpress/mlsapi-studio/` or install the **MLS API Studio** plugin to use these exact tools directly inside the WordPress Media Library and Gutenberg blocks.

---

## License

MIT © [mlsapi.dev](https://mlsapi.dev)
