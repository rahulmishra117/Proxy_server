/**
 * Here's we added the ratelimiting feture with caching 
 * 
 */
const express = require('express');
const axios = require('axios');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const morgan = require('morgan');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();

// Configure environment variables
const API_URL = process.env.API_URL || 'https://api.github.com'; 
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT, 10) || 5; 
const RATE_LIMIT_DURATION = parseInt(process.env.RATE_LIMIT_DURATION, 10) || 60;
const CACHE_DURATION = parseInt(process.env.CACHE_DURATION, 10) || 300; 

//Define ratelimiter
const rateLimiter = new RateLimiterMemory({
  points: RATE_LIMIT,
  duration: RATE_LIMIT_DURATION,
});

// define the cacheing
const cache = new NodeCache({
  stdTTL: CACHE_DURATION,
  checkperiod: CACHE_DURATION + 60,
});

// Middleware to log request details
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));

// Proxy endpoint
app.get('/proxy', async (req, res) => {
  const clientIp = req.ip;
  const cacheKey = `cache:${clientIp}:${req.originalUrl}`;
  //send 429 response once 
  try {
    await rateLimiter.consume(clientIp);
  } catch (err) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
  }

 
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log('Serving from cache');
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(API_URL);
    cache.set(cacheKey, response.data);
    return res.json(response.data);
  } catch (error) {
    console.error('Error calling external API', error.message);
    return res.status(500).json({ error: 'Failed to fetch data from external API' });
  }
});

const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${process.env.API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.use('/proxy', authenticate);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API Proxy server running on http://localhost:${port}`);
});
