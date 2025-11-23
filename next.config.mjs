/** @type {import('next').NextConfig} */
const nextConfig = {
  // We rely on the system's process.env.API_KEY injection at runtime.
  // Explicitly defining it here can sometimes freeze it as 'undefined' during build.
};

export default nextConfig;