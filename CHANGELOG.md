# Changelog

## 1.0.1 - 2026-10-01

### Fixed
- **Default base URL** is now `https://mlsapi.dev`. 1.0.0 defaulted to `https://api.mlsapi.dev`, which has no DNS record, so every call failed unless `baseUrl` was set.
- **`listings.getAndWait`** now detects an in-flight ingest (HTTP 202) by the presence of `job_id` (new exported `isIngestJob()` helper) and polls `GET /jobs/:id` using its camelCase record shape. Failed ingest jobs now report their job id.
- **Request types** accept every field the API reads:
  - `AdCreativesRequest.property_details` (`address`, `price`, `beds`, `baths`, `sqft`, plus `key_features` / `property_type`).
  - `VideoEnhanceRequest.subtitle_style.safe_zone`.
  - `UpscaleRequest` accepts `photo_url` as an alias for `image_url`.
  - `ReplaceFurnitureRequest.target_furniture` suggests the known furniture keys.
  - `VideoWalkthroughRequest` adds `photo_url`, `motion` (`WalkthroughMotion`) and `custom_motion_prompt` per API spec §7.1 (not yet applied by the current API build).
  - `outputs` (content), `style` (restyle), `enhancements` (exterior) and `render_type` (architectural) are optional, matching server defaults.
  - Fields the server currently ignores are kept and documented as such (e.g. `subtitle_style`, walkthrough `photo_urls` / `voice_id` / `music_mood`, `preserve_flooring`, `palette_preset`).
- **Response types** match what the API returns:
  - Studio POST endpoints return `StudioJobSubmission` (`job_id`, `status`, `status_url`, `estimated_completion_seconds`); poll for the full `StudioJob`.
  - `RestyleResult` documents the server's `retyped_photo_url` key and adds an optional `restyled_photo_url`.
  - `VideoEnhanceResult` adds `transcript`, `audio_enhancements`, `b_roll_cuts`; `HouseTourVideoResult` adds `script_used`; `AdCreativesResult` adds `carousel_pack` and the compliance audit fields.
  - `ContentGenerationResult` nests copy under `content`; LinkedIn returns `post_copy`; adds X/Twitter, TikTok and YouTube shapes; `flyer_bullets` is `string[]` and `mls_remarks` is a string; email and video-script shapes corrected.
  - `listings.enqueue()` returns `EnqueueIngestResponse` and `listings.getJob()` / `listJobs()` return `IngestJobRecord` (camelCase, as served by `/jobs`).

## 1.0.0

- Initial release.
