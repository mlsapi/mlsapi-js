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

export interface IngestJob {
  job_id: string;
  mls_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  step?: string;
  estimated_completion_seconds?: number;
  status_url?: string;
  result?: {
    propertyDetails?: Record<string, unknown>[];
    photosIngested?: number;
    downloadedFiles?: string[];
  };
  error?: string;
  created_at?: string;
  completed_at?: string;
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
