import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  allowedDevOrigins: ["192.168.0.121", "10.190.10.154"],
};

export default nextConfig;
