/**
 * Converts a user-pasted image URL into a directly loadable one.
 *
 * Google Drive share links (file/d/<id>/view, open?id=, uc?id=) don't render
 * inline; they're rewritten to the official thumbnail endpoint, which serves
 * the image without auth for publicly shared files. Any other URL is
 * passed through unchanged.
 */
export function toDirectImageUrl(url: string | undefined | null): string {
  const trimmed = (url ?? "").trim()
  if (!trimmed) return ""
  const match = trimmed.match(
    /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^#]*&)?id=)([\w-]{10,})/i,
  )
  if (match) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w512`
  }
  return trimmed
}
