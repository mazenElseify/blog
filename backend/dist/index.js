"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const auth_routes_1 = __importDefault(require("./app/auth/routes/auth.routes"));
const post_routes_1 = __importDefault(require("./app/blog/routes/post.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const fastify = (0, fastify_1.default)({
    logger: true
});
const PORT = parseInt(process.env.PORT || '3000');
// Setup routes and middleware for both local and Vercel environments
const setupFastify = async () => {
    try {
        console.log('Starting Fastify setup...');
        await fastify.register(helmet_1.default);
        console.log('Helmet registered');
        // Manual CORS headers instead of plugin
        fastify.addHook('onRequest', async (request, reply) => {
            reply.header('Access-Control-Allow-Origin', '*');
            reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            reply.header('Access-Control-Allow-Credentials', 'true');
        });
        console.log('CORS headers configured');
        fastify.setErrorHandler(errorHandler_1.errorHandler);
        console.log('Error handler set');
        await fastify.register(auth_routes_1.default, { prefix: '/api/auth' });
        console.log('Auth routes registered');
        await fastify.register(post_routes_1.default, { prefix: '/api/posts' });
        console.log('Post routes registered');
        fastify.get('/health', async (request, reply) => {
            return {
                status: 'ok',
                message: "Blog API is running",
                timestamp: new Date().toISOString(),
                version: "1.0.0"
            };
        });
        console.log('Health route registered');
        fastify.get('/', async (request, reply) => {
            reply.send({
                message: "Welcome to Blog API",
                version: "1.0.0",
                endpoints: {
                    users: "/api/users",
                    health: "/health",
                    blogs: "/api/posts",
                    auth: "/api/auth"
                }
            });
        });
        console.log('Root route registered');
        // Connect to database but don't let it block route registration
        try {
            await (0, database_1.connectDatabase)();
            console.log('Database connected');
        }
        catch (error) {
            console.error('Database connection failed:', error);
            // Don't throw - let the app continue without DB for now
        }
        console.log('Fastify setup complete');
        return fastify;
    }
    catch (error) {
        console.error('Error during Fastify setup:', error);
        throw error;
    }
};
const startServer = async () => {
    try {
        await setupFastify();
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server is running on port ${PORT}`);
        console.log("Ready");
    }
    catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};
// Initialize for both environments
let isSetup = false;
const initializeFastify = async () => {
    if (!isSetup) {
        console.log('Setting up Fastify...');
        await setupFastify();
        isSetup = true;
        console.log('Fastify setup complete');
    }
    return fastify;
};
// Handle different environments
if (!process.env.VERCEL) {
    // For local development: setup and start listening
    startServer();
}
// Export for Vercel serverless functions  
exports.default = async (req, res) => {
    try {
        console.log('Handling request:', req.method, req.url);
        const app = await initializeFastify();
        await app.ready();
        console.log('App ready, emitting request');
        app.server.emit('request', req, res);
    }
    catch (error) {
        console.error('Error in serverless function:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
        }));
    }
};
