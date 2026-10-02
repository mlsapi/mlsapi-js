import type { HttpClient } from "../../http.js";
import type { StudioJobsResource } from "./jobs.js";
import type {
  ArchitecturalRenderRequest,
  ArchitecturalRenderResult,
  StudioJobSubmission,
} from "../../types/studio.js";
import type { PollingOptions, RequestOptions } from "../../types/common.js";

export class StudioRenderResource {
  constructor(
    private readonly http: HttpClient,
    private readonly jobs: StudioJobsResource
  ) {}

  public async architectural(
    request: ArchitecturalRenderRequest,
    options?: RequestOptions
  ): Promise<StudioJobSubmission<ArchitecturalRenderResult>> {
    return this.http.post<StudioJobSubmission<ArchitecturalRenderResult>>(
      "/v1/studio/render/architectural",
      request,
      options
    );
  }

  public async architecturalAndWait(
    request: ArchitecturalRenderRequest,
    options?: PollingOptions & RequestOptions
  ): Promise<ArchitecturalRenderResult> {
    const job = await this.architectural(request, options);
    const completed = await this.jobs.waitFor<ArchitecturalRenderResult>(job.job_id, options);
    return completed.result!;
  }
}
