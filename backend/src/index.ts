import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { getCorsConfig, type CorsConfig } from './config/cors';
import authRoutes from './app/auth/routes/auth.routes';
import postRoutes from './app/blog/routes/post.routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const fastify = Fastify({
    logger: true
});

const PORT = parseInt(process.env.PORT || '3000');

// Setup routes and middleware for both local and Vercel environments
const setupFastify = async () => {
    const corsConfig = getCorsConfig();
    
    await fastify.register(helmet);

    await fastify.register(cors, {
        origin: corsConfig.allowedOrigins,
        credentials: corsConfig.credentials
    });
    
    fastify.setErrorHandler(errorHandler);

    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(postRoutes, { prefix: '/api/posts' });

    fastify.get('/health', async (request, reply) => {
        return {
            status: 'ok',
            message: "Blog API is running",
            timestamp: new Date().toISOString(),
            version: "1.0.0"
        };
    });
    
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

    // Connect to database but don't let it block route registration
    try {
        await connectDatabase();
    } catch (error) {
        console.error('Database connection failed:', error);
        // Don't throw - let the app continue without DB for now
    }
    
    return fastify;
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
} else {
    // For Vercel: Initialize immediately
    initializeFastify().catch(console.error);
}

// Export for Vercel serverless functions  
export default async (req: any, res: any) => {
    const app = await initializeFastify();
    await app.ready();
    app.server.emit('request', req, res);
};

