import { apiHelper } from '../apiHelper';

beforeEach(() => {
  jest.restoreAllMocks();
  localStorage.clear();
});

describe('apiHelper', () => {
  it('makes a GET request to the correct URL', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) }),
    );

    await apiHelper('/items');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/items'),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('appends query params to the URL', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    );

    await apiHelper('/items', { params: { page: 2, limit: 10 } });

    const calledUrl = global.fetch.mock.calls[0][0];
    expect(calledUrl).toContain('page=2');
    expect(calledUrl).toContain('limit=10');
  });

  it('attaches auth token when secure is true', async () => {
    localStorage.setItem('authToken', 'test-token-123');
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    );

    await apiHelper('/profile', { secure: true });

    const headers = global.fetch.mock.calls[0][1].headers;
    expect(headers['Authorization']).toBe('Bearer test-token-123');
  });

  it('does not attach auth token when secure is false', async () => {
    localStorage.setItem('authToken', 'test-token-123');
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    );

    await apiHelper('/items');

    const headers = global.fetch.mock.calls[0][1].headers;
    expect(headers['Authorization']).toBeUndefined();
  });

  it('stringifies the body for POST requests', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    );

    const body = { name: 'Widget', price: 42 };
    await apiHelper('/items', { method: 'POST', body });

    expect(global.fetch.mock.calls[0][1].body).toBe(JSON.stringify(body));
  });

  it('throws with server message on non-ok response', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: { message: 'Bad input' } }),
      }),
    );

    await expect(apiHelper('/items')).rejects.toThrow('Bad input');
  });

  it('throws generic message when error body is unparseable', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('not json')),
      }),
    );

    await expect(apiHelper('/items')).rejects.toThrow('Server error: 500');
  });

  it('merges custom headers with defaults', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    );

    await apiHelper('/items', { headers: { 'X-Custom': 'hello' } });

    const headers = global.fetch.mock.calls[0][1].headers;
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['X-Custom']).toBe('hello');
  });
});
