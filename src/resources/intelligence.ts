import type { HttpClient } from "../http.js";
import type { PropertyIntelligence, IntelligenceOptions } from "../types/intelligence.js";
import type { RequestOptions } from "../types/common.js";

export class IntelligenceResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Synthesize comprehensive property intelligence, tax records, school ratings,
   * CapEx equipment lifespans (roof, HVAC, impact windows), and investor yields.
   */
  public async get(
    mlsId: string,
    options: IntelligenceOptions = {},
    requestOptions?: RequestOptions
  ): Promise<PropertyIntelligence> {
    const params = new URLSearchParams();
    if (options.includeLlm !== undefined) {
      params.set("include_llm", String(options.includeLlm));
    }
    if (options.investorMode !== undefined) {
      params.set("investor_mode", String(options.investorMode));
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    return this.http.get<PropertyIntelligence>(
      `/v1/listing/${encodeURIComponent(mlsId)}/intelligence${query}`,
      requestOptions
    );
  }
}
