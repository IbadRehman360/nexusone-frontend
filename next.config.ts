import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone server output — required by azure-pipelines-appservice.yml,
  // which packages .next/standalone and runs it directly via
  // `node .next/standalone/server.js` on Azure App Service.
  output: "standalone",
  images: {
    unoptimized: true,
  },
devIndicators: false,
  // Proxy all /api/* requests to the backend. Using the proxy (instead of
  // calling the backend directly) keeps all requests same-origin so httpOnly
  // cookies work without cross-origin complications once real auth is wired.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";
    return {
      fallback: [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
