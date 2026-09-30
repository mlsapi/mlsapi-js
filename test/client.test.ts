import test from "node:test";
import assert from "node:assert/strict";
import {
  MlsApiClient,
  MlsApiError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
} from "../src/index.js";

test("MlsApiClient initializes with default options", () => {
  const client = new MlsApiClient({ apiKey: "test_key_123" });
  assert.ok(client);
  assert.ok(client.listings);
  assert.ok(client.intelligence);
  assert.ok(client.content);
  assert.ok(client.studio);
  assert.ok(client.studio.staging);
  assert.ok(client.studio.enhance);
  assert.ok(client.studio.floorplan);
  assert.ok(client.studio.render);
  assert.ok(client.studio.creatives);
  assert.ok(client.studio.social);
  assert.ok(client.studio.video);
  assert.ok(client.studio.jobs);
  assert.ok(client.account);
});

test("MlsApiClient passes custom baseUrl and headers", async () => {
  let capturedUrl = "";
  let capturedHeaders: Record<string, string> = {};

  const mockFetch: typeof globalThis.fetch = async (input, init) => {
    capturedUrl = input.toString();
    capturedHeaders = (init?.headers as Record<string, string>) || {};
    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const client = new MlsApiClient({
    apiKey: "sk_test_abc123",
    environment: "test",
    baseUrl: "https://mock.mlsapi.dev",
    fetch: mockFetch,
  });

  await client.listings.get("TEST_MLS_1");

  assert.equal(capturedUrl, "https://mock.mlsapi.dev/v1/listing/TEST_MLS_1");
  assert.equal(capturedHeaders["Authorization"], "Bearer sk_test_abc123");
  assert.equal(capturedHeaders["x-api-key"], "sk_test_abc123");
  assert.equal(capturedHeaders["x-key-env"], "test");
});

test("MlsApiClient maps HTTP 401 to AuthenticationError", async () => {
  const mockFetch: typeof globalThis.fetch = async () => {
    return new Response(JSON.stringify({ error: { code: "UNAUTHORIZED", message: "Invalid key" } }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  };

  const client = new MlsApiClient({
    apiKey: "bad_key",
    fetch: mockFetch,
  });

  await assert.rejects(
    async () => {
      await client.listings.get("MLS123");
    },
    (err: any) => {
      assert.ok(err instanceof AuthenticationError);
      assert.equal(err.status, 401);
      assert.equal(err.code, "UNAUTHORIZED");
      assert.equal(err.message, "Invalid key");
      return true;
    }
  );
});

test("MlsApiClient maps HTTP 404 to NotFoundError", async () => {
  const mockFetch: typeof globalThis.fetch = async () => {
    return new Response(JSON.stringify({ error: { code: "NOT_FOUND", message: "Listing not found" } }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  };

  const client = new MlsApiClient({
    apiKey: "test_key",
    fetch: mockFetch,
  });

  await assert.rejects(
    async () => {
      await client.listings.get("NONEXISTENT");
    },
    (err: any) => {
      assert.ok(err instanceof NotFoundError);
      assert.equal(err.status, 404);
      return true;
    }
  );
});

test("MlsApiClient maps HTTP 429 to RateLimitError with retryAfter", async () => {
  const mockFetch: typeof globalThis.fetch = async () => {
    return new Response(JSON.stringify({ error: { code: "RATE_LIMITED", message: "Slow down", details: { retry_after: 15 } } }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "15",
      },
    });
  };

  const client = new MlsApiClient({
    apiKey: "test_key",
    maxRetries: 0, // don't retry in test
    fetch: mockFetch,
  });

  await assert.rejects(
    async () => {
      await client.listings.get("MLS123");
    },
    (err: any) => {
      assert.ok(err instanceof RateLimitError);
      assert.equal(err.status, 429);
      assert.equal(err.retryAfterSeconds, 15);
      return true;
    }
  );
});
