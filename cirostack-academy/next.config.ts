import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.mux.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default config;
