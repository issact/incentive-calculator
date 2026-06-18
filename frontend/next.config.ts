import type { NextConfig } from "next";

const productionApiUrl =
  "https://incentive-calculator-backend.vercel.app/api/v1";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ?? productionApiUrl,
    API_URL: process.env.API_URL ?? productionApiUrl,
  },
};

export default nextConfig;
