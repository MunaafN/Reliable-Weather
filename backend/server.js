const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const weatherRoutes = require('./routes/weatherapi-new');

// Load environment variables with error handling
const envPath = __dirname + '/.env';
const envResult = dotenv.config({ path: envPath });

// Check if .env file was loaded successfully
if (envResult.error) {
  console.warn('⚠️  Warning: .env file not found or could not be loaded');
  console.warn(`   Expected location: ${envPath}`);
  console.warn('   Please create the .env file with your WeatherAPI.com key');
} else {
  console.log('✅ .env file loaded successfully');
}

// Debug: Log environment loading
console.log('🔍 Environment Debug Info:');
console.log(`📁 Current working directory: ${process.cwd()}`);
console.log(`📁 Server file directory: ${__dirname}`);
console.log(`📄 Loading .env from: ${envPath}`);

// Validate WeatherAPI.com key
const weatherApiKey = process.env.WEATHERAPI_KEY;
if (!weatherApiKey) {
  console.log('❌ WEATHERAPI_KEY not found in environment');
  console.log('   Please add WEATHERAPI_KEY=your_key_here to your .env file');
} else if (weatherApiKey === 'your_weatherapi_key_here') {
  console.log('❌ WEATHERAPI_KEY still has placeholder value');
  console.log('   Please replace with your actual WeatherAPI.com key');
} else if (weatherApiKey.length < 10) {
  console.log('❌ WEATHERAPI_KEY appears to be invalid (too short)');
} else {
  console.log(`✅ WEATHERAPI_KEY loaded successfully (${weatherApiKey.length} characters)`);
}
console.log('---');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy setting for rate limiting (needed for production deployments)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/health'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/weather', weatherRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Weather API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Handle specific error types
  if (err.code === 'ERR_ERL_UNEXPECTED_X_FORWARDED_FOR') {
    console.log('Rate limiting warning: X-Forwarded-For header detected. This is normal in production environments.');
    return next(); // Continue processing the request
  }
  
  res.status(err.status || 500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌤️  Weather API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Final API key status
  const apiKey = process.env.WEATHERAPI_KEY;
  if (apiKey && apiKey !== 'your_weatherapi_key_here' && apiKey.length >= 10) {
    console.log('🔐 WeatherAPI.com service ready');
  } else {
    console.log('⚠️  WeatherAPI.com service not properly configured');
    console.log('   Weather endpoints will return errors until API key is added');
  }
});

module.exports = app;
