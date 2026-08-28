/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'gestantes-app.vercel.app' }],
        destination: 'https://gestaremovimento.com.br/:path*',
        permanent: true,
      },
      {
        source: '/dores',
        destination: '/apoio',
        permanent: true,
      },
      {
        source: '/dores/:path*',
        destination: '/apoio/:path*',
        permanent: true,
      },
      {
        source: '/parto',
        destination: '/parte',
        permanent: true,
      },
      {
        source: '/parto/:path*',
        destination: '/parte/:path*',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '**.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },
}

module.exports = nextConfig
