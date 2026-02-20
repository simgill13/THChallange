const request = require('supertest');
const fs = require('fs').promises;
const path = require('path');
const app = require('../../index');

const DATA_PATH = path.join(__dirname, '../../../../data/items.json');

const SEED = [
  { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
  { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 },
  { id: 3, name: 'Ultra\u2011Wide Monitor', category: 'Electronics', price: 999 },
  { id: 4, name: 'Ergonomic Chair', category: 'Furniture', price: 799 },
  { id: 5, name: 'Standing Desk', category: 'Furniture', price: 1199 },
];

let originalData;

beforeAll(async () => {
  originalData = await fs.readFile(DATA_PATH, 'utf-8');
});

afterEach(async () => {
  await fs.writeFile(DATA_PATH, originalData, 'utf-8');
});

describe('GET /api/items', () => {
  it('returns paginated items with metadata', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('totalPages');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('respects the limit parameter', async () => {
    const res = await request(app).get('/api/items?limit=2');
    expect(res.body.data).toHaveLength(2);
    expect(res.body.limit).toBe(2);
  });

  it('respects the page parameter', async () => {
    const page1 = await request(app).get('/api/items?limit=2&page=1');
    const page2 = await request(app).get('/api/items?limit=2&page=2');
    expect(page1.body.data[0].id).not.toBe(page2.body.data[0].id);
  });

  it('filters by search query', async () => {
    const res = await request(app).get('/api/items?q=laptop');
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].name.toLowerCase()).toContain('laptop');
  });

  it('returns empty data for non-matching search', async () => {
    const res = await request(app).get('/api/items?q=zzzznonexistent');
    expect(res.body.data).toHaveLength(0);
    expect(res.body.total).toBe(0);
  });

  it('returns page 1 when page is out of bounds', async () => {
    const res = await request(app).get('/api/items?page=9999');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('GET /api/items/:id', () => {
  it('returns a single item by id', async () => {
    const res = await request(app).get('/api/items/1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Laptop Pro');
  });

  it('returns 404 for a non-existent id', async () => {
    const res = await request(app).get('/api/items/999999');
    expect(res.status).toBe(404);
    expect(res.body.error.message).toMatch(/not found/i);
  });
});

describe('POST /api/items', () => {
  it('creates a new item and returns 201', async () => {
    const newItem = { name: 'Test Widget', category: 'Gadgets', price: 42 };
    const res = await request(app).post('/api/items').send(newItem);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Widget');
    expect(res.body).toHaveProperty('id');
  });

  it('persists the created item to the data file', async () => {
    const newItem = { name: 'Persisted Widget', category: 'Test', price: 10 };
    await request(app).post('/api/items').send(newItem);

    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    const data = JSON.parse(raw);
    expect(data.find((i) => i.name === 'Persisted Widget')).toBeTruthy();
  });

  it('rejects an item without a name (400)', async () => {
    const res = await request(app).post('/api/items').send({ price: 10 });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/name/i);
  });

  it('rejects an item with negative price (400)', async () => {
    const res = await request(app).post('/api/items').send({ name: 'Bad', price: -5 });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/price/i);
  });

  it('rejects an item without a price (400)', async () => {
    const res = await request(app).post('/api/items').send({ name: 'No Price' });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/price/i);
  });
});

describe('404 handling', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
  });
});
