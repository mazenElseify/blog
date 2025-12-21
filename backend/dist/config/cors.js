"use strict";
/**
 * CORS Configuration
 * Manages allowed origins for cross-origin requests
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowedOrigins = exports.getCorsConfig = void 0;
/**
 * Build allowed origins array with environment variables
 */
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
/**
 * Get CORS configuration
 */
const getCorsConfig = () => ({
    allowedOrigins: buildAllowedOrigins(),
    credentials: true
});
exports.getCorsConfig = getCorsConfig;
/**
 * Export for direct use
 */
exports.allowedOrigins = buildAllowedOrigins();
