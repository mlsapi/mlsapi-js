import type { HttpClient } from "../../http.js";
import type { StudioJobsResource } from "./jobs.js";
import type {
  FloorPlanAnalysisRequest,
  FloorPlanAnalysisResponse,
  Render3dRequest,
  Render3dResult,
  StudioJobSubmission,
} from "../../types/studio.js";
import type { PollingOptions, RequestOptions } from "../../types/common.js";

export class StudioFloorPlanResource {
  constructor(
    private readonly http: HttpClient,
    private readonly jobs: StudioJobsResource
  ) {}

  /**
   * Analyze architectural floor plan layout, extracting rooms, features, and design system.
   */
  public async analyze(
    request: FloorPlanAnalysisRequest,
    options?: RequestOptions
  ): Promise<FloorPlanAnalysisResponse> {
    return this.http.post<FloorPlanAnalysisResponse>(
      "/v1/studio/floorplan/analyze",
      request,
      options
    );
  }

  /**
   * Trigger 3D isometric cutaway dollhouse rendering from a 2D floor plan.
   */
  public async render3d(
    request: Render3dRequest,
    options?: RequestOptions
  ): Promise<StudioJobSubmission<Render3dResult>> {
    return this.http.post<StudioJobSubmission<Render3dResult>>(
      "/v1/studio/floorplan/render-3d",
      request,
      options
    );
  }

  /**
   * Render 3D isometric dollhouse model and wait until render completes.
   */
  public async render3dAndWait(
    request: Render3dRequest,
    options?: PollingOptions & RequestOptions
  ): Promise<Render3dResult> {
    const job = await this.render3d(request, options);
    const completed = await this.jobs.waitFor<Render3dResult>(job.job_id, options);
    return completed.result!;
  }
}
