import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack対応: 本番のみ console.log/info/warn/debug を除去（errorは残す）
  compiler: {
    removeConsole: { exclude: ["error"] },
  },

  // 本番最適化
  // experimental: {
  //   optimizeCss: true,  // crittersエラーのため一時的に無効化
  // },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
