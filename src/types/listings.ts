export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  county?: string;
  country?: string;
  formatted: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PropertySpecifications {
  beds: number;
  baths_full: number;
  baths_half: number;
  sqft: number;
  lot_sqft?: number;
  year_built?: number;
  stories?: number;
  property_type: string;
  parking_spaces?: number;
  garage?: boolean;
}

export interface PropertyFeatures {
  heating?: string[];
  cooling?: string[];
  appliances?: string[];
  flooring?: string[];
  roof_type?: string;
  water_source?: string;
  sewer?: string;
  view?: string[];
}

export interface AgentInfo {
  name: string;
  phone?: string;
  email?: string;
  license?: string;
  brokerage?: string;
}

export interface ListingMetadata {
  days_on_market?: number;
  listed_date?: string;
  mls_board?: string;
  updated_at?: string;
}

export interface BaseListing {
  source: "cache" | "live" | "sample";
  mls_id: string;
  status: "for_sale" | "pending" | "sold" | "off_market";
  price: number;
  currency: string;
  price_per_sqft?: number;
  address: Address;
  coordinates?: Coordinates;
  specifications: PropertySpecifications;
  features: PropertyFeatures;
  photos: string[];
  photo_count: number;
  agent: AgentInfo;
  description: string;
  meta: ListingMetadata;
}

/**
 * HTTP 202 body from `GET /v1/listing/:mlsId` while the listing is being ingested.
 * Distinguish it from a {@link BaseListing} with {@link isIngestJob}.
 */
export interface IngestJob {
  job_id: string;
  mls_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  step?: string;
  estimated_completion_seconds?: number;
  /** Path of the ingestion job, e.g. `/jobs/job_...`. */
  status_url?: string;
  /** @deprecated Not part of the 202 body; see {@link IngestJobRecord.result}. */
  result?: {
    propertyDetails?: Record<string, unknown>[];
    photosIngested?: number;
    downloadedFiles?: string[];
  };
  /** @deprecated Not part of the 202 body; see {@link IngestJobRecord.error}. */
  error?: string;
  /** @deprecated Not part of the 202 body; see {@link IngestJobRecord.createdAt}. */
  created_at?: string;
  /** @deprecated Not part of the 202 body; see {@link IngestJobRecord.completedAt}. */
  completed_at?: string;
}

export type IngestJobStep = "queued" | "serpapi" | "apify" | "photos" | "r2" | "done" | "error";

/** Full ingestion job record from `GET /jobs/:jobId` and `GET /jobs` (camelCase keys). */
export interface IngestJobRecord {
  id: string;
  mlsId: string;
  status: "queued" | "processing" | "completed" | "failed";
  step: IngestJobStep;
  progress: {
    message: string;
    photosCompleted?: number;
    photosTotal?: number;
  };
  options: EnqueueListingOptions;
  result?: {
    mlsId: string;
    address: string;
    zillowUrl: string;
    detailsR2Key?: string;
    detailsR2Url?: string;
    photosCount: number;
    photos: Array<Record<string, unknown>>;
    propertyDetails: Record<string, unknown>[];
  };
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

/** HTTP 202 body from `POST /jobs` (camelCase keys). */
export interface EnqueueIngestResponse {
  jobId: string;
  mlsId: string;
  status: "queued" | "processing" | "completed" | "failed";
  step: IngestJobStep;
  statusUrl: string;
  lookupUrl: string;
  createdAt: string;
}

/**
 * True when a `listings.get()` response is an in-flight ingestion job (HTTP 202)
 * rather than a normalized listing.
 */
export function isIngestJob(value: BaseListing | IngestJob): value is IngestJob {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as IngestJob).job_id === "string" &&
    !("specifications" in value)
  );
}

export interface EnqueueListingOptions {
  downloadPhotos?: boolean;
  uploadToR2?: boolean;
  saveLocal?: boolean;
  photosConcurrency?: number;
  webhookUrl?: string;
}

export interface ListJobsOptions {
  limit?: number;
}
