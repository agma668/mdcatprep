/**
 * A per-build epoch for the service worker. Every deploy (and every local
 * `next build`/`next start`) produces a NEW value, so:
 *  - the client registers the SW at `/sw.js?v=<epoch>` — a changed script URL
 *    makes the browser re-fetch the SW itself instead of waiting on its own
 *    update schedule, and
 *  - the SW's cache generation is `cadet-prep-<epoch>`, so each deploy's
 *    activate deletes the previous generation's caches atomically — old pages
 *    and chunks can never mix with new ones, and a deploy can never leave a
 *    student running a stale cache.
 *
 * On Vercel the value is stable per deployment (the git commit SHA); locally
 * it falls back to SW_EPOCH if set, else the build timestamp.
 */
const swEpoch = (
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.SW_EPOCH ||
  Date.now()
)
  .toString()
  .slice(-12);

// Security headers for all routes
const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SW_EPOCH: swEpoch,
  },
  // Allow the Base44 preview origin to load dev assets/HMR. The platform
  // sets BASE44_PUBLIC_HOST_SUFFIX per-sandbox; without this Next blocks the
  // preview origin's requests to dev-only assets.
  allowedDevOrigins: process.env.BASE44_PUBLIC_HOST_SUFFIX
    ? [`3000-${process.env.BASE44_PUBLIC_HOST_SUFFIX}`]
    : [],
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    // The SW is served by app/sw/route.ts (it needs to inject the per-deploy
    // cache generation), whose path is /sw — rewrite the canonical /sw.js URL
    // the client registers to it.
    return [{ source: '/sw.js', destination: '/sw' }]
  },
};

export default nextConfig;
