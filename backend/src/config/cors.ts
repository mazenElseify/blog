/**
 * CORS Configuration
 * Manages allowed origins for cross-origin requests
 */

export interface CorsConfig {
    allowedOrigins: string[];
    credentials: boolean;
}

/**
 * Build allowed origins array with environment variables
 */
const buildAllowedOrigins = (): string[] => {
    const baseOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3001',
        'http://localhost:8080'
    ];
    
    const envOrigins: string[] = [
        process.env.FRONTEND_URL,
        process.env.CORS_ORIGIN
    ].filter((origin): origin is string => Boolean(origin)); // Type-safe filter
    
    // Combine and remove duplicates
    return [...new Set([...baseOrigins, ...envOrigins])];
};

/**
 * Get CORS configuration
 */
export const getCorsConfig = (): CorsConfig => ({
    allowedOrigins: buildAllowedOrigins(),
    credentials: true
});

/**
 * Export for direct use
 */
export const allowedOrigins = buildAllowedOrigins();