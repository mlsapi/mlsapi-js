export class MlsApiError extends Error {
  public readonly status?: number;
  public readonly code?: string;
  public readonly details?: unknown;
  public readonly rawBody?: unknown;

  constructor(
    message: string,
    options: {
      status?: number;
      code?: string;
      details?: unknown;
      rawBody?: unknown;
    } = {}
  ) {
    super(message);
    this.name = "MlsApiError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.rawBody = options.rawBody;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthenticationError extends MlsApiError {
  constructor(message = "Authentication failed. Please verify your MLS API key.", options: { details?: unknown } = {}) {
    super(message, { status: 401, code: "UNAUTHORIZED", ...options });
    this.name = "AuthenticationError";
  }
}

export class PermissionDeniedError extends MlsApiError {
  constructor(message = "Permission denied for this operation or plan tier.", options: { details?: unknown } = {}) {
    super(message, { status: 403, code: "FORBIDDEN", ...options });
    this.name = "PermissionDeniedError";
  }
}

export class NotFoundError extends MlsApiError {
  constructor(message = "The requested listing, job, or resource was not found.", options: { details?: unknown } = {}) {
    super(message, { status: 404, code: "NOT_FOUND", ...options });
    this.name = "NotFoundError";
  }
}

export class InvalidRequestError extends MlsApiError {
  constructor(message: string, options: { details?: unknown } = {}) {
    super(message, { status: 400, code: "BAD_REQUEST", ...options });
    this.name = "InvalidRequestError";
  }
}

export class RateLimitError extends MlsApiError {
  public readonly retryAfterSeconds?: number;

  constructor(
    message = "Rate limit or credit quota exceeded. Please slow down requests.",
    options: { retryAfterSeconds?: number; details?: unknown } = {}
  ) {
    super(message, { status: 429, code: "RATE_LIMITED", details: options.details });
    this.name = "RateLimitError";
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

export class StudioJobFailedError extends MlsApiError {
  public readonly jobId: string;

  constructor(jobId: string, message = "Studio AI processing job failed", options: { details?: unknown } = {}) {
    super(message, { status: 500, code: "JOB_FAILED", details: options.details });
    this.name = "StudioJobFailedError";
    this.jobId = jobId;
  }
}

export class JobTimeoutError extends MlsApiError {
  public readonly jobId: string;
  public readonly timeoutMs: number;

  constructor(jobId: string, timeoutMs: number) {
    super(`Job '${jobId}' exceeded maximum polling timeout of ${timeoutMs}ms`, {
      code: "JOB_TIMEOUT",
    });
    this.name = "JobTimeoutError";
    this.jobId = jobId;
    this.timeoutMs = timeoutMs;
  }
}
