import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "www.imago-images.de" },
        ],
    },
};

export default nextConfig;
