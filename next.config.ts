import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [
    'pino',
    'pino-http',
    'pino-pretty',
    'thread-stream',
    'mongoose',
    'mongodb',
  ],
};

export default nextConfig;
