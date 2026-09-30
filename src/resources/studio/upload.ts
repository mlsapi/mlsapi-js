import type { HttpClient } from "../../http.js";
import type { UploadResult, UploadOptions } from "../../types/studio.js";
import type { RequestOptions } from "../../types/common.js";

export class StudioUploadResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Upload an image or video file to the mlsapi.dev CDN.
   * Accepts a File, Blob, Buffer, Uint8Array, or local file path string (in Node.js).
   */
  public async upload(
    fileOrPath: File | Blob | Uint8Array | ArrayBuffer | string,
    options: UploadOptions = {},
    requestOptions?: RequestOptions
  ): Promise<UploadResult> {
    const formData = new FormData();

    if (typeof fileOrPath === "string") {
      // Local file path string in Node.js environment
      if (typeof process !== "undefined" && process.versions?.node) {
        const fs = await import("node:fs/promises");
        const path = await import("node:path");
        const buffer = await fs.readFile(fileOrPath);
        const filename = options.filename || path.basename(fileOrPath);
        const ext = path.extname(filename).toLowerCase();
        const contentType =
          options.contentType ||
          (ext === ".png"
            ? "image/png"
            : ext === ".webp"
            ? "image/webp"
            : ext === ".mp4"
            ? "video/mp4"
            : "image/jpeg");

        const blob = new Blob([buffer], { type: contentType });
        formData.append("file", blob, filename);
      } else {
        throw new Error(
          "Passing file path strings is only supported in Node.js environments. In browsers/workers, pass a File or Blob."
        );
      }
    } else if (fileOrPath instanceof Blob) {
      const filename =
        options.filename ||
        (fileOrPath instanceof (globalThis.File || class {})
          ? (fileOrPath as File).name
          : "upload.jpg");
      formData.append("file", fileOrPath, filename);
    } else {
      // Uint8Array or ArrayBuffer
      const blob = new Blob([fileOrPath as BlobPart], {
        type: options.contentType || "image/jpeg",
      });
      formData.append("file", blob, options.filename || "upload.jpg");
    }

    return this.http.post<UploadResult>(
      "/v1/studio/upload",
      formData,
      requestOptions
    );
  }
}
