/** FastAPI often returns `detail` as string or validation error array */
export function apiErrorMessage(e: unknown, fallback: string): string {
  if (typeof e !== "object" || e === null) return fallback;

  const ax = e as { message?: string; code?: string; response?: { data?: { detail?: unknown }; status?: number } };
  if (!("response" in ax) || ax.response === undefined) {
    if (typeof ax.message === "string" && ax.message !== "Error") {
      if (ax.code === "ERR_NETWORK" || /network/i.test(ax.message)) {
        return "Cannot reach the API. Is the backend running and REACT_APP_API_URL correct?";
      }
      return ax.message;
    }
    return fallback;
  }

  const detail = ax.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) =>
        typeof item === "object" && item !== null && "msg" in item
          ? String((item as { msg: string }).msg)
          : JSON.stringify(item)
      )
      .join("; ");
  }
  return fallback;
}
