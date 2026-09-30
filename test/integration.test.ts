import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MlsApiClient } from "../src/index.js";

import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../../..");
const isMonorepo = fs.existsSync(path.resolve(projectRoot, "src/server.ts"));

test("Full End-to-End SDK Integration against local mlsapi server", { skip: !isMonorepo }, async (t) => {
  process.env.NODE_ENV = "test";
  process.chdir(projectRoot);

  // Import backend D1 and Hono server
  const { getDb, initializeDatabase } = await import("../../../src/db/d1.js");
  const { default: app } = await import("../../../src/server.js");

  const db = getDb();
  await initializeDatabase(db);

  // 1. Authenticate to create a valid test API key
  const loginRes = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "jordan@harborrealty.com",
      password: "password123",
    }),
  });

  assert.equal(loginRes.status, 200, "Login should succeed");
  const cookie = loginRes.headers.get("set-cookie");

  const createKeyRes = await app.request("/api/keys", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify({ name: "SDK Live Integration Key", env: "live" }),
  });

  assert.ok([200, 201].includes(createKeyRes.status), "API key creation should succeed");
  const keyData = await createKeyRes.json();
  const apiKey = keyData.secret;
  assert.ok(apiKey.startsWith("sk_live_"), "Generated key should have live prefix");

  // 2. Initialize MlsApiClient with live adapter
  const client = new MlsApiClient({
    apiKey,
    baseUrl: "http://localhost:3000",
    fetch: async (input, init) => {
      const req = new Request(input, init);
      return app.fetch(req);
    },
  });

  await t.test("Account verification and billing overview", async () => {
    const check = await client.account.verifyKey();
    assert.equal(check.valid, true);

    const billing = await client.account.getBillingOverview();
    assert.ok(billing.workspace);
    assert.ok(billing.plan);
    assert.ok(["active", "canceled", "past_due", "trialing"].includes(billing.plan.status!));
    assert.ok(typeof billing.plan.monthlyCreditsRemaining === "number");
  });

  await t.test("Fetch Base Listing (A12079565)", async () => {
    const listing = await client.listings.get("A12079565");
    assert.ok("specifications" in listing, "Listing should be resolved and normalized");
    assert.equal(listing.mls_id, "A12079565");
    assert.ok(listing.price > 0);
    assert.ok(listing.address.formatted.length > 0);
    assert.ok(Array.isArray(listing.photos));
    assert.ok(listing.photos.length > 0);
  });

  await t.test("Fetch Property Intelligence (A12079565)", async () => {
    const intel = await client.intelligence.get("A12079565", {
      includeLlm: false,
    });
    assert.equal(intel.mls_id, "A12079565");
    assert.ok(intel.summary);
    assert.ok(intel.public_records);
  });

  await t.test("Upload local image to Studio CDN", async () => {
    const samplePhotoPath = path.resolve(__dirname, "../../../test/empty_living_room.jpg");
    const upload = await client.studio.upload(samplePhotoPath, {
      filename: "test_empty_room.jpg",
      contentType: "image/jpeg",
    });

    assert.equal(upload.success, true);
    assert.ok(upload.url.startsWith("http"));
    assert.equal(upload.filename, "test_empty_room.jpg");
    assert.ok(upload.size > 0);
  });

  await t.test("Dispatch Virtual Staging operation and check job status", async () => {
    const job = await client.studio.staging.stage({
      photo_url: "http://localhost:3000/output/sample.jpg",
      room_type: "living_room",
      style: "modern",
    });

    assert.ok(job.job_id);
    assert.ok(["queued", "processing", "completed"].includes(job.status));
    assert.ok(job.status_url);

    // Check status via jobs endpoint
    const tracked = await client.studio.jobs.get(job.job_id);
    assert.equal(tracked.job_id, job.job_id);
    assert.equal(tracked.type, "staging_furnish");
  });

  await t.test("Analyze Floor Plan", async () => {
    const analysis = await client.studio.floorplan.analyze({
      floorplan_image_url: "http://localhost:3000/output/sample_floorplan.jpg",
      style: "scandinavian",
    });

    assert.equal(analysis.style, "scandinavian");
    assert.ok(analysis.spatial_summary);
    assert.ok(Array.isArray(analysis.rooms));
  });
});
