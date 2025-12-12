export const config = {
    turnstile: {
        secretKey: process.env.NEXT_PRIVATE_TURNSTILE_SECRET_KEY || '',
        // Also include the alternative Turnstile key found in the API route
        siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''
    },
    vercel: {
        url: process.env.VERCEL_URL || ''
    },
    supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
    }
}