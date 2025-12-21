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

    await connectDatabase();
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

// Initialize Fastify setup for both environments
setupFastify().catch(console.error);

// Only start listening if not in Vercel environment
if (!process.env.VERCEL) {
    setupFastify();
}else {
    startServer();
    console.log("Running in Vercel environment, skipping server start.");
}


export default fastify;

