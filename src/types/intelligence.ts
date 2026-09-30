export interface SystemCondition {
  age_years?: number;
  material?: string;
  condition?: string;
  estimated_replacement_horizon?: string;
  confidence?: number;
}

export interface LlmIntelligence {
  systems_and_capex: {
    roof?: SystemCondition;
    hvac?: SystemCondition;
    water_heater?: SystemCondition;
    appliances?: Record<string, unknown>;
    storm_protection?: {
      has_impact_windows: boolean;
      has_impact_doors: boolean;
      insurance_premium_impact: string;
    };
  };
  investor_insights: {
    estimated_monthly_rent: { low: number; median: number; high: number };
    estimated_gross_yield_pct: number;
    hoa_present: boolean;
    rental_restrictions: string;
    tenant_suitability: string;
  };
  financial_flags: Array<{
    type: string;
    severity: "low" | "medium" | "high";
    summary: string;
    explanation: string;
  }>;
  property_strengths: string[];
  watch_items: string[];
}

export interface PropertyIntelligence {
  mls_id: string;
  parcel_id?: string;
  summary: {
    address: string;
    listing_price: number;
    beds: number;
    baths: number;
    sqft: number;
  };
  public_records: {
    ownership: {
      parcel_id?: string;
      subdivision?: string;
      last_sale_date?: string;
      last_sale_price?: number;
      prior_sales_count: number;
      sales_history: Array<{ date: string; event: string; price: number; source: string }>;
    };
    tax_assessment: {
      current_tax_year?: number;
      annual_tax_amount?: number;
      current_assessed_value?: number;
      historical: Array<{ year: number; tax_paid: number; assessed_value: number; tax_increase_pct?: number }>;
    };
    schools: {
      elementary?: { name: string; type?: string };
      middle?: { name: string; type?: string };
      high?: { name: string; type?: string };
    };
  };
  llm_derived_intelligence: LlmIntelligence | null;
  generated_at: string;
}

export interface IntelligenceOptions {
  includeLlm?: boolean;
  investorMode?: boolean;
}
