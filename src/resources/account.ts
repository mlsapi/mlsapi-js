import type { HttpClient } from "../http.js";
import type { RequestOptions } from "../types/common.js";

export interface BillingOverview {
  workspace: {
    id: string;
    name: string;
    billingEmail?: string;
    planTier?: string;
    planStatus?: string;
  };
  plan?: {
    id?: string;
    name?: string;
    status?: string;
    monthlyCreditsAllowance?: number;
    monthlyCreditsRemaining?: number;
    topupCreditsBalance?: number;
    totalCreditsAvailable?: number;
    overagePerCredit?: number;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
  };
  credits?: {
    monthlyAllowance?: number;
    creditsUsedThisMonth?: number;
    creditsRemaining?: number;
    topUpBalance?: number;
  };
  usage?: {
    periodEndpointUsage?: Record<string, number>;
    dailyRequests?: any[];
  };
}

export class AccountResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Fetch current workspace billing, plan tier, and real-time credit balance.
   */
  public async getBillingOverview(
    options?: RequestOptions
  ): Promise<BillingOverview> {
    return this.http.get<BillingOverview>("/api/billing/overview", options);
  }

  /**
   * Lightweight connection check to verify the API key is active.
   */
  public async verifyKey(
    options?: RequestOptions
  ): Promise<{ valid: boolean; workspaceId?: string; planTier?: string }> {
    try {
      const data = await this.getBillingOverview(options);
      return {
        valid: true,
        workspaceId: data.workspace?.id,
        planTier: data.plan?.name || data.workspace?.planTier,
      };
    } catch {
      return { valid: false };
    }
  }
}
