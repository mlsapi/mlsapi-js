import test from "node:test";
import assert from "node:assert/strict";
import { MlsApiClient } from "../src/index.js";

test("Studio staging dispatch and auto-wait polling", async () => {
  let callCount = 0;

  const mockFetch: typeof globalThis.fetch = async (input, init) => {
    const url = input.toString();
    const method = init?.method || "GET";

    if (url.includes("/v1/studio/staging/stage") && method === "POST") {
      return new Response(
        JSON.stringify({
          job_id: "job_stage_123",
          status: "queued",
          progress_percentage: 10,
          current_step: "Queued",
          status_url: "/v1/studio/jobs/job_stage_123",
        }),
        { status: 202, headers: { "Content-Type": "application/json" } }
      );
    }

    if (url.includes("/v1/studio/jobs/job_stage_123")) {
      callCount++;
      if (callCount === 1) {
        return new Response(
          JSON.stringify({
            job_id: "job_stage_123",
            status: "processing",
            progress_percentage: 50,
            current_step: "Rendering furniture...",
            status_url: "/v1/studio/jobs/job_stage_123",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } else {
        return new Response(
          JSON.stringify({
            job_id: "job_stage_123",
            status: "completed",
            progress_percentage: 100,
            current_step: "Completed",
            status_url: "/v1/studio/jobs/job_stage_123",
            result: {
              staged_photo_url: "https://cdn.mlsapi.dev/staged.jpg",
              before_after_comparison_url: "https://cdn.mlsapi.dev/compare.jpg",
              room_type: "living_room",
              style: "scandinavian",
              staging_manifest: ["Sofa", "Rug", "Plant"],
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(JSON.stringify({ error: "Not matched" }), { status: 404 });
  };

  const client = new MlsApiClient({
    apiKey: "test_key",
    fetch: mockFetch,
  });

  const progressSteps: string[] = [];

  const result = await client.studio.staging.stageAndWait(
    {
      photo_url: "https://example.com/empty.jpg",
      room_type: "living_room",
      style: "scandinavian",
    },
    {
      pollIntervalMs: 10, // fast in tests
      timeoutMs: 1000,
      onProgress: (job) => {
        progressSteps.push(job.current_step);
      },
    }
  );

  assert.equal(result.staged_photo_url, "https://cdn.mlsapi.dev/staged.jpg");
  assert.equal(result.room_type, "living_room");
  assert.equal(result.style, "scandinavian");
  assert.deepEqual(result.staging_manifest, ["Sofa", "Rug", "Plant"]);
  assert.ok(progressSteps.includes("Rendering furniture..."));
  assert.ok(progressSteps.includes("Completed"));
});

test("Floorplan analysis and dollhouse 3D request", async () => {
  const mockFetch: typeof globalThis.fetch = async (input, init) => {
    const url = input.toString();
    if (url.includes("/v1/studio/floorplan/analyze")) {
      return new Response(
        JSON.stringify({
          style: "modern",
          spatial_summary: { total_rooms_detected: 4, stories: 1, layout_type: "open_concept" },
          rooms: [{ name: "Living Room", function: "living", approx_size: "large", position: "center", structural_features: [], connected_to: [] }],
          design_system: { flooring: "hardwood", wall_color_palette: ["#FFFFFF"], lighting_temperature: "warm", lighting_fixtures: "recessed", tactile_materials: [], overall_style: "modern" },
          isometric_3d_prompt: "Dollhouse prompt",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(JSON.stringify({ error: "Not matched" }), { status: 404 });
  };

  const client = new MlsApiClient({ apiKey: "test_key", fetch: mockFetch });
  const analysis = await client.studio.floorplan.analyze({
    floorplan_image_url: "https://example.com/plan.png",
    style: "modern",
  });

  assert.equal(analysis.spatial_summary.total_rooms_detected, 4);
  assert.equal(analysis.rooms[0]?.name, "Living Room");
});

test("Account verifyKey helper", async () => {
  const mockFetch: typeof globalThis.fetch = async () => {
    return new Response(
      JSON.stringify({
        workspace: { id: "ws_123", name: "Beverly Hills Team", planTier: "Pro", planStatus: "active" },
        credits: { monthlyAllowance: 500, creditsUsedThisMonth: 50, creditsRemaining: 450, topUpBalance: 100 },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  };

  const client = new MlsApiClient({ apiKey: "test_key", fetch: mockFetch });
  const check = await client.account.verifyKey();

  assert.equal(check.valid, true);
  assert.equal(check.workspaceId, "ws_123");
  assert.equal(check.planTier, "Pro");
});
