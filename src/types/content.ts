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
  outputs: ContentOutputKey[];
  social_platforms?: SocialPlatform[];
  tone?: ContentTone;
  target_audience?: string;
  custom_notes?: string;
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
  headline: string;
  market_insight_angle: string;
  body: string;
  takeaway: string;
  hashtags: string[];
}

export interface SocialContentResult {
  instagram?: InstagramContent;
  facebook?: FacebookContent;
  linkedin?: LinkedInContent;
}

export interface EmailBlastContent {
  subject_lines: string[];
  preview_text: string;
  body_html: string;
  body_text: string;
  call_to_action_url?: string;
}

export interface VideoScriptScene {
  timestamp_seconds: string;
  shot_description: string;
  spoken_audio: string;
  on_screen_text?: string;
}

export interface VideoScriptContent {
  platform: "tiktok" | "reels" | "youtube_shorts";
  total_duration_seconds: number;
  hook: string;
  scenes: VideoScriptScene[];
  script_text: string;
}

export interface FlyerBulletsContent {
  headline: string;
  subheadline: string;
  bullet_points: string[];
  footer_call_to_action: string;
}

export interface MlsRemarksContent {
  optimized_text: string;
  character_count: number;
  character_limit: number;
  highlights_included: string[];
}

export interface InvestorPitchContent {
  executive_summary: string;
  projected_roi: string;
  neighborhood_growth_catalysts: string[];
  deal_strengths: string[];
}

export interface ContentGenerationResult {
  mls_id: string;
  generated_at: string;
  tone: ContentTone;
  social?: SocialContentResult;
  email_blast?: EmailBlastContent;
  video_script?: VideoScriptContent;
  flyer_bullets?: FlyerBulletsContent;
  mls_remarks?: MlsRemarksContent;
  investor_pitch?: InvestorPitchContent;
}
