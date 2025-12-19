"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
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
// Build allowed origins array with environment variables
const buildAllowedOrigins = () => {
    const baseOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3001',
        'http://localhost:8080'
    ];
    const envOrigins = [
        process.env.FRONTEND_URL,
        process.env.CORS_ORIGIN
    ].filter((origin) => Boolean(origin)); // Type-safe filter
    // Combine and remove duplicates
    return [...new Set([...baseOrigins, ...envOrigins])];
};
const allowedOrigins = buildAllowedOrigins();
const PORT = parseInt(process.env.PORT || '3000');
const startServer = async () => {
    try {
        await fastify.register(helmet_1.default);
        await fastify.register(cors_1.default, {
            origin: allowedOrigins,
            credentials: true
        });
        fastify.setErrorHandler(errorHandler_1.errorHandler);
        await fastify.register(auth_routes_1.default, { prefix: '/api/auth' });
        await fastify.register(post_routes_1.default, { prefix: '/api/posts' });
        fastify.get('/health', async (request, reply) => {
            return {
                status: 'ok',
                message: "Blog API is running",
                timestamp: new Date().toISOString(),
                version: "1.0.0"
            };
        });
        fastify.get('/', async (request, reply) => {
            reply.send({
                message: "Welcome to Blog API",
                version: "1.0.0",
                endpoints: {
                    users: "/api/users",
                    health: "/api/health",
                    blogs: "/api/blogs",
                    auth: "/api/auth"
                }
            });
        });
        await (0, database_1.connectDatabase)();
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server is running on port ${PORT}`);
        console.log("Ready");
    }
    catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};
if (!process.env.VERCEL) {
    startServer();
}
exports.default = fastify;
