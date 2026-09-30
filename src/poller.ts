import { JobTimeoutError, StudioJobFailedError } from "./errors.js";
import { DEFAULT_POLL_INTERVAL_MS, DEFAULT_POLL_TIMEOUT_MS } from "./config.js";
import type { PollingOptions } from "./types/common.js";

export async function pollJob<TJob extends { status: string; job_id?: string; error?: string }>(
  fetchStatus: () => Promise<TJob>,
  options: PollingOptions = {}
): Promise<TJob> {
  const intervalMs = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
  const timeoutMs = options.timeoutMs ?? DEFAULT_POLL_TIMEOUT_MS;
  const startTime = Date.now();
  let lastJob: TJob | undefined;

  while (Date.now() - startTime < timeoutMs) {
    if (options.signal?.aborted) {
      throw new Error("Polling aborted by caller");
    }

    const job = await fetchStatus();
    lastJob = job;

    if (options.onProgress) {
      try {
        options.onProgress(job);
      } catch (err) {
        console.warn("[MLSAPI Poller] onProgress callback threw an error:", err);
      }
    }

    if (job.status === "completed") {
      return job;
    }

    if (job.status === "failed") {
      const jobId = job.job_id || "unknown";
      throw new StudioJobFailedError(jobId, job.error || "Studio job execution failed", {
        details: job,
      });
    }

    // Wait for next interval
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  const jobId = lastJob?.job_id || "unknown";
  throw new JobTimeoutError(jobId, timeoutMs);
}
