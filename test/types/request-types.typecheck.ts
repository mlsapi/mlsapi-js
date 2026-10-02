/**
 * Type-level checks: compiled by `npm run typecheck:tests` (tsc -p tsconfig.test.json), never executed.
 * Each call mirrors a payload the mlsapi.dev website examples send.
 */
import { MlsApiClient } from "../../src/index.js";
import type {
  AdCreativesResult,
  VideoEnhanceResult,
  VideoWalkthroughResult,
  RestyleResult,
  ContentGenerationResult,
  SocialPublishResult,
  StudioJobSubmission,
  CustomStudioResult,
  HouseTourVideoResult,
  ReplaceFurnitureResult,
  ReplaceMaterialResult,
} from "../../src/index.js";

declare const client: MlsApiClient;

export async function creatives(): Promise<AdCreativesResult> {
  const result = await client.studio.creatives.generateAndWait({
    photo_url: "https://example.com/front.jpg",
    property_details: {
      address: "123 Main St, Miami, FL 33101",
      price: 1_250_000,
      beds: 4,
      baths: 3,
      sqft: 2_850,
    },
    trigger: "just_listed",
    direction: "magazine",
    placements: ["feed_portrait", "youtube", "flyer"],
    brand_kit: {
      agent_name: "Jordan Lee",
      brokerage_name: "Harbor Realty",
      phone: "(305) 555-0100",
      license_number: "SL3456789",
      agent_headshot_url: "https://example.com/jordan.jpg",
      primary_brand_color: "#1A365D",
      accent_brand_color: "#D4AF37",
    },
  });
  const slides = result.carousel_pack?.length;
  const score: number | undefined = result.compliance.audit_score;
  void slides;
  void score;
  return result;
}

export async function videoEnhance(): Promise<VideoEnhanceResult> {
  const result = await client.studio.video.enhanceAndWait({
    video_url: "https://example.com/raw.mp4",
    features: {
      studio_voice: true,
      animated_subtitles: true,
      smart_reframe: true,
      b_roll_photo_insertion: true,
    },
    subtitle_style: {
      font_theme: "hormozi_bold",
      highlight_color: "#FFDE59",
      safe_zone: "instagram_reels",
    },
    export_aspect_ratios: ["9:16", "1:1"],
    mls_id: "A12079565",
  });
  const firstWord: string | undefined = result.transcript[0]?.words?.[0]?.word;
  void firstWord;
  return result;
}

export async function walkthrough(): Promise<VideoWalkthroughResult> {
  // Spec §7.1 fields (photo_url, motion, custom_motion_prompt) are accepted.
  const result = await client.studio.video.walkthroughAndWait({
    photo_url: "https://example.com/living.jpg",
    motion: "slow_zoom_in",
    duration_seconds: 5,
    custom_motion_prompt: "Slow cinematic push in toward fireplace",
    aspect_ratio: "9:16",
  });

  await client.studio.video.walkthroughAndWait({
    photo_url: "https://example.com/living.jpg",
    // @ts-expect-error motion must be one of the spec presets
    motion: "spin",
  });
  return result;
}

export async function resultShapes(): Promise<void> {
  const restyled: RestyleResult = await client.studio.staging.restyleAndWait({ photo_url: "x" });
  const url: string = restyled.restyled_photo_url ?? restyled.retyped_photo_url;

  const furniture: ReplaceFurnitureResult = await client.studio.staging.replaceFurnitureAndWait({
    room_photo_url: "x",
    target_furniture: "sofa",
  });
  const furnitureUrl: string = furniture.updated_room_photo_url;

  const material: ReplaceMaterialResult = await client.studio.staging.replaceMaterialAndWait({
    room_photo_url: "x",
    surface_type: "flooring",
  });
  const materialUrl: string = material.updated_room_photo_url;

  const tour: HouseTourVideoResult = await client.studio.video.tourAndWait({
    ordered_photos: [{ room_name: "Kitchen", photo_url: "x" }],
  });
  const tourUrl: string = tour.video_url;

  const custom: CustomStudioResult = await client.studio.customAndWait({ prompt: "p" });
  const customUrl: string = custom.image_url;
  const applied: string = custom.prompt_applied;

  const published: SocialPublishResult = await client.studio.social.publish({
    asset_url: "x",
    destinations: [{ platform: "instagram", target_type: "reels" }],
  });
  const firstPost: string | undefined = published.results[0]?.post_url;

  const copy: ContentGenerationResult = await client.content.generate("A12079565", {
    social_platforms: ["linkedin"],
    property_details: { address: "123 Main St", price: 500_000 },
  });
  const linkedin: string | undefined = copy.content.social?.linkedin?.post_copy;
  const remarks: string | undefined = copy.content.mls_remarks;

  const upscaleViaAlias: StudioJobSubmission = await client.studio.enhance.upscale({ photo_url: "x" });
  // @ts-expect-error upscale needs image_url or photo_url
  await client.studio.enhance.upscale({ scale_factor: 2 });

  void [url, furnitureUrl, materialUrl, tourUrl, customUrl, applied, firstPost, linkedin, remarks, upscaleViaAlias];
}
