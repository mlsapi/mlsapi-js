import type { HttpClient } from "../http.js";
import { pollJob } from "../poller.js";
import type {
  BaseListing,
  IngestJob,
  EnqueueListingOptions,
  ListJobsOptions,
} from "../types/listings.js";
import type { PollingOptions, RequestOptions } from "../types/common.js";

export class ListingsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Look up a property listing by MLS ID.
   * If the listing is already in cache, returns BaseListing immediately.
   * If the listing is being ingested, returns HTTP 202 IngestJob status.
   */
  public async get(
    mlsId: string,
    options?: RequestOptions
  ): Promise<BaseListing | IngestJob> {
    return this.http.get<BaseListing | IngestJob>(`/v1/listing/${encodeURIComponent(mlsId)}`, options);
  }

  /**
   * Look up a property listing by MLS ID and poll until scraping and ingestion complete.
   */
  public async getAndWait(
    mlsId: string,
    options?: PollingOptions & RequestOptions
  ): Promise<BaseListing> {
    const initial = await this.get(mlsId, options);

    // If already normalized listing (has specs/features)
    if ("specifications" in initial && "photos" in initial) {
      return initial as BaseListing;
    }

    // Ingest job is in flight
    const job = initial as IngestJob;
    await pollJob(
      () => this.getJob(job.job_id),
      options
    );

    // Fetch final completed listing
    const finalListing = await this.get(mlsId, options);
    if ("specifications" in finalListing) {
      return finalListing as BaseListing;
    }

    throw new Error(`Ingest completed but listing '${mlsId}' could not be normalized.`);
  }

  /**
   * Explicitly enqueue a background MLS ingestion job.
   */
  public async enqueue(
    mlsId: string,
    options: EnqueueListingOptions = {},
    requestOptions?: RequestOptions
  ): Promise<IngestJob> {
    return this.http.post<IngestJob>(
      "/jobs",
      { mlsId, ...options },
      requestOptions
    );
  }

  /**
   * Check status and live progress of an MLS ingestion job.
   */
  public async getJob(
    jobId: string,
    options?: RequestOptions
  ): Promise<IngestJob> {
    return this.http.get<IngestJob>(`/jobs/${encodeURIComponent(jobId)}`, options);
  }

  /**
   * List recently enqueued MLS ingestion jobs.
   */
  public async listJobs(
    options: ListJobsOptions = {},
    requestOptions?: RequestOptions
  ): Promise<{ count: number; jobs: IngestJob[] }> {
    const query = options.limit ? `?limit=${options.limit}` : "";
    return this.http.get<{ count: number; jobs: IngestJob[] }>(`/jobs${query}`, requestOptions);
  }
}
