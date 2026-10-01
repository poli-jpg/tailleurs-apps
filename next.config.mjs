/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // les photos de tissu/modèle passent par les server actions
    serverActions: { bodySizeLimit: '8mb' },
  },
};
export default nextConfig;
