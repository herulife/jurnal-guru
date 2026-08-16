const BASE = "";

export async function api<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<{ ok: boolean; data?: T; msg?: string }> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      data?: T;
      msg?: string;
    };
    if (res.status === 401 && path !== "/api/auth/login" && path !== "/api/auth/check") {
      if (typeof window !== "undefined") {
        window.location.href = "/login?returnUrl=" + encodeURIComponent(window.location.pathname + window.location.search);
      }
    }
    return {
      ok: json.ok ?? res.ok,
      data: json.data,
      msg: json.msg,
    };
  } catch {
    return { ok: false, msg: "Network error" };
  }
}

export async function apiGet<T = unknown>(path: string) {
  return api<T>(path);
}

export async function apiPost<T = unknown>(path: string, body: unknown) {
  return api<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiPut<T = unknown>(
  path: string,
  body: unknown
) {
  return api<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function apiDelete<T = unknown>(path: string) {
  return api<T>(path, { method: "DELETE" });
}

export async function apiPatch<T = unknown>(
  path: string,
  body: unknown
) {
  return api<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
