import type { HttpClient } from "../../http.js";
import type { StudioJobsResource } from "./jobs.js";
import type {
  VideoEnhanceRequest,
  VideoEnhanceResult,
  VideoWalkthroughRequest,
  VideoWalkthroughResult,
  VideoTransitionRequest,
  VideoTransitionResult,
  HouseTourVideoRequest,
  HouseTourVideoResult,
  StudioJob,
} from "../../types/studio.js";
import type { PollingOptions, RequestOptions } from "../../types/common.js";

export class StudioVideoResource {
  constructor(
    private readonly http: HttpClient,
    private readonly jobs: StudioJobsResource
  ) {}

  public async enhance(
    request: VideoEnhanceRequest,
    options?: RequestOptions
  ): Promise<StudioJob<VideoEnhanceResult>> {
    return this.http.post<StudioJob<VideoEnhanceResult>>(
      "/v1/studio/video/enhance",
      request,
      options
    );
  }

  public async enhanceAndWait(
    request: VideoEnhanceRequest,
    options?: PollingOptions & RequestOptions
  ): Promise<VideoEnhanceResult> {
    const job = await this.enhance(request, options);
    const completed = await this.jobs.waitFor<VideoEnhanceResult>(job.job_id, options);
    return completed.result!;
  }

  public async walkthrough(
    request: VideoWalkthroughRequest,
    options?: RequestOptions
  ): Promise<StudioJob<VideoWalkthroughResult>> {
    return this.http.post<StudioJob<VideoWalkthroughResult>>(
      "/v1/studio/video/walkthrough",
      request,
      options
    );
  }

  public async walkthroughAndWait(
    request: VideoWalkthroughRequest,
    options?: PollingOptions & RequestOptions
  ): Promise<VideoWalkthroughResult> {
    const job = await this.walkthrough(request, options);
    const completed = await this.jobs.waitFor<VideoWalkthroughResult>(job.job_id, options);
    return completed.result!;
  }

  public async transition(
    request: VideoTransitionRequest,
    options?: RequestOptions
  ): Promise<StudioJob<VideoTransitionResult>> {
    return this.http.post<StudioJob<VideoTransitionResult>>(
      "/v1/studio/video/transition",
      request,
      options
    );
  }

  public async transitionAndWait(
    request: VideoTransitionRequest,
    options?: PollingOptions & RequestOptions
  ): Promise<VideoTransitionResult> {
    const job = await this.transition(request, options);
    const completed = await this.jobs.waitFor<VideoTransitionResult>(job.job_id, options);
    return completed.result!;
  }

  public async tour(
    request: HouseTourVideoRequest,
    options?: RequestOptions
  ): Promise<StudioJob<HouseTourVideoResult>> {
    return this.http.post<StudioJob<HouseTourVideoResult>>(
      "/v1/studio/video/tour",
      request,
      options
    );
  }

  public async tourAndWait(
    request: HouseTourVideoRequest,
    options?: PollingOptions & RequestOptions
  ): Promise<HouseTourVideoResult> {
    const job = await this.tour(request, options);
    const completed = await this.jobs.waitFor<HouseTourVideoResult>(job.job_id, options);
    return completed.result!;
  }
}
