enum METHODS {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

type Options = {
  method: METHODS;
  data?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
}

type OptionsWithoutMethod = Omit<Options, 'method'>;

export default class HTTPTransport {
  static API_URL = 'https://ya-praktikum.tech/api/v2';
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = `${HTTPTransport.API_URL}${endpoint}`;
  }

  public get = (url: string, options: OptionsWithoutMethod = {}): Promise<XMLHttpRequest> => {
    return this.request(url, { ...options, method: METHODS.GET }, options.timeout);
  };

  public post = (url: string, options: OptionsWithoutMethod = {}): Promise<XMLHttpRequest> => {
    return this.request(url, { ...options, method: METHODS.POST }, options.timeout);
  };

  public put = (url: string, options: OptionsWithoutMethod = {}): Promise<XMLHttpRequest> => {
    return this.request(url, { ...options, method: METHODS.PUT }, options.timeout);
  };

  public delete = (url: string, options: OptionsWithoutMethod = {}): Promise<XMLHttpRequest> => {
    return this.request(url, { ...options, method: METHODS.DELETE }, options.timeout);
  };

  private request = (url: string, options: Options, timeout = 5000): Promise<XMLHttpRequest> => {
    const { headers = {}, method, data } = options;

    return new Promise((resolve, reject) => {
      if (!method) {
        reject(new Error('No method'));
        return;
      }

      const xhr = new XMLHttpRequest();
      const isGet = method === METHODS.GET;

      xhr.open(method, isGet && !!data ? `${this.endpoint}${url}${this.queryStringify(data)}` : `${this.endpoint}${url}`);

      Object.keys(headers).forEach(key => {
        xhr.setRequestHeader(key, headers[key]);
      });

      xhr.onload = () => {
        resolve(xhr);
      };

      xhr.onabort = reject;
      xhr.onerror = reject;

      xhr.timeout = timeout;
      xhr.ontimeout = reject;

      xhr.withCredentials = true;

      if (isGet || !data) {
        xhr.send();
      } else if (data instanceof FormData) {
        xhr.send(data);
      } else {
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
      }
    });
  };

  private queryStringify(data: Record<string, unknown>): string {
    if (typeof data !== 'object' || data === null) {
      throw new Error('Data must be object');
    }

    const keys = Object.keys(data);
    return keys.reduce((result, key, index) => {
      return `${result}${key}=${data[key]}${index < keys.length - 1 ? '&' : ''}`;
    }, '?');
  }
}
