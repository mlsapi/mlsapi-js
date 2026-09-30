import type { HttpClient } from "../../http.js";
import { pollJob } from "../../poller.js";
import type { StudioJob } from "../../types/studio.js";
import type { PollingOptions, RequestOptions } from "../../types/common.js";

export class StudioJobsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get the current status and progress of an asynchronous Studio operation.
   */
  public async get<TResult = any>(
    jobId: string,
    options?: RequestOptions
  ): Promise<StudioJob<TResult>> {
    return this.http.get<StudioJob<TResult>>(
      `/v1/studio/jobs/${encodeURIComponent(jobId)}`,
      options
    );
  }

  /**
   * Poll a Studio operation until completion, returning the finalized StudioJob.
   */
  public async waitFor<TResult = any>(
    jobId: string,
    options?: PollingOptions & RequestOptions
  ): Promise<StudioJob<TResult>> {
    return pollJob(
      () => this.get<TResult>(jobId, options),
      options
    );
  }
}
