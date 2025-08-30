import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.app.github.dev", "github.dev"],
    },
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://use.typekit.net https://p.typekit.net",
              "font-src 'self' https://use.typekit.net https://p.typekit.net",
              "connect-src 'self' https://use.typekit.net https://p.typekit.net https://www.google-analytics.com https://*.app.github.dev https://github.dev",
              "img-src 'self' data: https://use.typekit.net https://p.typekit.net",
              "manifest-src 'self' https://*.app.github.dev https://github.dev",
              "frame-src 'self' https://*.app.github.dev https://github.dev",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
