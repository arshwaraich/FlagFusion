// config.ts

const dev = {
  API_BASE_URL: 'http://localhost:54321', // Change to your local dev server if needed
  API_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
};

const prod = {
  API_BASE_URL: 'https://api.flagfusion.ca', // Change to your production domain
  API_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
};

export const config =
  process.env.NODE_ENV === 'production' ? prod : dev;
