/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    // 배포 시 ESLint 오류 무시 (개발 중에는 여전히 표시됨)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 배포 시 TypeScript 오류 무시 (개발 중에는 여전히 표시됨)
    ignoreBuildErrors: true,
  }
};

module.exports = nextConfig;
