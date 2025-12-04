import {
  PRIVATE_SUPABASE_URL,
  PRIVATE_SUPABASE_SERVICE_ROLE_KEY,
  PRIVATE_TURNSTILE_SECRET_KEY,
  PRIVATE_SUPABASE_ANON_KEY,
  DATABASE_URL
} from "$env/static/private";

// Private configuration for backend
// These values should NEVER be exposed to the client-side

export interface PrivateConfig {
  /**
   * Secret key for encryption
   * NOTE: In production, this should be loaded from environment variables
   */
  encryptionSecret: string;

  /**
   * Database connection string
   * NOTE: In production, this should be loaded from environment variables
   */
  databaseUrl: string;

  /**
   * Supabase configuration
   */
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };

  /**
   * Turnstile configuration
   */
  turnstile: {
    secretKey: string;
  };

  db: {
    uri: string;
  }

  /**
   * Port for the server to listen on
   */
  port: number;

  /**
   * Flag to enable/disable production mode
   */
  isProduction: boolean;
}

// In a real application, these would be loaded from environment variables
// For this demo application, we're using default values
export const privateConfig: PrivateConfig = {
  encryptionSecret: 'your-super-secret-key-here-change-in-production',
  databaseUrl: 'sqlite://./totp-store.db',
  supabase: {
    url: PRIVATE_SUPABASE_URL,
    anonKey: PRIVATE_SUPABASE_ANON_KEY,
    serviceRoleKey: PRIVATE_SUPABASE_SERVICE_ROLE_KEY,
  },
  turnstile: {
    secretKey: PRIVATE_TURNSTILE_SECRET_KEY,
  },
  db: {
    uri: DATABASE_URL,
  },
  port: 3000,
  isProduction: false

};