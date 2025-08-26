export type HttpMethodType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestOptions {
  headers?: Record<string, string>;
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined> | null;
  timeout?: number;
}

const METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

type HTTPMethod = <R = unknown>(url: string, options?: RequestOptions) => Promise<R>;

export class HttpClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private buildUrl(url: string, query?: RequestOptions['query']): string {
    let fullUrl = this.baseUrl + url;
    if (query && typeof query === 'object') {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      if (queryString) fullUrl += `?${queryString}`;
    }
    return fullUrl;
  }

  private request<R = unknown>(url: string, method: HttpMethodType, options: RequestOptions = {}): Promise<R> {
    const { headers = {}, body = null, query = null } = options;
    const fullUrl = this.buildUrl(url, query);

    return new Promise<R>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, fullUrl);

      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText) as R);
          } catch (_e) {
            resolve((xhr.responseText as unknown) as R);
          }
        } else {
          reject(new Error(`HTTP error! Status: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));

      if (body !== null && body !== undefined) {
        const isJson = typeof body === 'object' && !(body instanceof FormData);
        if (isJson) {
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(JSON.stringify(body));
        } else {
          xhr.send(body as Document | XMLHttpRequestBodyInit | null | undefined);
        }
      } else {
        xhr.send();
      }
    });
  }

  // 🔹 Методы с использованием общего типа HTTPMethod
  public get: HTTPMethod = (url, options = {}) => this.request(url, METHODS.GET, options);
  public post: HTTPMethod = (url, options = {}) => this.request(url, METHODS.POST, options);
  public put: HTTPMethod = (url, options = {}) => this.request(url, METHODS.PUT, options);
  public delete: HTTPMethod = (url, options = {}) => this.request(url, METHODS.DELETE, options);
}
