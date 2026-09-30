export type Environment = "live" | "test";

export interface MlsApiClientOptions {
  /**
   * Your secret API key from mlsapi.dev.
   * If omitted, will default to process.env.MLSAPI_KEY.
   */
  apiKey?: string;

  /**
   * Environment to target: "live" for production, "test" for sandbox.
   * Defaults to "live".
   */
  environment?: Environment;

  /**
   * Base URL of the MLS API. Defaults to https://api.mlsapi.dev.
   */
  baseUrl?: string;

  /**
   * Default timeout in milliseconds for standard requests. Defaults to 60,000ms.
   */
  timeoutMs?: number;

  /**
   * Maximum number of automatic retries on 429 rate limit or 5xx server errors.
   * Defaults to 3.
   */
  maxRetries?: number;

  /**
   * Custom fetch function if overriding runtime global fetch.
   */
  fetch?: typeof globalThis.fetch;
}

export interface RequestOptions {
  timeoutMs?: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface PollingOptions {
  /**
   * Interval in milliseconds between poll attempts. Defaults to 2,000ms.
   */
  pollIntervalMs?: number;

  /**
   * Maximum timeout in milliseconds before failing with JobTimeoutError.
   * Defaults to 90,000ms.
   */
  timeoutMs?: number;

  /**
   * Optional callback invoked whenever job progress updates.
   */
  onProgress?: (job: any) => void;

  /**
   * Optional AbortSignal to cancel polling early.
   */
  signal?: AbortSignal;
}

export interface ApiErrorResponse {
  error: {
    code?: string;
    message: string;
    details?: unknown;
  } | string;
}
