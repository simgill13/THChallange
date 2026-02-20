const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

async function readData() {
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /api/items — supports ?q=, ?page=, ?limit=
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { q, page = 1, limit = 20 } = req.query;

    let results = data;

    if (q) {
      const lower = q.toLowerCase();
      results = results.filter(item => item.name.toLowerCase().includes(lower));
    }

    const total = results.length;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const totalPages = Math.ceil(total / pageSize);
    const start = (pageNum - 1) * pageSize;

    const paginatedItems = results.slice(start, start + pageSize);

    res.json({
      data: paginatedItems,
      total,
      page: pageNum,
      limit: pageSize,
      totalPages,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id, 10));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    const { name, category, price } = req.body;

    if (!name || typeof name !== 'string') {
      const err = new Error('name is required and must be a string');
      err.status = 400;
      throw err;
    }
    if (price == null || typeof price !== 'number' || price < 0) {
      const err = new Error('price is required and must be a non-negative number');
      err.status = 400;
      throw err;
    }

    const data = await readData();
    const item = { id: Date.now(), name, category: category || '', price };
    data.push(item);
    await writeData(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
