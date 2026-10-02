import test from "node:test";
import assert from "node:assert/strict";
import { MlsApiClient, isIngestJob } from "../src/index.js";
import { DEFAULT_BASE_URL, SDK_VERSION } from "../src/config.js";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// Shape produced by the server's normalizeBaseListing (src/normalizer.ts).
const listing = {
  source: "live",
  mls_id: "A12079565",
  status: "for_sale",
  price: 525000,
  currency: "USD",
  address: { street: "1 Main St", city: "Miami", state: "FL", zip: "33101", formatted: "1 Main St, Miami, FL 33101" },
  specifications: { beds: 4, baths_full: 2, baths_half: 0, sqft: 1800, property_type: "SingleFamily" },
  features: {},
  photos: ["https://cdn.example.com/1.jpg"],
  photo_count: 1,
  agent: { name: "Agent" },
  description: "",
  meta: {},
};

// 202 body from handleBaseListingLookup in server.ts.
const pending = {
  job_id: "job_01ABC",
  mls_id: "A12079565",
  status: "queued",
  step: "queued",
  estimated_completion_seconds: 15,
  status_url: "/jobs/job_01ABC",
};

test("default base URL is https://mlsapi.dev", async () => {
  assert.equal(DEFAULT_BASE_URL, "https://mlsapi.dev");
  assert.equal(SDK_VERSION, "1.0.1");

  let capturedUrl = "";
  const client = new MlsApiClient({
    apiKey: "k",
    fetch: async (input) => {
      capturedUrl = input.toString();
      return json(listing);
    },
  });
  assert.equal(client.getHttpClient().getBaseUrl(), "https://mlsapi.dev");
  await client.listings.get("A12079565");
  assert.equal(capturedUrl, "https://mlsapi.dev/v1/listing/A12079565");
});

test("isIngestJob distinguishes the 202 job body from a normalized listing", () => {
  assert.equal(isIngestJob(pending as any), true);
  assert.equal(isIngestJob(listing as any), false);
});

test("getAndWait returns a 200 listing immediately without polling", async () => {
  const calls: string[] = [];
  const client = new MlsApiClient({
    apiKey: "k",
    baseUrl: "https://mock.test",
    fetch: async (input) => {
      calls.push(new URL(input.toString()).pathname);
      return json(listing);
    },
  });
  const result = await client.listings.getAndWait("A12079565", { pollIntervalMs: 5 });
  assert.equal(result.mls_id, "A12079565");
  assert.deepEqual(calls, ["/v1/listing/A12079565"]);
});

test("getAndWait polls /jobs/:id after a 202 and then returns the listing", async () => {
  const calls: string[] = [];
  let lookups = 0;
  let polls = 0;
  const client = new MlsApiClient({
    apiKey: "k",
    baseUrl: "https://mock.test",
    fetch: async (input) => {
      const path = new URL(input.toString()).pathname;
      calls.push(path);
      if (path === "/v1/listing/A12079565") {
        lookups++;
        return lookups === 1 ? json(pending, 202) : json(listing);
      }
      if (path === "/jobs/job_01ABC") {
        polls++;
        // Raw queue record from GET /jobs/:id uses camelCase keys.
        return json({
          id: "job_01ABC",
          mlsId: "A12079565",
          status: polls < 2 ? "processing" : "completed",
          step: polls < 2 ? "apify" : "done",
          progress: { message: "" },
          options: {},
          createdAt: new Date().toISOString(),
        });
      }
      return json({ error: "unexpected" }, 404);
    },
  });

  const steps: string[] = [];
  const result = await client.listings.getAndWait("A12079565", {
    pollIntervalMs: 5,
    timeoutMs: 2000,
    onProgress: (job) => steps.push(job.step),
  });
  assert.equal(result.specifications.beds, 4);
  assert.equal(polls, 2);
  assert.deepEqual(steps, ["apify", "done"]);
  assert.deepEqual(calls, [
    "/v1/listing/A12079565",
    "/jobs/job_01ABC",
    "/jobs/job_01ABC",
    "/v1/listing/A12079565",
  ]);
});

test("getAndWait surfaces a failed ingest job with its id", async () => {
  const client = new MlsApiClient({
    apiKey: "k",
    baseUrl: "https://mock.test",
    fetch: async (input) => {
      const path = new URL(input.toString()).pathname;
      if (path.startsWith("/v1/listing/")) return json(pending, 202);
      return json({ id: "job_01ABC", mlsId: "A12079565", status: "failed", step: "error", error: "MLS not found", progress: { message: "" }, options: {}, createdAt: "" });
    },
  });
  await assert.rejects(
    client.listings.getAndWait("A12079565", { pollIntervalMs: 5, timeoutMs: 1000 }),
    (err: any) => {
      assert.match(err.message, /MLS not found/);
      assert.equal(err.jobId, "job_01ABC");
      return true;
    }
  );
});
