import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// Vercel Speed Insights sends vitals to this host.
const VERCEL_VITALS = "https://vitals.vercel-insights.com";
// Vercel Speed Insights script origin.
const VERCEL_SCRIPTS = "https://va.vercel-scripts.com";

// Vercel Preview embeds the site in an iframe on *.vercel.app. Blocking all
// framing would break the preview UI, so allow it only in non-production envs.
const isProduction = process.env.VERCEL_ENV === "production";
const frameAncestors = isProduction
  ? "frame-ancestors 'none'"
  : "frame-ancestors 'self' https://*.vercel.app";

const csp = [
  "default-src 'self'",
  // next-intl + Tailwind 4 require inline styles; JSON-LD blocks require
  // unsafe-inline for script-src. Switch to nonces when Next.js supports them
  // without the Pages Router restriction.
  "script-src 'self' 'unsafe-inline' " + VERCEL_SCRIPTS,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' " + BACKEND_URL + " " + VERCEL_VITALS,
  frameAncestors,
  "base-uri 'self'",
  "form-action 'self'",
]
  .join("; ")
  .trim();

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // In production, DENY framing entirely. In preview, omit this legacy header
  // and rely solely on the CSP frame-ancestors directive above, which takes
  // precedence when both are present anyway.
  ...(isProduction ? [{ key: "X-Frame-Options", value: "DENY" }] : []),
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
