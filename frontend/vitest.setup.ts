import "@testing-library/jest-dom/vitest";

// Some modules read NEXT_PUBLIC_* env vars at top level, so they must be set
// before any test module imports them. Configure once here.
process.env.NEXT_PUBLIC_API_URL ??= "http://api.test";
