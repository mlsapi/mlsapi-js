import type { HttpClient } from "../http.js";
import type {
  ContentGenerationRequest,
  ContentGenerationResult,
} from "../types/content.js";
import type { RequestOptions } from "../types/common.js";

export class ContentResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Generate multi-channel real estate marketing copy from listing facts and AI synthesis.
   */
  public async generate(
    mlsId: string,
    request: ContentGenerationRequest,
    requestOptions?: RequestOptions
  ): Promise<ContentGenerationResult> {
    return this.http.post<ContentGenerationResult>(
      `/v1/listing/${encodeURIComponent(mlsId)}/content`,
      request,
      requestOptions
    );
  }
}
