import type { RequestHandler } from './$types';
import { generateToken } from '$lib/server';

export const GET: RequestHandler = async () => {
    try {
        // Generate a sample OTP using the WASM implementation
        const secret = 'JBSWY3DPEHPK3PXP'; // Sample secret for testing
        const result = generateToken(secret);
        return new Response(JSON.stringify(result), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error generating OTP:', error);
        return new Response('Error generating OTP', { status: 500 });
    }
};