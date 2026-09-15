import {
  Observable,
  defer,
  from,
  map,
  timeout,
  retry,
  catchError,
  throwError,
} from "rxjs";
import type { ZodType } from "zod";
import { tapGraph } from "./graph.ts";

export class HttpError extends Error {
  status: number;
  statusText: string;
  body?: string;

  constructor(status: number, statusText: string, body?: string) {
    super(`HTTP ${status} ${statusText}`);
    this.name = "HttpError";
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

export interface HttpOptions {
  timeoutMs?: number;
  retries?: number;
}

export class HttpClient {
  #options: HttpOptions;

  constructor(options: HttpOptions = {}) {
    this.#options = options;
  }

  get<T>(url: string, schema: ZodType<T>): Observable<T> {
    return this.request(url, { method: "GET" }, schema);
  }

  post<T>(url: string, body: unknown, schema: ZodType<T>): Observable<T> {
    return this.request(
      url,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      },
      schema,
    );
  }

  private request<T>(
    url: string,
    init: RequestInit,
    schema: ZodType<T>,
  ): Observable<T> {
    const method = init.method ?? "GET";
    const node = `http ${method} ${url}`;
    return defer(() =>
      from(
        fetch(url, init).then(async (response) => {
          const text = await response.text();
          if (!response.ok) {
            throw new HttpError(response.status, response.statusText, text);
          }
          return text ? (JSON.parse(text) as unknown) : null;
        }),
      ),
    ).pipe(
      map((data) => schema.parse(data)),
      timeout({ first: this.#options.timeoutMs ?? 8000 }),
      retry({ count: this.#options.retries ?? 0 }),
      tapGraph(node),
      catchError((err) => throwError(() => err)),
    );
  }
}

export const http = new HttpClient({ timeoutMs: 8000, retries: 1 });
