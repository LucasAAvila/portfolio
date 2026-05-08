import { describe, expect, it } from "vitest";

import { contactSchema } from "./contact-schema";

const valid = {
  name: "Jane Doe",
  email: "jane@example.com",
  message: "Hello, this is a sufficiently long message.",
};

describe("contactSchema", () => {
  it("accepts a valid payload", () => {
    const result = contactSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects a name shorter than 2 characters with the i18n message key", () => {
    const result = contactSchema.safeParse({ ...valid, name: "A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("nameTooShort");
    }
  });

  it("rejects a name longer than 100 characters", () => {
    const result = contactSchema.safeParse({ ...valid, name: "x".repeat(101) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("nameTooLong");
    }
  });

  it("rejects an invalid email", () => {
    const result = contactSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("invalidEmail");
    }
  });

  it("rejects a message shorter than 10 characters", () => {
    const result = contactSchema.safeParse({ ...valid, message: "short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("messageTooShort");
    }
  });

  it("rejects a message longer than 2000 characters", () => {
    const result = contactSchema.safeParse({
      ...valid,
      message: "x".repeat(2001),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("messageTooLong");
    }
  });

  it("treats the optional honeypot website field as ignored when empty", () => {
    const result = contactSchema.safeParse({ ...valid, website: "" });
    expect(result.success).toBe(true);
  });
});
