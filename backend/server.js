const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { randomUUID } = require('crypto');
const dotenv = require('dotenv');
const weatherRoutes = require('./routes/weatherapi-new');

// ─── Structured Logger (#10) ───────────────────────────────────────────────────
const logger = {
  _format(level, msg, meta) {
    return JSON.stringify({
      level,
      msg,
      ...meta,
      ts: new Date().toISOString(),
    });
  },
  info(msg, meta = {}) { console.log(this._format('info', msg, meta)); },
  warn(msg, meta = {}) { console.warn(this._format('warn', msg, meta)); },
  error(msg, meta = {}) { console.error(this._format('error', msg, meta)); },
};

// ─── Load Environment ──────────────────────────────────────────────────────────
const envPath = __dirname + '/.env';
const envResult = dotenv.config({ path: envPath });

if (envResult.error) {
  logger.warn('.env file not found or could not be loaded', { path: envPath });
} else {
  logger.info('.env file loaded successfully');
}

// Validate WeatherAPI key on load
const weatherApiKey = process.env.WEATHERAPI_KEY;
if (!weatherApiKey) {
  logger.error('WEATHERAPI_KEY not found in environment');
} else if (weatherApiKey === 'your_weatherapi_key_here') {
  logger.error('WEATHERAPI_KEY still has placeholder value');
} else if (weatherApiKey.length < 10) {
  logger.error('WEATHERAPI_KEY appears invalid (too short)');
} else {
  logger.info('WEATHERAPI_KEY loaded', { length: weatherApiKey.length });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (needed for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// ─── Request ID Tracking (#13) ─────────────────────────────────────────────────
app.use((req, res, next) => {
  req.id = randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});

// ─── Request Logging ────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    // Skip noisy health checks from logs
    if (req.path === '/health') return;
    logger.info('request', {
      reqId: req.id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - start,
      ip: req.ip,
    });
  });
  next();
});

// ─── Security ───────────────────────────────────────────────────────────────────
app.use(helmet());

// ─── Response Compression (#9) ──────────────────────────────────────────────────
app.use(compression({ threshold: 1024 })); // compress responses > 1KB

// ─── Rate Limiting (#5 — Global fallback) ───────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // generous global limit; per-endpoint limits are tighter
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
});
app.use(globalLimiter);

// ─── CORS (#11 — Multi-Origin Support) ──────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, SSE)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'OPTIONS'],
}));

// ─── Body Parsing ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/weather', weatherRoutes);

// ─── Health Check ───────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Weather API is running',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ────────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// ─── Global Error Handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    reqId: req.id,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
  });

  if (err.code === 'ERR_ERL_UNEXPECTED_X_FORWARDED_FOR') {
    return next();
  }

  res.status(err.status || 500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    requestId: req.id,
  });
});

// ─── API Key Validation on Startup (#6) ─────────────────────────────────────────
const validateApiKeyOnStartup = async () => {
  const key = process.env.WEATHERAPI_KEY;
  if (!key || key === 'your_weatherapi_key_here' || key.length < 10) {
    logger.warn('Skipping API key validation — key not configured');
    return;
  }
  try {
    const axios = require('axios');
    const response = await axios.get('http://api.weatherapi.com/v1/current.json', {
      params: { key, q: 'London' },
      timeout: 8000,
    });
    if (response.data?.location?.name) {
      logger.info('WeatherAPI key validated successfully', { resolvedCity: response.data.location.name });
    }
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    logger.error('WeatherAPI key validation FAILED', { error: msg });
    logger.error('The app will return errors until a valid key is provided');
  }
};

// ─── Start Server ───────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  logger.info(`Weather API server started`, { port: PORT, env: process.env.NODE_ENV || 'development' });
  logger.info(`Health check: http://localhost:${PORT}/health`);

  // Validate API key after server starts (non-blocking)
  await validateApiKeyOnStartup();
});

module.exports = app;
