import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import authRoutes from './app/auth/routes/auth.routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const fastify = Fastify({
    logger: true
});

const PORT = parseInt(process.env.PORT || '3000');

const startServer = async () => {
    try {
        await fastify.register(helmet);

        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3001',
            'http://localhost:8080',
            process.env.FRONTEND_URL || '',
            process.env.CORS_ORIGIN || ''

        ];
        if (process.env.CORS_ORIGIN) {
            allowedOrigins.push(process.env.CORS_ORIGIN);
        }
        if (process.env.FRONTEND_URL) {
            allowedOrigins.push(process.env.FRONTEND_URL);
        };
        await fastify.register(cors, {
            origin: allowedOrigins,
            credentials: true
        });
        fastify.setErrorHandler(errorHandler);

        await fastify.register(authRoutes, { prefix: '/api/auth' });
        
        fastify.get('/heatlh', async (request, reply) => {
            return {
                status: 'ok',
                message: "Blog API is running",
                timestamp: new Date().toISOString(),
                version: "1.0.0"
            };
        });
        
        fastify.get('/' , async (request, reply) => {
            return { 
                message: "Welcome to Blog API",
                version: "1.0.0",
                endpoints: {
                    users: "/api/users",
                    health: "/api/health",
                    blogs: "/api/blogs",
                    auth: "/api/auth"
                }
            };
        });
        await connectDatabase();
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server is running on port ${PORT}`);
        console.log("Ready");
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};
if (!process.env.VERCEL) {

    startServer();
}

export default fastify;

