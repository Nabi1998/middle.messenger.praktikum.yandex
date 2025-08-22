export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined> | null;
}

export default class HttpClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  request<TResponse = unknown>(url: string, options: RequestOptions = {}): Promise<TResponse> {
    const { method = 'GET', headers = {}, body = null, query = null } = options;

    return new Promise<TResponse>((resolve, reject) => {
      let fullUrl = this.baseUrl + url;

      if (query && typeof query === 'object') {
        const params = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params.append(key, String(value));
          }
        });
        const queryString = params.toString();
        if (queryString) {
          fullUrl += `?${queryString}`;
        }
      }

      const xhr = new XMLHttpRequest();
      xhr.open(method, fullUrl);

      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText) as TResponse);
          } catch (_e) {
            resolve((xhr.responseText as unknown) as TResponse);
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

  get<TResponse = unknown>(url: string, query: RequestOptions['query'] = {}, headers: Record<string, string> = {}) {
    return this.request<TResponse>(url, { method: 'GET', query, headers });
  }

  post<TResponse = unknown>(url: string, body: unknown = {}, headers: Record<string, string> = {}) {
    return this.request<TResponse>(url, { method: 'POST', body, headers });
  }

  put<TResponse = unknown>(url: string, body: unknown = {}, headers: Record<string, string> = {}) {
    return this.request<TResponse>(url, { method: 'PUT', body, headers });
  }

  delete<TResponse = unknown>(url: string, body: unknown = {}, headers: Record<string, string> = {}) {
    return this.request<TResponse>(url, { method: 'DELETE', body, headers });
  }
}


