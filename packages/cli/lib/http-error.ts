type ErrorResponse = {
  json: () => Promise<unknown>;
  status: number;
  statusText: string;
};
export async function getErrorMessage(res: ErrorResponse) {
  try {
    const data = (await res.json()) as { error?: string };
    if (typeof data.error === "string" && data.error.length > 0)
      return data.error;
  } catch (er) {
    // ignore invalid error and fallback to status text
  }
  return res.statusText || `Request failed with status ${res.status}`;
}
