import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    '*': ['.claude/**', '.agent-trace/**', '.dev-case-store.json'],
  },
};

export default nextConfig;
