/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['glnphnlzldbydpyqnmxb.supabase.co'], // Supabase storage domain
  },
  // Disable static page generation for API routes during build
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
