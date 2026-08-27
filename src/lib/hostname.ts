/** Extracts a display-friendly hostname from a URL, e.g. "docs.unity3d.com". */
export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
