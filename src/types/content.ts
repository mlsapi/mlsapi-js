export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "x_twitter"
  | "tiktok"
  | "youtube";

export type ContentOutputKey =
  | "social"
  | "email_blast"
  | "video_script"
  | "flyer_bullets"
  | "mls_remarks"
  | "investor_pitch";

export type ContentTone =
  | "professional"
  | "luxury"
  | "approachable"
  | "investor_focused"
  | "storytelling"
  | "urgent_deal";

export interface PropertyDetailsOverride {
  address?: string;
  city?: string;
  state?: string;
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  property_type?: string;
  year_built?: number;
  description?: string;
  highlights?: string[];
}

export interface ContentGenerationRequest {
  /** Defaults to ["social", "email_blast", "video_script", "flyer_bullets", "mls_remarks"]. */
  outputs?: ContentOutputKey[];
  /** Platforms generated under `content.social`. Defaults to all six. */
  social_platforms?: SocialPlatform[];
  /** Defaults to "luxury". */
  tone?: ContentTone;
  target_audience?: string;
  custom_notes?: string;
  /** Facts to write from. Overrides the stored listing; required when the listing isn't ingested. */
  property_details?: PropertyDetailsOverride;
}

export interface InstagramContent {
  hook_above_fold: string;
  caption: string;
  carousel_prompt: string;
  call_to_action: string;
  hashtags: string[];
  character_count: number;
}

export interface FacebookContent {
  headline: string;
  post_copy: string;
  link_preview: {
    title: string;
    description: string;
  };
  hashtags: string[];
}

export interface LinkedInContent {
  post_copy: string;
  hashtags: string[];
  /** @deprecated Not returned by the API; use `post_copy`. */
  headline?: string;
  /** @deprecated Not returned by the API; use `post_copy`. */
  market_insight_angle?: string;
  /** @deprecated Not returned by the API; use `post_copy`. */
  body?: string;
  /** @deprecated Not returned by the API; use `post_copy`. */
  takeaway?: string;
}

export interface XTwitterContent {
  single_tweet: string;
  thread: string[];
}

export interface TikTokContent {
  caption: string;
  on_screen_hook_text: string;
  call_to_action_cue: string;
  sound_recommendation: string;
  hashtags: string[];
}

export interface YouTubeContent {
  video_title_options: string[];
  description: string;
  tags: string[];
  shorts: {
    title: string;
    caption: string;
  };
}

export interface SocialContentResult {
  instagram?: InstagramContent;
  facebook?: FacebookContent;
  linkedin?: LinkedInContent;
  x_twitter?: XTwitterContent;
  tiktok?: TikTokContent;
  youtube?: YouTubeContent;
}

export interface EmailBlastContent {
  subject_lines: string[];
  preview_text: string;
  body_markdown: string;
  /** Derived from `body_markdown` when the model doesn't supply it. */
  body_html: string;
}

export interface VideoScriptScene {
  second_range: string;
  visual: string;
  voiceover: string;
}

export interface VideoScriptContent {
  duration_seconds: number;
  /** e.g. "9:16_vertical_reel". */
  format: string;
  hook: string;
  scenes: VideoScriptScene[];
}

export interface InvestorPitchContent {
  headline: string;
  summary: string;
  /** Only metrics computable from listing facts, e.g. `listing_price`, `price_per_sqft`. */
  key_metrics: Record<string, string>;
}

/**
 * The generated copy. Only the requested `outputs` are present; when the AI model is
 * unavailable the server returns facts-only copy, which may omit `email_blast`,
 * `video_script` and `investor_pitch`.
 */
export interface GeneratedContent {
  social?: SocialContentResult;
  email_blast?: EmailBlastContent;
  video_script?: VideoScriptContent;
  flyer_bullets?: string[];
  mls_remarks?: string;
  investor_pitch?: InvestorPitchContent;
}

export interface ContentGenerationResult {
  mls_id: string;
  /** The tone used (the server echoes the request value or "luxury"). */
  tone: ContentTone | (string & {});
  target_audience?: string;
  generated_at: string;
  /** All generated copy is nested under `content`. */
  content: GeneratedContent;
}

/** @deprecated The API returns `content.flyer_bullets` as a plain `string[]`. Kept for type compatibility with 1.0.0. */
export interface FlyerBulletsContent {
  headline: string;
  subheadline: string;
  bullet_points: string[];
  footer_call_to_action: string;
}

/** @deprecated The API returns `content.mls_remarks` as a plain string. Kept for type compatibility with 1.0.0. */
export interface MlsRemarksContent {
  optimized_text: string;
  character_count: number;
  character_limit: number;
  highlights_included: string[];
}
