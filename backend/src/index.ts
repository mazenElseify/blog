import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import authRoutes from './app/auth/routes/auth.routes';
import postRoutes from './app/blog/routes/post.routes';
import { errorHandler } from './middleware/errorHandler';
import { getCorsConfig } from './config/cors';

dotenv.config();

const fastify = Fastify({
    logger: true
});

const PORT = parseInt(process.env.PORT || '3000');

// Setup routes and middleware for both local and Vercel environments
const setupFastify = async () => {
    try {
        console.log('Starting Fastify setup...');
        
        await fastify.register(helmet);
        console.log('Helmet registered');

        await fastify.register(multipart, {
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB
            }
        });
        console.log('Multipart registered');

        const corsConfig = getCorsConfig();
        await fastify.register(cors, {
            origin: corsConfig.allowedOrigins,
            credentials: corsConfig.credentials,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        });
        console.log('CORS registered with config:', corsConfig);

        fastify.setErrorHandler(errorHandler);
        console.log('Error handler set');

        await fastify.register(authRoutes, { prefix: '/api/auth' });
        console.log('Auth routes registered');
        
        await fastify.register(postRoutes, { prefix: '/api/posts' });
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
        
        fastify.get('/' , async (request, reply) => {
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
            await connectDatabase();
            console.log('Database connected');
        } catch (error) {
            console.error('Database connection failed:', error);
            // Don't throw - let the app continue without DB for now
        }
        
        console.log('Fastify setup complete');
        return fastify;
    } catch (error) {
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
    } catch (error) {
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
export default async (req: any, res: any) => {
    try {
        console.log('Handling request:', req.method, req.url);
        const app = await initializeFastify();
        await app.ready();
        console.log('App ready, emitting request');
        app.server.emit('request', req, res);
    } catch (error) {
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

