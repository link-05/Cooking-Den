import type { ParseResponse } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function parseUrl(url: string): Promise<ParseResponse> {
  const res = await fetch(`${API_URL}/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data as { error?: string }).error ?? "Failed to parse recipe"
    );
  }
  return res.json();
}
