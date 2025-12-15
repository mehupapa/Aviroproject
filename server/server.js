const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
require('dotenv').config();


const app = express();

// Set default NODE_ENV to development if not set
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
}
// Security middleware - Configure Helmet for development
if (process.env.NODE_ENV === 'development') {
    // More permissive Helmet configuration for development
    app.use(helmet({
        contentSecurityPolicy: false, // Disable CSP in dev to allow browser requests
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" }
    }));
} else {
    app.use(helmet());
}

// CORS configuration - Enhanced for better compatibility 
const corsOptions = {
    origin: function (origin, callback) {
        // In development, allow all origins including browser direct access
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        // List of allowed origins for production
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3001',
            'http://localhost:8080',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'http://127.0.0.1:8080',
            'http://127.0.0.1:5173',
            process.env.CORS_ORIGIN,
            // Support multiple CORS origins (comma-separated)
            ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()) : [])
        ].filter(Boolean); // Remove undefined values
        // Also allow any Netlify domain (for flexibility)
        if (origin && origin.includes('.netlify.app')) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Rate limiting
// const limiter = rateLimit({
//     windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
//     max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
//     message: {
//         error: 'Too many requests from this IP, please try again later.'
//     },
//     standardHeaders: true,
//     legacyHeaders: false,
// });


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static files (if needed)
// app.use('/uploads', express.static('uploads'));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(hpp());

// Compression middleware
app.use(compression());


// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Import database configuration
const connectDB = require('../config/database');

// Connect to database
connectDB();


// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to Zero-Code Platform API',
        version: '1.0.0',
        endpoints: {
            apps: '/api/apps',
            screens: '/api/screens'
        }
    });
});

// API Routes
const appRoutes = require('../appManagement/routes/appRoutes');
const screenRoutes = require('../appManagement/routes/screenRoutes');
const componentRoutes = require('../componentManagement/routes/componentRoutes');
const componentTypeRoutes = require('../componentManagement/routes/componentTypeRoutes');

app.use('/api/apps', appRoutes);
app.use('/api/screens', screenRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/component-types', componentTypeRoutes);

// Basic error handling middleware
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on http://${HOST}:${PORT}`);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`);
    process.exit(1);
});

module.exports = app;
