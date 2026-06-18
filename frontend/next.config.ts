import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ??
      (isProd ? "/api/v1" : "http://localhost:5000/api/v1"),
    API_URL:
      process.env.API_URL ??
      (isProd
        ? "https://incentive-calculator-frontend.vercel.app/api/v1"
        : "http://localhost:5000/api/v1"),
  },
};

export default nextConfig;
