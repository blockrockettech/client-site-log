/**
 * Environment variable validation and configuration
 * Ensures all required environment variables are present and valid
 */

interface EnvironmentConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}

const validateEnvVar = (name: string, value: string | undefined): string => {
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Please check your .env file and ensure ${name} is set. ` +
      `Refer to the README for setup instructions.`
    );
  }
  return value.trim();
};

const validateSupabaseUrl = (url: string): string => {
  try {
    new URL(url);
    if (!url.includes('supabase.co') && !url.includes('localhost')) {
      console.warn('Warning: Supabase URL does not appear to be a valid Supabase URL');
    }
    return url;
  } catch {
    throw new Error(`Invalid VITE_SUPABASE_URL: "${url}" is not a valid URL`);
  }
};

const validateSupabaseKey = (key: string): string => {
  if (key.length < 50) {
    throw new Error('Invalid VITE_SUPABASE_ANON_KEY: Key appears to be too short');
  }
  return key;
};

// Validate and export environment variables
const createEnvironmentConfig = (): EnvironmentConfig => {
  const supabaseUrl = validateEnvVar('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL);
  const supabaseKey = validateEnvVar('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY);

  return {
    VITE_SUPABASE_URL: validateSupabaseUrl(supabaseUrl),
    VITE_SUPABASE_ANON_KEY: validateSupabaseKey(supabaseKey),
  };
};

// Initialize and export the validated environment configuration
export const env = createEnvironmentConfig();

// Helper function to check if we're in development mode
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
