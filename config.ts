// config.ts

const dev = {
  API_BASE_URL: 'http://localhost:54321', // Change to your local dev server if needed
};

const prod = {
  API_BASE_URL: 'https://api.flagfusion.ca', // Change to your production domain
};

export const config =
  process.env.NODE_ENV === 'production' ? prod : dev;
