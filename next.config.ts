import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack設定でproduction環境のconsole.*を除去
  webpack: (config, { dev }) => {
    if (!dev) {
      // 本番環境でconsole.logとconsole.infoを除去（console.errorは保持）
      config.optimization.minimizer.forEach((minimizer: any) => {
        if (minimizer.constructor.name === 'TerserPlugin') {
          minimizer.options.terserOptions = {
            ...minimizer.options.terserOptions,
            compress: {
              ...minimizer.options.terserOptions?.compress,
              drop_console: ['log', 'info', 'warn', 'debug'],
            },
          }
        }
      })
    }
    return config
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
