import { expect } from 'chai';
import sinon from 'sinon';
import HTTPTransport from './HTTPTransport';

describe('HTTPTransport', () => {
  let xhr: sinon.SinonFakeXMLHttpRequestStatic;
  let instance: HTTPTransport;
  let requests: sinon.SinonFakeXMLHttpRequest[] = [];

  beforeEach(() => {
    xhr = sinon.useFakeXMLHttpRequest();

    // @ts-ignore
    global.XMLHttpRequest = xhr;

    xhr.onCreate = ((request: sinon.SinonFakeXMLHttpRequest) => {
      requests.push(request);
    });

    instance = new HTTPTransport('/auth');
  });

  afterEach(() => {
    requests = [];
    xhr.restore();
  });

  it('should send GET request', () => {
    instance.get('/user');

    const [request] = requests;

    expect(request.method).to.eq('GET');
  });

  it('should send POST request', () => {
    instance.post('/signin', { data: { a: 1 } });

    const [request] = requests;

    expect(request.method).to.eq('POST');
  });

  it('should send PUT request', () => {
    instance.put('/user', { data: { a: 1 } });

    const [request] = requests;

    expect(request.method).to.eq('PUT');
  });

  it('should send DELETE request', () => {
    instance.delete('/user', { data: { a: 1 } });

    const [request] = requests;

    expect(request.method).to.eq('DELETE');
  });

  it('should stringify query params for GET request', () => {
    instance.get('/user', { data: { a: 1, b: 2 } });

    const [request] = requests;

    expect(request.url).to.include('?a=1&b=2');
  });

  it('should send data in body for POST request', () => {
    const data = { a: 1, b: 2 };
    instance.post('/signin', { data });

    const [request] = requests;

    expect(request.requestBody).to.eq(JSON.stringify(data));
  });
});
