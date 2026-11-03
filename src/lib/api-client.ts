// lib/api-client.ts

// 自定义一个携带状态码和详情的 API 错误类
export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}
export async function apiRequest<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  let response: Response;

  // ── 防线 1：捕获真正的网络层错误 (断网、DNS 失败、CORS 拦截) ──
  try {
    const isFormData =
      typeof FormData !== "undefined" && options?.body instanceof FormData;

    const isPlainObject =
      options?.body && typeof options.body === "object" && !isFormData;

    response = await fetch(url, {
      ...options,
      headers: {
        ...(isPlainObject ? { "Content-Type": "application/json" } : {}),
        ...options?.headers,
      },
    });
  } catch (networkError) {
    // 只有连服务器都没连上，才会进这个 catch
    throw new ApiError("网络连接失败，请检查您的网络设置", 0, networkError);
  }

  // ── 防线 2：处理 204 No Content（无正文响应，绝不能调 .json()） ──
  if (response.status === 204) {
    return undefined as T;
  }

  // ── 防线 3：安全地解析响应体（防止 502 HTML 页面或空响应把 response.json() 搞崩） ──
  let data: unknown;
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      // 声明了是 JSON，但实际正文损坏无法解析
      if (response.ok) {
        throw new ApiError("服务器返回的数据格式异常", response.status);
      }
    }
  } else {
    // 如果不是 JSON（比如 Nginx 返回的 502 HTML 文本），安全地读成普通字符串
    const text = await response.text();
    data = { error: text || `HTTP Error ${response.status}` };
  }

  // ── 防线 4：主动拦截 4xx / 5xx 状态码，转化为统一的 ApiError 抛出 ──
  if (!response.ok) {
    // 解决这个问题只需要在读取错误字段前做一次轻量级的类型断言即可。
    const errPayload = data as
      | { error?: string; message?: string; details?: unknown }
      | undefined;
    const errorMessage =
      errPayload?.error ||
      errPayload?.message ||
      `请求失败 (${response.status})`;
    throw new ApiError(errorMessage, response.status, errPayload?.details);
  }

  // ── 走到这里：状态码是 200/201，且 JSON 解析成功 ──
  return data as T;
}
