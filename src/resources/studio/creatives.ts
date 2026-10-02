import type { HttpClient } from "../../http.js";
import type { StudioJobsResource } from "./jobs.js";
import type {
  AdCreativesRequest,
  AdCreativesResult,
  StudioJobSubmission,
} from "../../types/studio.js";
import type { PollingOptions, RequestOptions } from "../../types/common.js";

export class StudioCreativesResource {
  constructor(
    private readonly http: HttpClient,
    private readonly jobs: StudioJobsResource
  ) {}

  public async generate(
    request: AdCreativesRequest,
    options?: RequestOptions
  ): Promise<StudioJobSubmission<AdCreativesResult>> {
    return this.http.post<StudioJobSubmission<AdCreativesResult>>(
      "/v1/studio/creatives/generate",
      request,
      options
    );
  }

  public async generateAndWait(
    request: AdCreativesRequest,
    options?: PollingOptions & RequestOptions
  ): Promise<AdCreativesResult> {
    const job = await this.generate(request, options);
    const completed = await this.jobs.waitFor<AdCreativesResult>(job.job_id, options);
    return completed.result!;
  }
}
