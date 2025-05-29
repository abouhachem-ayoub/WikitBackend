import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*", // Match all API routes
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" }, // Allow all origins (adjust as needed)
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" }, // Allowed HTTP methods
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" }, // Allowed headers
          { key: "Access-Control-Allow-Credentials", value: "true" }, // Allow credentials
          { key: "X-Content-Type-Options", value: "nosniff" }, // Security header
        ],
      },
    ];
  },
};
export default nextConfig;
