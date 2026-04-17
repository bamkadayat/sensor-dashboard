import axios, { AxiosError } from "axios";

/**
 * Shared axios instance for all REST calls.
 *
 * Interceptors:
 *   - request:  dev-only debug logging
 *   - response: normalize failures into `Error(message)` so call sites don't
 *               need to pattern-match on the axios-specific error shape.
 */
export const http = axios.create({
  baseURL: "https://api.binance.com",
  timeout: 10_000,
});

http.interceptors.request.use((config) => {
  if (import.meta.env.DEV) {
    console.debug(
      `[http] → ${config.method?.toUpperCase() ?? "GET"} ${config.url}`,
    );
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "(unknown)";
    const message = status
      ? `HTTP ${status} from ${url}`
      : `Network error requesting ${url}`;

    if (import.meta.env.DEV) {
      console.error(`[http] ✗ ${message}`);
    }

    return Promise.reject(new Error(message));
  },
);
