import type { HttpClient } from "../../http.js";
import type { StudioJobsResource } from "./jobs.js";
import type {
  StagingFurnishRequest,
  StagingFurnishResult,
  DeclutterRequest,
  DeclutterResult,
  TwilightRequest,
  TwilightResult,
  DeStageEmptyRequest,
  DeStageEmptyResult,
  RestyleRequest,
  RestyleResult,
  ReplaceFurnitureRequest,
  ReplaceFurnitureResult,
  ReplaceMaterialRequest,
  ReplaceMaterialResult,
  WallColorsRequest,
  WallColorsResult,
  StudioJob,
} from "../../types/studio.js";
import type { PollingOptions, RequestOptions } from "../../types/common.js";

export class StudioStagingResource {
  constructor(
    private readonly http: HttpClient,
    private readonly jobs: StudioJobsResource
  ) {}

  // 1. Stage / Furnish
  public async stage(
    request: StagingFurnishRequest,
    options?: RequestOptions
  ): Promise<StudioJob<StagingFurnishResult>> {
    return this.http.post<StudioJob<StagingFurnishResult>>(
      "/v1/studio/staging/stage",
      request,
      options
    );
  }

  public async stageAndWait(
    request: StagingFurnishRequest,
    options?: PollingOptions & RequestOptions
  ): Promise<StagingFurnishResult> {
    const job = await this.stage(request, options);
    const completed = await this.jobs.waitFor<StagingFurnishResult>(job.job_id, options);
    return completed.result!;
  }

  public async furnish(
    request: StagingFurnishRequest,
    options?: RequestOptions
  ): Promise<StudioJob<StagingFurnishResult>> {
    return this.stage(request, options);
  }

  public async furnishAndWait(
    request: StagingFurnishRequest,
    options?: PollingOptions & RequestOptions
  ): Promise<StagingFurnishResult> {
    return this.stageAndWait(request, options);
  }

  // 2. Declutter
  public async declutter(
    request: DeclutterRequest,
    options?: RequestOptions
  ): Promise<StudioJob<DeclutterResult>> {
    return this.http.post<StudioJob<DeclutterResult>>(
      "/v1/studio/staging/declutter",
      request,
      options
    );
  }

  public async declutterAndWait(
    request: DeclutterRequest,
    options?: PollingOptions & RequestOptions
  ): Promise<DeclutterResult> {
    const job = await this.declutter(request, options);
    const completed = await this.jobs.waitFor<DeclutterResult>(job.job_id, options);
    return completed.result!;
  }

  // 3. Twilight
  public async twilight(
    request: TwilightRequest,
    options?: RequestOptions
  ): Promise<StudioJob<TwilightResult>> {
    return this.http.post<StudioJob<TwilightResult>>(
      "/v1/studio/staging/twilight",
      request,
      options
    );
  }

  public async twilightAndWait(
    request: TwilightRequest,
    options?: PollingOptions & RequestOptions
  ): Promise<TwilightResult> {
    const job = await this.twilight(request, options);
    const completed = await this.jobs.waitFor<TwilightResult>(job.job_id, options);
    return completed.result!;
  }

  // 4. Empty Room
  public async empty(
    request: DeStageEmptyRequest,
    options?: RequestOptions
  ): Promise<StudioJob<DeStageEmptyResult>> {
    return this.http.post<StudioJob<DeStageEmptyResult>>(
      "/v1/studio/staging/empty",
      request,
      options
    );
  }

  public async emptyAndWait(
    request: DeStageEmptyRequest,
    options?: PollingOptions & RequestOptions
  ): Promise<DeStageEmptyResult> {
    const job = await this.empty(request, options);
    const completed = await this.jobs.waitFor<DeStageEmptyResult>(job.job_id, options);
    return completed.result!;
  }

  // 5. Restyle
  public async restyle(
    request: RestyleRequest,
    options?: RequestOptions
  ): Promise<StudioJob<RestyleResult>> {
    return this.http.post<StudioJob<RestyleResult>>(
      "/v1/studio/staging/restyle",
      request,
      options
    );
  }

  public async restyleAndWait(
    request: RestyleRequest,
    options?: PollingOptions & RequestOptions
  ): Promise<RestyleResult> {
    const job = await this.restyle(request, options);
    const completed = await this.jobs.waitFor<RestyleResult>(job.job_id, options);
    return completed.result!;
  }

  // 6. Replace Furniture
  public async replaceFurniture(
    request: ReplaceFurnitureRequest,
    options?: RequestOptions
  ): Promise<StudioJob<ReplaceFurnitureResult>> {
    return this.http.post<StudioJob<ReplaceFurnitureResult>>(
      "/v1/studio/staging/replace-furniture",
      request,
      options
    );
  }

  public async replaceFurnitureAndWait(
    request: ReplaceFurnitureRequest,
    options?: PollingOptions & RequestOptions
  ): Promise<ReplaceFurnitureResult> {
    const job = await this.replaceFurniture(request, options);
    const completed = await this.jobs.waitFor<ReplaceFurnitureResult>(job.job_id, options);
    return completed.result!;
  }

  // 7. Replace Material
  public async replaceMaterial(
    request: ReplaceMaterialRequest,
    options?: RequestOptions
  ): Promise<StudioJob<ReplaceMaterialResult>> {
    return this.http.post<StudioJob<ReplaceMaterialResult>>(
      "/v1/studio/staging/replace-material",
      request,
      options
    );
  }

  public async replaceMaterialAndWait(
    request: ReplaceMaterialRequest,
    options?: PollingOptions & RequestOptions
  ): Promise<ReplaceMaterialResult> {
    const job = await this.replaceMaterial(request, options);
    const completed = await this.jobs.waitFor<ReplaceMaterialResult>(job.job_id, options);
    return completed.result!;
  }

  // 8. Wall Colors
  public async wallColors(
    request: WallColorsRequest,
    options?: RequestOptions
  ): Promise<StudioJob<WallColorsResult>> {
    return this.http.post<StudioJob<WallColorsResult>>(
      "/v1/studio/staging/wall-colors",
      request,
      options
    );
  }

  public async wallColorsAndWait(
    request: WallColorsRequest,
    options?: PollingOptions & RequestOptions
  ): Promise<WallColorsResult> {
    const job = await this.wallColors(request, options);
    const completed = await this.jobs.waitFor<WallColorsResult>(job.job_id, options);
    return completed.result!;
  }
}
