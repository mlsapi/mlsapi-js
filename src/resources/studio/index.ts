import type { HttpClient } from "../../http.js";
import { StudioJobsResource } from "./jobs.js";
import { StudioStagingResource } from "./staging.js";
import { StudioEnhanceResource } from "./enhance.js";
import { StudioFloorPlanResource } from "./floorplan.js";
import { StudioRenderResource } from "./render.js";
import { StudioCreativesResource } from "./creatives.js";
import { StudioSocialResource } from "./social.js";
import { StudioVideoResource } from "./video.js";
import { StudioUploadResource } from "./upload.js";
import type {
  CustomStudioRequest,
  CustomStudioResult,
  StudioJob,
  UploadResult,
  UploadOptions,
} from "../../types/studio.js";
import type { PollingOptions, RequestOptions } from "../../types/common.js";

export class StudioResource {
  public readonly jobs: StudioJobsResource;
  public readonly staging: StudioStagingResource;
  public readonly enhance: StudioEnhanceResource;
  public readonly floorplan: StudioFloorPlanResource;
  public readonly render: StudioRenderResource;
  public readonly creatives: StudioCreativesResource;
  public readonly social: StudioSocialResource;
  public readonly video: StudioVideoResource;
  private readonly uploader: StudioUploadResource;

  constructor(private readonly http: HttpClient) {
    this.jobs = new StudioJobsResource(http);
    this.staging = new StudioStagingResource(http, this.jobs);
    this.enhance = new StudioEnhanceResource(http, this.jobs);
    this.floorplan = new StudioFloorPlanResource(http, this.jobs);
    this.render = new StudioRenderResource(http, this.jobs);
    this.creatives = new StudioCreativesResource(http, this.jobs);
    this.social = new StudioSocialResource(http);
    this.video = new StudioVideoResource(http, this.jobs);
    this.uploader = new StudioUploadResource(http);
  }

  /**
   * Upload an image or video file directly to the mlsapi.dev CDN.
   */
  public async upload(
    fileOrPath: File | Blob | Uint8Array | ArrayBuffer | string,
    options: UploadOptions = {},
    requestOptions?: RequestOptions
  ): Promise<UploadResult> {
    return this.uploader.upload(fileOrPath, options, requestOptions);
  }

  /**
   * Trigger a custom multimodal generative studio prompt.
   */
  public async custom(
    request: CustomStudioRequest,
    options?: RequestOptions
  ): Promise<StudioJob<CustomStudioResult>> {
    return this.http.post<StudioJob<CustomStudioResult>>(
      "/v1/studio/custom",
      request,
      options
    );
  }

  /**
   * Trigger a custom multimodal generative studio prompt and poll until completion.
   */
  public async customAndWait(
    request: CustomStudioRequest,
    options?: PollingOptions & RequestOptions
  ): Promise<CustomStudioResult> {
    const job = await this.custom(request, options);
    const completed = await this.jobs.waitFor<CustomStudioResult>(job.job_id, options);
    return completed.result!;
  }
}
