export const config = {
    turnstile: {
        secretKey: process.env.PRIVATE_TURNSTILE_SECRET_KEY || '',
        // Also include the alternative Turnstile key found in the API route
        publicKey: process.env.TURNSTILE_SECRET_KEY || ''
    },
    vercel: {
        url: process.env.VERCEL_URL || ''
    },
    supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
    }
}