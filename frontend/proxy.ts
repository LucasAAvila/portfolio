import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(en|pt-BR)/:path*",
    "/((?!_next|_vercel|apple-icon|icon|robots|sitemap|manifest|favicon|.*\\..*).*)",
  ],
};
