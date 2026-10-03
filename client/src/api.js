export async function api(path, options = {}) {
  const target = `/api${path}`;
  const response = await fetch(`/api/proxy?path=${encodeURIComponent(target)}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(data.error || `Request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}
