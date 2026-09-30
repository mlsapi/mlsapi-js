import type { HttpClient } from "../../http.js";
import type { StudioJobsResource } from "./jobs.js";
import type {
  ExteriorEnhanceRequest,
  ExteriorEnhanceResult,
  UpscaleRequest,
  UpscaleResult,
  StudioJob,
} from "../../types/studio.js";
import type { PollingOptions, RequestOptions } from "../../types/common.js";

export class StudioEnhanceResource {
  constructor(
    private readonly http: HttpClient,
    private readonly jobs: StudioJobsResource
  ) {}

  public async exterior(
    request: ExteriorEnhanceRequest,
    options?: RequestOptions
  ): Promise<StudioJob<ExteriorEnhanceResult>> {
    return this.http.post<StudioJob<ExteriorEnhanceResult>>(
      "/v1/studio/enhance/exterior",
      request,
      options
    );
  }

  public async exteriorAndWait(
    request: ExteriorEnhanceRequest,
    options?: PollingOptions & RequestOptions
  ): Promise<ExteriorEnhanceResult> {
    const job = await this.exterior(request, options);
    const completed = await this.jobs.waitFor<ExteriorEnhanceResult>(job.job_id, options);
    return completed.result!;
  }

  public async upscale(
    request: UpscaleRequest,
    options?: RequestOptions
  ): Promise<StudioJob<UpscaleResult>> {
    return this.http.post<StudioJob<UpscaleResult>>(
      "/v1/studio/enhance/upscale",
      request,
      options
    );
  }

  public async upscaleAndWait(
    request: UpscaleRequest,
    options?: PollingOptions & RequestOptions
  ): Promise<UpscaleResult> {
    const job = await this.upscale(request, options);
    const completed = await this.jobs.waitFor<UpscaleResult>(job.job_id, options);
    return completed.result!;
  }
}
