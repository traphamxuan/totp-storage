import { 
    PUBLIC_CLERK_PUBLISHABLE_KEY,
  PUBLIC_TURNSTILE_SITE_KEY
} from '$env/static/public';

// Public configuration for frontend
// These values are safe to expose to the client-side

export interface PublicConfig {
  /**
   * Application name displayed in the UI
   */
  appName: string;
  
  /**
   * Default TOTP issuer name
   */
  defaultIssuer: string;
  
  /**
   * Application version
   */
  version: string;
  
  /**
   * API base URL for public endpoints
   */
  apiBaseUrl: string;
  
  /**
   * Turnstile configuration
   */
  turnstile: {
    siteKey: string;
  };

  clerk: {
    publishableKey: string;
  };
}

export const publicConfig: PublicConfig = {
  appName: 'TOTP Store',
  defaultIssuer: 'TOTP Store',
  version: '1.0.0',
  apiBaseUrl: '/api/public/totp',
  turnstile: {
    siteKey: PUBLIC_TURNSTILE_SITE_KEY || ''
  },
  clerk: {
    publishableKey: PUBLIC_CLERK_PUBLISHABLE_KEY || ''
  },
  
};