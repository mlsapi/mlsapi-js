/**
 * Example: 2D Floor Plan Analysis & 3D Isometric Dollhouse Rendering
 * Run with: npx tsx examples/floorplan-to-3d.ts
 */
import { MlsApiClient } from "../src/index.js";

const apiKey = process.env.MLSAPI_KEY || "sk_live_demo";
const mls = new MlsApiClient({
  apiKey,
  baseUrl: process.env.MLSAPI_BASE_URL || "https://mlsapi.dev",
});

async function main() {
  const floorplanUrl =
    process.env.FLOORPLAN_URL ||
    "https://cdn.mlsapi.dev/samples/floorplan_sample.png";

  console.log("📐 Analyzing 2D Floor Plan Geometry...\n");
  console.log(`Blueprint URL: ${floorplanUrl}`);

  try {
    // 1. Analyze floor plan layout
    const analysis = await mls.studio.floorplan.analyze({
      floorplan_image_url: floorplanUrl,
      style: "modern",
    });

    console.log("==================================================");
    console.log("📊 Spatial Layout Analysis");
    console.log("--------------------------------------------------");
    console.log(`Total Rooms: ${analysis.spatial_summary.total_rooms_detected}`);
    console.log(`Stories: ${analysis.spatial_summary.stories}`);
    console.log(`Layout Type: ${analysis.spatial_summary.layout_type}`);
    console.log(`Design System Applied: Style=${analysis.design_system.overall_style}, Flooring=${analysis.design_system.flooring}`);
    console.log("\nDetected Rooms:");
    for (const room of analysis.rooms) {
      console.log(`   • ${room.name} (${room.approx_size} size, function: ${room.function})`);
    }

    // 2. Render 3D isometric cutaway dollhouse
    console.log("\n==================================================");
    console.log("🏗️ Rendering 3D Isometric Dollhouse Cutaway Model...");
    console.log("--------------------------------------------------");

    const dollhouse = await mls.studio.floorplan.render3dAndWait(
      {
        floorplan_image_url: floorplanUrl,
        style: "modern",
        include_room_closeups: true,
      },
      {
        pollIntervalMs: 2_500,
        timeoutMs: 120_000,
        onProgress: (job) => {
          console.log(`   ⏳ [${job.progress_percentage}%] ${job.current_step}`);
        },
      }
    );

    console.log("\n✨ 3D Dollhouse Model Ready!");
    console.log(`🏠 Isometric Dollhouse: ${dollhouse.isometric_3d_dollhouse_url}`);
    console.log(`🔍 Thumbnail: ${dollhouse.thumbnail_url}`);
    if (dollhouse.room_renders?.length) {
      console.log("🔎 Room Closeups:");
      for (const render of dollhouse.room_renders) {
        console.log(`   • ${render.room_name}: ${render.image_url}`);
      }
    }
  } catch (error: any) {
    console.error("❌ Floorplan error:", error.message);
  }
}

main();
