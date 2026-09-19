import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "chatpilot.ieducationbd.com",
    "144.79.133.198",
    "127.0.0.1",
    "localhost",
  ],

  // Same-origin API proxy: the SPA calls /api/* and Next forwards it to the
  // backend, so HttpOnly auth cookies are always first-party regardless of
  // which hostname the app is served on.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // :path* captures without the trailing slash — re-append it because
        // Django routes all end in "/" (otherwise APPEND_SLASH loops).
        destination: `${API_URL}/api/:path*/`,
      },
    ];
  },
};

export default nextConfig;
