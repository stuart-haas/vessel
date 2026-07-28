/**
 * Turn an unknown error — a thrown JS Error (network failure) or a typed API
 * error body (FastAPI's `{ detail }`) — into a human-readable string.
 */
export function errorMessage(err: unknown): string {
  if (!err) return 'Something went wrong';
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && 'detail' in err) {
    const detail = (err as { detail?: unknown }).detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d) => (d && typeof d === 'object' && 'msg' in d ? String(d.msg) : String(d)))
        .join(', ');
    }
  }
  return String(err);
}
