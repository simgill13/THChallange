const express = require('express');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const { mean } = require('../utils/stats');

const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

let cachedStats = null;

async function computeStats() {
  const raw = await fsPromises.readFile(DATA_PATH, 'utf-8');
  const items = JSON.parse(raw);
  return {
    total: items.length,
    averagePrice: items.length ? mean(items.map(i => i.price)) : 0,
  };
}

// Invalidate cache when the data file changes on disk
fs.watch(DATA_PATH, { persistent: false }, () => {
  cachedStats = null;
});

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    if (!cachedStats) {
      cachedStats = await computeStats();
    }
    res.json(cachedStats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
