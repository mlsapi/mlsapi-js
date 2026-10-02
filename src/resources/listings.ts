import type { HttpClient } from "../http.js";
import { pollJob } from "../poller.js";
import { isIngestJob } from "../types/listings.js";
import type {
  BaseListing,
  IngestJob,
  IngestJobRecord,
  EnqueueIngestResponse,
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

    // The server answers 200 with a normalized listing, or 202 with an ingest job
    // ({ job_id, mls_id, status, step, status_url }) while scraping is in flight.
    if (!isIngestJob(initial)) {
      return initial;
    }

    await pollJob(
      async () => {
        const record = await this.getJob(initial.job_id, options);
        // /jobs/:id uses camelCase `id`; expose it as job_id for poller error messages.
        return { ...record, job_id: record.id };
      },
      options
    );

    // Fetch final completed listing
    const finalListing = await this.get(mlsId, options);
    if (!isIngestJob(finalListing)) {
      return finalListing;
    }

    throw new Error(
      `Ingest job '${initial.job_id}' completed but listing '${mlsId}' is still not available ` +
        `(server returned job '${finalListing.job_id}').`
    );
  }

  /**
   * Explicitly enqueue a background MLS ingestion job.
   */
  public async enqueue(
    mlsId: string,
    options: EnqueueListingOptions = {},
    requestOptions?: RequestOptions
  ): Promise<EnqueueIngestResponse> {
    return this.http.post<EnqueueIngestResponse>(
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
  ): Promise<IngestJobRecord> {
    return this.http.get<IngestJobRecord>(`/jobs/${encodeURIComponent(jobId)}`, options);
  }

  /**
   * List recently enqueued MLS ingestion jobs.
   */
  public async listJobs(
    options: ListJobsOptions = {},
    requestOptions?: RequestOptions
  ): Promise<{ count: number; jobs: IngestJobRecord[] }> {
    const query = options.limit ? `?limit=${options.limit}` : "";
    return this.http.get<{ count: number; jobs: IngestJobRecord[] }>(`/jobs${query}`, requestOptions);
  }
}
