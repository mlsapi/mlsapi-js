import { HttpClient } from "./http.js";
import { ListingsResource } from "./resources/listings.js";
import { IntelligenceResource } from "./resources/intelligence.js";
import { ContentResource } from "./resources/content.js";
import { StudioResource } from "./resources/studio/index.js";
import { AccountResource } from "./resources/account.js";
import type { MlsApiClientOptions } from "./types/common.js";

export class MlsApiClient {
  private readonly http: HttpClient;

  /**
   * Real-time MLS listing lookup, auto-ingestion, and background job polling.
   */
  public readonly listings: ListingsResource;

  /**
   * Property intelligence, CapEx life cycles (roof, HVAC), and investor yield metrics.
   */
  public readonly intelligence: IntelligenceResource;

  /**
   * Context-aware multi-channel marketing content and social media copy generation.
   */
  public readonly content: ContentResource;

  /**
   * Studio AI generative media suite: virtual staging, twilight, declutter, floorplans, video, and ads.
   */
  public readonly studio: StudioResource;

  /**
   * Account billing, credit meter, and key verification.
   */
  public readonly account: AccountResource;

  constructor(options: MlsApiClientOptions = {}) {
    this.http = new HttpClient(options);

    this.listings = new ListingsResource(this.http);
    this.intelligence = new IntelligenceResource(this.http);
    this.content = new ContentResource(this.http);
    this.studio = new StudioResource(this.http);
    this.account = new AccountResource(this.http);
  }

  /**
   * Access the underlying HTTP client for custom requests.
   */
  public getHttpClient(): HttpClient {
    return this.http;
  }
}
