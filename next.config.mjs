/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Proxy API calls from the frontend to the backend during dev (and next start)
  // This avoids CORS issues when the API runs on a different origin (e.g. localhost:4000)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_PROXY || 'http://localhost:4000/:path*',
      },
    ]
  },
}

export default nextConfig
