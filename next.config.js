/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns:[
            {
                protocol: 'https',
                hostname: 'au-festio-images.s3.us-east-1.amazonaws.com',
                pathname: '/**',
            },
        ],
    },
};

module.exports = nextConfig;
