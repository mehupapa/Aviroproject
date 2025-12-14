const mongoose = require('mongoose');

// Database collections configuration



const DB_COLLECTIONS = {
    test: {
        dbName: 'test',
        mongoURI: process.env.MONGODB_URI_TEST || 'mongodb+srv://pawan:tfiqYEbtHnS58mSv@cluster0.mdvnyxl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    },
    qa: {
        dbName: 'qa',
        mongoURI: process.env.MONGODB_URI_QA || 'mongodb+srv://pawan:tfiqYEbtHnS58mSv@cluster0.mdvnyxl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    }
};


const connectDB = async () => {
    try {
        // Always use TEST database - data should go to test database
        // Set ENVIRONMENT=test to use TEST database
        const environment = process.env.ENVIRONMENT || process.env.NODE_ENV || 'test';
        const envKey = 'test'; // Always use test database

        // Get database configuration based on environment
        const dbConfig = DB_COLLECTIONS[envKey];
        let mongoURI = dbConfig.mongoURI;
        let dbName = dbConfig.dbName;

        // Override with environment variables if provided
        if (process.env.MONGODB_URI) {
            mongoURI = process.env.MONGODB_URI;
        }
        if (process.env.MONGODB_DB_NAME) {
            dbName = process.env.MONGODB_DB_NAME;
        }

        // Parse the URI to add database name if not already present
        const uriObj = new URL(mongoURI);
        if (!uriObj.pathname || uriObj.pathname === '/') {
            uriObj.pathname = `/${dbName}`;
        }
        mongoURI = uriObj.toString();

        console.log(`🔌 Connecting to database...`);
        console.log(`🌍 Environment: ${envKey.toUpperCase()}`);
        console.log(`📦 Configured Database Name: ${dbName}`);
        console.log(`🌐 MongoDB URI: ${mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`); // Hide credentials in logs

        // Dis
        // 
        // able auto-indexing to prevent Mongoose from creating indexes before migration
        const conn = await mongoose.connect(
            mongoURI,
            {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 45000,
                connectTimeoutMS: 30000,
                autoIndex: false, // Disable auto-indexing - we'll handle it manually
            }
        );

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Currently Running Database: ${conn.connection.name}`);
        console.log(`🔗 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

        // Migrate email index to sparse if needed
        // Wait a bit for Mongoose to finish initializing
        await new Promise(resolve => setTimeout(resolve, 500));


        // Connection event listeners
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });

        return conn;
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        process.exit(1); // Optional: You might want to avoid this in serverless environments
    }
};

module.exports = connectDB;
