/**
 * Example: Virtual Staging an empty room photo with real-time polling
 * Run with: npx tsx examples/virtual-staging.ts
 */
import { MlsApiClient } from "../src/index.js";

const apiKey = process.env.MLSAPI_KEY || "sk_live_demo";
const mls = new MlsApiClient({
  apiKey,
  baseUrl: process.env.MLSAPI_BASE_URL || "https://mlsapi.dev",
});

async function main() {
  const photoUrl =
    process.env.PHOTO_URL ||
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80";

  console.log("🛋️ Triggering AI Virtual Room Staging...\n");
  console.log(`Input Photo: ${photoUrl}`);

  try {
    // Stage empty room and poll until completion
    const staged = await mls.studio.staging.stageAndWait(
      {
        photo_url: photoUrl,
        room_type: "living_room",
        style: "scandinavian",
        preserve_flooring: true,
        custom_staging_instructions:
          "Modern light wood furniture, cream boucle sofa, beige textured area rug, and indoor plants",
      },
      {
        pollIntervalMs: 2_000,
        timeoutMs: 120_000,
        onProgress: (job) => {
          console.log(`   ⏳ [${job.progress_percentage}%] Step: ${job.current_step}`);
        },
      }
    );

    console.log("\n==================================================");
    console.log("✨ Virtual Staging Completed!");
    console.log("==================================================");
    console.log(`🖼️ High-Res Staged Photo: ${staged.staged_photo_url}`);
    console.log(`↔️ Before/After Comparison: ${staged.before_after_comparison_url}`);
    console.log(`🛋️ Staging Manifest:`, staged.staging_manifest);
  } catch (error: any) {
    console.error("❌ Staging error:", error.message);
  }
}

main();
