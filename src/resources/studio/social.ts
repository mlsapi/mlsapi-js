import type { HttpClient } from "../../http.js";
import type {
  SocialPublishRequest,
  SocialPublishResult,
} from "../../types/studio.js";
import type { RequestOptions } from "../../types/common.js";

export class StudioSocialResource {
  constructor(private readonly http: HttpClient) {}

  public async publish(
    request: SocialPublishRequest,
    options?: RequestOptions
  ): Promise<SocialPublishResult> {
    return this.http.post<SocialPublishResult>(
      "/v1/studio/social/publish",
      request,
      options
    );
  }
}
