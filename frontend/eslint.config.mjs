import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  {
    rules: {
      // Catch HTML entities in JSX (apostrophes, quotes) that should be escaped.
      "react/no-unescaped-entities": "warn",
      // No leftover debug logs in committed code; allow `console.warn` and
      // `console.error` since they're useful for the error boundary and runtime
      // diagnostics.
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // Catch leftover debugger statements before they hit production.
      "no-debugger": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
