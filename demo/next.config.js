const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // basePath: '/seqviz', // Removed for Amplify root deployment
  images: {
    unoptimized: true,
  },
  experimental: {
    externalDir: true,
  },
  typescript: {
    // Allow builds to complete even with type errors from parent src directory
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Ensure only one instance of React is used
    config.resolve.alias = {
      ...config.resolve.alias,
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    };
    
    return config;
  },
};

module.exports = nextConfig;

