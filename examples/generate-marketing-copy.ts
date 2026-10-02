/**
 * Example: Generate multi-channel marketing copy and social media posts
 * Run with: npx tsx examples/generate-marketing-copy.ts
 */
import { MlsApiClient } from "../src/index.js";

const apiKey = process.env.MLSAPI_KEY || "sk_live_demo";
const mls = new MlsApiClient({
  apiKey,
  baseUrl: process.env.MLSAPI_BASE_URL || "https://mlsapi.dev",
});

async function main() {
  const mlsId = process.env.MLS_ID || "A12079565";
  console.log(`✍️ Generating AI Marketing Copy for Listing: ${mlsId}...\n`);

  try {
    const { content: copy } = await mls.content.generate(mlsId, {
      outputs: [
        "social",
        "email_blast",
        "video_script",
        "flyer_bullets",
        "mls_remarks",
      ],
      social_platforms: ["instagram", "linkedin", "facebook"],
      tone: "luxury",
      target_audience: "Discerning luxury homebuyer relocating to coastal Florida",
    });

    console.log("==================================================");
    console.log("📸 INSTAGRAM POST");
    console.log("--------------------------------------------------");
    if (copy.social?.instagram) {
      console.log(`Hook: ${copy.social.instagram.hook_above_fold}\n`);
      console.log(`Caption:\n${copy.social.instagram.caption}\n`);
      console.log(`Hashtags: ${copy.social.instagram.hashtags.join(" ")}\n`);
    }

    console.log("==================================================");
    console.log("💼 LINKEDIN MARKET BREAKDOWN");
    console.log("--------------------------------------------------");
    if (copy.social?.linkedin) {
      console.log(`${copy.social.linkedin.post_copy}\n`);
      console.log(`Hashtags: ${copy.social.linkedin.hashtags.join(" ")}\n`);
    }

    console.log("==================================================");
    console.log("🎬 TIKTOK / REELS VIDEO SCRIPT");
    console.log("--------------------------------------------------");
    if (copy.video_script) {
      console.log(`Duration: ${copy.video_script.duration_seconds}s | Hook: "${copy.video_script.hook}"\n`);
      for (const scene of copy.video_script.scenes) {
        console.log(`[${scene.second_range}] 📹 Shot: ${scene.visual}`);
        console.log(`             🎙️ Voice: "${scene.voiceover}"`);
      }
    }

    console.log("\n==================================================");
    console.log("📋 MLS PUBLIC REMARKS");
    console.log("--------------------------------------------------");
    if (copy.mls_remarks) {
      console.log(copy.mls_remarks);
      console.log(`\n(Length: ${copy.mls_remarks.length} characters)`);
    }
  } catch (error: any) {
    console.error("❌ Content generation error:", error.message);
  }
}

main();
