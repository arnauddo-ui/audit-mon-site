/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    NEXT_PUBLIC_ADMIN_EMAIL: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'arnaud.doguet@gmail.com',
  },
}

module.exports = nextConfig
