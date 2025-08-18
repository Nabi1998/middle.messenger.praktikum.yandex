export default class HttpClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  request(url, options = {}) {
    const { method = 'GET', headers = {}, body = null, query = null } = options;

    return new Promise((resolve, reject) => {
      let fullUrl = this.baseUrl + url;

      if (query && typeof query === 'object') {
        const params = new URLSearchParams(query).toString();
        fullUrl += `?${params}`;
      }

      const xhr = new XMLHttpRequest();
      xhr.open(method, fullUrl);

      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else {
          reject(new Error(`HTTP error! Status: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));

      if (body) {
        const isJson = typeof body === 'object';
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(isJson ? JSON.stringify(body) : body);
      } else {
        xhr.send();
      }
    });
  }

  get(url, query = {}, headers = {}) {
    return this.request(url, { method: 'GET', query, headers });
  }

  post(url, body = {}, headers = {}) {
    return this.request(url, { method: 'POST', body, headers });
  }

  put(url, body = {}, headers = {}) {
    return this.request(url, { method: 'PUT', body, headers });
  }

  delete(url, body = {}, headers = {}) {
    return this.request(url, { method: 'DELETE', body, headers });
  }
}
