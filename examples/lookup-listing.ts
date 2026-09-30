/**
 * Example: Look up MLS listing data and property intelligence
 * Run with: npx tsx examples/lookup-listing.ts
 */
import { MlsApiClient } from "../src/index.js";

const apiKey = process.env.MLSAPI_KEY || "sk_live_demo";
const mls = new MlsApiClient({
  apiKey,
  baseUrl: process.env.MLSAPI_BASE_URL || "https://api.mlsapi.dev",
});

async function main() {
  const mlsId = process.env.MLS_ID || "A12079565";
  console.log(`🔍 Looking up MLS Listing: ${mlsId}...\n`);

  try {
    // 1. Fetch listing details (with auto-polling if ingestion is needed)
    const listing = await mls.listings.getAndWait(mlsId, {
      timeoutMs: 60_000,
      onProgress: (job) => {
        console.log(`   ⏳ Ingestion in progress: [${job.status}] ${job.step || "processing..."}`);
      },
    });

    console.log("==================================================");
    console.log(`🏡 ${listing.address.formatted}`);
    console.log(`💰 Price: $${listing.price.toLocaleString()} ${listing.currency}`);
    console.log(`📐 Specs: ${listing.specifications.beds} beds | ${listing.specifications.baths_full} baths | ${listing.specifications.sqft.toLocaleString()} sqft`);
    console.log(`🏢 Status: ${listing.status} (${listing.source})`);
    console.log(`📸 Photos: ${listing.photo_count} downloaded high-resolution images`);
    if (listing.photos.length > 0) {
      console.log(`   First photo: ${listing.photos[0]}`);
    }
    console.log("==================================================\n");

    // 2. Fetch Deep Property Intelligence & CapEx Analysis
    console.log("🧠 Fetching AI Property Intelligence & CapEx estimates...");
    const intel = await mls.intelligence.get(mlsId, {
      includeLlm: true,
      investorMode: true,
    });

    if (intel.llm_derived_intelligence) {
      const { systems_and_capex, investor_insights } = intel.llm_derived_intelligence;

      console.log("\n🛠️ Structural Systems Lifespan:");
      if (systems_and_capex.roof) {
        console.log(`   • Roof: Condition = ${systems_and_capex.roof.condition}, Est. Replacement = ${systems_and_capex.roof.estimated_replacement_horizon}`);
      }
      if (systems_and_capex.hvac) {
        console.log(`   • HVAC: Condition = ${systems_and_capex.hvac.condition}, Est. Replacement = ${systems_and_capex.hvac.estimated_replacement_horizon}`);
      }
      if (systems_and_capex.storm_protection) {
        console.log(`   • Impact Windows: ${systems_and_capex.storm_protection.has_impact_windows ? "Yes ✅" : "No ❌"} (${systems_and_capex.storm_protection.insurance_premium_impact})`);
      }

      console.log("\n📈 Investor Metrics:");
      console.log(`   • Est. Monthly Rent: $${investor_insights.estimated_monthly_rent.median.toLocaleString()}/mo (range: $${investor_insights.estimated_monthly_rent.low.toLocaleString()} - $${investor_insights.estimated_monthly_rent.high.toLocaleString()})`);
      console.log(`   • Est. Gross Yield: ${investor_insights.estimated_gross_yield_pct}%`);
      console.log(`   • HOA Present: ${investor_insights.hoa_present ? "Yes" : "No"}`);
      console.log(`   • Rental Restrictions: ${investor_insights.rental_restrictions}`);
    }
  } catch (error: any) {
    console.error("❌ Error looking up listing:", error.message);
  }
}

main();
