"use client";

import { MEDIA_BUCKET } from "@/lib/media";
import { supabaseBrowser } from "@/lib/supabase/client";

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // Supabase free-plan per-file limit

/**
 * Uploads a file to the product-media bucket with progress (XHR to the Storage REST API,
 * authorised with the admin's session). Returns the storage path.
 */
export async function uploadMedia(file: File, folder: string, onProgress?: (pct: number) => void): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error(`${file.name} is ${(file.size / 1048576).toFixed(0)} MB — the limit is 50 MB. Compress it first.`);
  const { data } = await supabaseBrowser().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Your session expired. Log in again.");
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${MEDIA_BUCKET}/${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText.slice(0, 160)}`)));
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(file);
  });
  return path;
}

export async function removeMedia(path: string) {
  await supabaseBrowser().storage.from(MEDIA_BUCKET).remove([path]);
}
