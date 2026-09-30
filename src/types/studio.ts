export type InteriorStyle =
  | "modern"
  | "luxury"
  | "scandinavian"
  | "japandi"
  | "industrial"
  | "bohemian"
  | "minimalist"
  | "coastal"
  | "mid_century_modern"
  | "art_deco"
  | "farmhouse"
  | "mediterranean"
  | "contemporary"
  | "rustic"
  | "transitional"
  | "french_country"
  | "hollywood_regency"
  | "eclectic"
  | "zen"
  | "bauhaus"
  | "victorian"
  | "tropical"
  | "modern_craftsman"
  | "southwestern"
  | "wabi_sabi"
  | "shabby_chic"
  | "chalet"
  | "urban_loft"
  | "custom";

export type RoomType =
  | "living_room"
  | "bedroom"
  | "primary_bedroom"
  | "dining_room"
  | "kitchen"
  | "bathroom"
  | "patio"
  | "outdoor_patio"
  | "home_office"
  | "entryway"
  | "basement"
  | "commercial_lobby";

export type StudioJobType =
  | "floorplan_3d"
  | "staging_furnish"
  | "staging_declutter"
  | "staging_empty"
  | "staging_restyle"
  | "staging_replace_furniture"
  | "staging_replace_material"
  | "staging_wall_colors"
  | "enhance_exterior"
  | "enhance_upscale"
  | "render_architectural"
  | "staging_twilight"
  | "video_enhance"
  | "video_walkthrough"
  | "video_transition"
  | "video_tour"
  | "custom_prompt"
  | "ad_creatives"
  | "social_publish";

export type StudioJobStatus = "queued" | "processing" | "completed" | "failed";

export interface StudioJob<TResult = any> {
  job_id: string;
  type: StudioJobType;
  status: StudioJobStatus;
  progress_percentage: number;
  current_step: string;
  estimated_completion_seconds: number;
  result?: TResult;
  error?: string;
  created_at: string;
  completed_at?: string;
  status_url: string;
}

// 1. Staging
export interface StagingFurnishRequest {
  photo_url: string;
  room_type?: RoomType;
  style?: InteriorStyle;
  preserve_flooring?: boolean;
  custom_staging_instructions?: string;
  webhook_url?: string;
}

export interface StagingFurnishResult {
  staged_photo_url: string;
  before_after_comparison_url: string;
  room_type: RoomType;
  style: InteriorStyle;
  staging_manifest: string[];
}

// 2. Declutter
export interface DeclutterRequest {
  photo_url: string;
  room_type?: RoomType;
  removal_targets?: string[];
  webhook_url?: string;
}

export interface DeclutterResult {
  decluttered_photo_url: string;
  before_after_comparison_url: string;
  items_removed: string[];
}

// 3. Twilight
export interface TwilightRequest {
  photo_url: string;
  mode?: "day_to_dusk" | "blue_sky_replace";
  webhook_url?: string;
}

export interface TwilightResult {
  enhanced_photo_url: string;
  mode: "day_to_dusk" | "blue_sky_replace";
  ambient_lighting_applied: boolean;
}

// 4. Empty Room
export interface DeStageEmptyRequest {
  photo_url: string;
  room_type?: RoomType;
  restore_flooring?: "hardwood" | "tile" | "carpet" | "polished_concrete";
  webhook_url?: string;
}

export interface DeStageEmptyResult {
  empty_photo_url: string;
  before_after_comparison_url?: string;
  room_type: RoomType;
  flooring_restored?: string;
}

// 5. Restyle
export interface RestyleRequest {
  photo_url: string;
  room_type?: RoomType;
  style: InteriorStyle;
  retain_layout?: boolean;
  custom_restyle_instructions?: string;
  webhook_url?: string;
}

export interface RestyleResult {
  retyped_photo_url: string;
  before_after_comparison_url?: string;
  room_type: RoomType;
  style: InteriorStyle;
}

// 6. Replace Furniture
export interface ReplaceFurnitureRequest {
  room_photo_url: string;
  target_furniture: string;
  reference_product_image_url?: string;
  product_description?: string;
  target_location_notes?: string;
  preserve_surroundings?: boolean;
  webhook_url?: string;
}

export interface ReplaceFurnitureResult {
  updated_room_photo_url: string;
  target_replaced: string;
  reference_matched: boolean;
  perspective_alignment: string;
}

// 7. Replace Material
export interface ReplaceMaterialRequest {
  room_photo_url: string;
  surface_type:
    | "flooring"
    | "walls"
    | "countertops"
    | "backsplash"
    | "cabinetry"
    | "fireplace_surround";
  material_sample_image_url?: string;
  material_preset?: string;
  custom_finish_notes?: string;
  webhook_url?: string;
}

export interface ReplaceMaterialResult {
  updated_room_photo_url: string;
  surface_modified: string;
  material_applied: string;
}

// 8. Wall Colors
export interface WallColorSwatch {
  name: string;
  hex: string;
}

export interface WallColorsRequest {
  photo_url: string;
  palette_preset?:
    | "popular_neutrals"
    | "modern_earth"
    | "coastal_breeze"
    | "moody_darks";
  custom_colors?: WallColorSwatch[];
  webhook_url?: string;
}

export interface WallColorsResult {
  comparison_grid_3x3_url: string;
  swatch_results: Array<{
    color_name: string;
    hex: string;
    image_url: string;
  }>;
}

// 9. Exterior Enhance
export interface ExteriorEnhanceRequest {
  photo_url: string;
  enhancements: Array<
    "blue_sky" | "green_grass" | "clean_pool" | "tidy_garden" | "day_to_dusk"
  >;
  webhook_url?: string;
}

export interface ExteriorEnhanceResult {
  enhanced_photo_url: string;
  enhancements_applied: string[];
}

// 10. Upscale
export interface UpscaleRequest {
  image_url: string;
  scale_factor?: 2 | 4;
  enhance_details?: boolean;
  webhook_url?: string;
}

export interface UpscaleResult {
  upscaled_image_url: string;
  scale_factor: number;
  original_resolution?: string;
  target_resolution?: string;
}

// 11. Floorplan Analysis & 3D Render
export interface FloorPlanAnalysisRequest {
  floorplan_image_url: string;
  style?: InteriorStyle;
  mls_id?: string;
  generate_3d_render?: boolean;
}

export interface RoomDetail {
  name: string;
  function: string;
  approx_size: "small" | "medium" | "large";
  position: string;
  structural_features: string[];
  connected_to: string[];
}

export interface FloorPlanAnalysisResponse {
  style: InteriorStyle;
  spatial_summary: {
    total_rooms_detected: number;
    stories: number;
    layout_type: string;
    orientation?: string;
  };
  rooms: RoomDetail[];
  design_system: {
    flooring: string;
    wall_color_palette: string[];
    lighting_temperature: string;
    lighting_fixtures: string;
    tactile_materials: string[];
    overall_style: string;
  };
  isometric_3d_prompt: string;
  render_3d_url?: string;
}

export interface Render3dRequest {
  floorplan_image_url: string;
  style?: InteriorStyle;
  include_room_closeups?: boolean;
  target_rooms?: string[];
  custom_prompt?: string;
  webhook_url?: string;
}

export interface Render3dResult {
  isometric_3d_dollhouse_url: string;
  thumbnail_url: string;
  room_renders: Array<{ room_name: string; image_url: string }>;
  design_system_applied: {
    flooring: string;
    style: InteriorStyle;
  };
}

// 12. Architectural Render
export interface ArchitecturalRenderRequest {
  source_image_url: string;
  render_type: "interior" | "exterior";
  style?: InteriorStyle | string;
  lighting_environment?:
    | "daylight"
    | "golden_hour"
    | "twilight"
    | "overcast"
    | "night";
  weather?: "clear_sunny" | "gentle_clouds" | "rainy" | "snowy";
  season?: "spring" | "summer" | "autumn" | "winter";
  custom_instructions?: string;
  webhook_url?: string;
}

export interface ArchitecturalRenderResult {
  rendered_image_url: string;
  render_type: "interior" | "exterior";
  style: string;
  lighting_applied: string;
}

// 13. Ad Creatives
export type AdPlacementKey =
  | "feed_portrait"
  | "square"
  | "link"
  | "youtube"
  | "flyer";
export type AiDirection = "magazine" | "bold" | "warm";
export type AdTrigger =
  | "just_listed"
  | "open_house"
  | "price_improved"
  | "just_sold";

export interface CreativeBrandKit {
  agent_name: string;
  title?: string;
  brokerage_name: string;
  phone?: string;
  license_number?: string;
  agent_headshot_url?: string;
  realtor_photo?: string;
  brokerage_logo_url?: string;
  primary_brand_color?: string;
  accent_brand_color?: string;
}

export interface RenderedCreative {
  placement: AdPlacementKey;
  dimensions: { width: number; height: number };
  aspect_ratio: string;
  image_url: string;
  headline?: string;
  price_tag?: string;
  address_line?: string;
  agent_badge?: string;
  legal_disclaimer: string;
}

export interface AdCreativesRequest {
  mls_id?: string;
  photos?: string[];
  photo_url?: string;
  direction?: AiDirection;
  placements?: AdPlacementKey[];
  trigger?: AdTrigger;
  ad_type?: AdTrigger | "custom";
  custom_badge?: string;
  custom_headline?: string;
  realtor_photo?: string;
  agent_headshot_url?: string;
  brand_kit?: Partial<CreativeBrandKit>;
  highlights?: string[];
  open_house?: { day: string; time: string };
  include_carousel?: boolean;
  webhook_url?: string;
}

export interface AdCreativesResult {
  mls_id?: string;
  direction: AiDirection;
  trigger: AdTrigger;
  creatives: Partial<Record<AdPlacementKey, RenderedCreative>>;
  compliance: {
    fair_housing_passed: boolean;
    equal_housing_logo_present: boolean;
    broker_attribution: string;
    legal_lines: string[];
  };
  generated_at: string;
}

// 14. Social Publish
export interface SocialPublishDestination {
  platform: "instagram" | "facebook" | "youtube" | "linkedin" | "tiktok";
  target_type: "feed" | "reels" | "story" | "page_post" | "shorts";
  caption?: string;
  title?: string;
  page_id?: string;
  share_to_feed?: boolean;
}

export interface SocialPublishRequest {
  asset_url: string;
  asset_type: "image" | "video";
  destinations: SocialPublishDestination[];
  schedule_time?: "immediate" | string;
  webhook_url?: string;
}

export interface SocialPublishResult {
  publish_id: string;
  status: "dispatched" | "scheduled";
  results: Array<{
    platform: string;
    target_type: string;
    status: "published" | "scheduled" | "failed";
    post_id?: string;
    post_url?: string;
    error?: string;
  }>;
}

// 15. Video
export type VideoAspectRatio = "9:16" | "1:1" | "16:9";

export interface VideoEnhanceRequest {
  video_url: string;
  features?: {
    studio_voice?: boolean;
    animated_subtitles?: boolean;
    smart_reframe?: boolean;
    b_roll_photo_insertion?: boolean;
  };
  subtitle_style?: {
    font_theme?: "hormozi_bold" | "clean_minimal" | "luxury_serif";
    primary_color?: string;
    highlight_color?: string;
  };
  export_aspect_ratios?: VideoAspectRatio[];
  mls_id?: string;
  webhook_url?: string;
}

export interface MasteredVideo {
  aspect_ratio: VideoAspectRatio;
  format: string;
  resolution: string;
  url: string;
  thumbnail_url: string;
  target_channels: string[];
}

export interface VideoEnhanceResult {
  duration_seconds: number;
  mastered_videos: MasteredVideo[];
}

export interface VideoWalkthroughRequest {
  mls_id?: string;
  photo_urls?: string[];
  aspect_ratio?: "9:16" | "16:9";
  duration_seconds?: number;
  voice_id?: string;
  music_mood?: string;
  webhook_url?: string;
}

export interface VideoWalkthroughResult {
  video_url: string;
  poster_url: string;
  duration_seconds: number;
  resolution: string;
}

export interface VideoTransitionRequest {
  start_image_url: string;
  end_image_url: string;
  duration_seconds?: 5 | 10;
  transition_style?:
    | "furnishing_timelapse"
    | "smooth_dissolve"
    | "renovation_timelapse";
  aspect_ratio?: "9:16" | "16:9" | "1:1";
  webhook_url?: string;
}

export interface VideoTransitionResult {
  video_url: string;
  poster_url: string;
  duration_seconds: number;
  transition_style: string;
}

export interface HouseTourRoomItem {
  room_name: string;
  photo_url: string;
  highlight?: string;
}

export interface HouseTourVideoRequest {
  ordered_photos: HouseTourRoomItem[];
  duration_seconds?: 12 | 15 | 30;
  auto_script?: boolean;
  shot_script?: string;
  aspect_ratio?: "9:16" | "16:9" | "1:1";
  music_genre?: "ambient_luxury" | "upbeat_modern" | "acoustic_warm" | "none";
  webhook_url?: string;
}

export interface HouseTourVideoResult {
  video_url: string;
  poster_url: string;
  duration_seconds: number;
  shots_count: number;
}

// 16. Custom Prompt
export interface CustomStudioRequest {
  prompt: string;
  reference_image_urls?: string[];
  photo_url?: string;
  aspect_ratio?: "1:1" | "3:4" | "4:3" | "16:9" | "9:16";
  webhook_url?: string;
}

export interface CustomStudioResult {
  image_url: string;
  prompt_applied: string;
  aspect_ratio: string;
}

// 17. Media Upload
export interface UploadResult {
  success: boolean;
  url: string;
  storageKey: string;
  filename: string;
  size: number;
  contentType: string;
}

export interface UploadOptions {
  filename?: string;
  contentType?: string;
}
