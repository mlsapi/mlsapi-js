import {
  MlsApiError,
  AuthenticationError,
  PermissionDeniedError,
  NotFoundError,
  InvalidRequestError,
  RateLimitError,
} from "./errors.js";
import {
  DEFAULT_BASE_URL,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_MAX_RETRIES,
  SDK_VERSION,
} from "./config.js";
import type { MlsApiClientOptions, RequestOptions } from "./types/common.js";

export class HttpClient {
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly environment: "live" | "test";
  private readonly defaultTimeoutMs: number;
  private readonly maxRetries: number;
  private readonly customFetch: typeof globalThis.fetch;

  constructor(options: MlsApiClientOptions = {}) {
    this.apiKey = options.apiKey || (typeof process !== "undefined" ? process.env?.["MLSAPI_KEY"] : undefined);
    this.environment = options.environment ?? "live";
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.defaultTimeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.customFetch = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  public getApiKey(): string | undefined {
    return this.apiKey;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("GET", path, undefined, options);
  }

  public async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>("POST", path, body, options);
  }

  public async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>("PUT", path, body, options);
  }

  public async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("DELETE", path, undefined, options);
  }

  public async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = path.startsWith("http://") || path.startsWith("https://")
      ? path
      : `${this.baseUrl}/${path.replace(/^\/+/, "")}`;

    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": `mlsapi-node/${SDK_VERSION}`,
      "x-key-env": this.environment,
      ...options.headers,
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
      headers["x-api-key"] = this.apiKey;
    }

    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    if (body !== undefined && !isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const requestBody = isFormData
      ? (body as FormData)
      : body !== undefined
      ? JSON.stringify(body)
      : undefined;

    let attempt = 0;
    const maxAttempts = method === "GET" || method === "DELETE" ? this.maxRetries + 1 : 2;

    while (attempt < maxAttempts) {
      attempt++;

      const controller = new AbortController();
      const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;
      const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);

      // Merge caller signal if provided
      if (options.signal) {
        options.signal.addEventListener("abort", () => controller.abort());
      }

      try {
        const response = await this.customFetch(url, {
          method,
          headers,
          body: requestBody,
          signal: controller.signal,
        });

        clearTimeout(timeoutTimer);

        // Check for rate limits or server errors that warrant a retry
        if ((response.status === 429 || response.status >= 500) && attempt < maxAttempts) {
          const retryAfterHeader = response.headers.get("Retry-After");
          const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : 500 * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, retryAfterMs));
          continue;
        }

        // Parse response body
        const contentType = response.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");
        const rawText = await response.text();
        let data: any = rawText;

        if (isJson && rawText.trim().length > 0) {
          try {
            data = JSON.parse(rawText);
          } catch {
            data = { raw: rawText };
          }
        }

        if (!response.ok) {
          this.handleHttpError(response.status, data);
        }

        return data as T;
      } catch (err: any) {
        clearTimeout(timeoutTimer);

        if (err.name === "AbortError") {
          throw new MlsApiError(`Request to ${url} timed out after ${timeoutMs}ms`, {
            code: "REQUEST_TIMEOUT",
          });
        }

        if (err instanceof MlsApiError) {
          throw err;
        }

        if (attempt >= maxAttempts) {
          throw new MlsApiError(err.message || "Network request failed", {
            code: "NETWORK_ERROR",
            details: err,
          });
        }

        // Exponential backoff before retry
        await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, attempt)));
      }
    }

    throw new MlsApiError("Maximum retry attempts reached without response", {
      code: "MAX_RETRIES_EXCEEDED",
    });
  }

  private handleHttpError(status: number, body: any): never {
    const message =
      typeof body?.error === "string"
        ? body.error
        : body?.error?.message ||
          body?.message ||
          `HTTP Error ${status}`;

    const code = body?.error?.code || body?.code;
    const details = body?.error?.details || body;

    switch (status) {
      case 401:
        throw new AuthenticationError(message, { details });
      case 403:
        throw new PermissionDeniedError(message, { details });
      case 404:
        throw new NotFoundError(message, { details });
      case 400:
        throw new InvalidRequestError(message, { details });
      case 429: {
        const retryHeader = typeof details?.retry_after === "number" ? details.retry_after : undefined;
        throw new RateLimitError(message, { retryAfterSeconds: retryHeader, details });
      }
      default:
        throw new MlsApiError(message, { status, code, details, rawBody: body });
    }
  }
}
