import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContactForm } from "./contact-form";

// next-intl's useTranslations would otherwise need a provider with messages.
// In tests we just want to assert by translation key, so identity-return is fine.
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const VALID = {
  name: "Jane Doe",
  email: "jane@example.com",
  message: "Hello there, this is a long enough message.",
};

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(new Response(null, { status: 204 })))
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("nameLabel"), VALID.name);
  await user.type(screen.getByLabelText("emailLabel"), VALID.email);
  await user.type(screen.getByLabelText("messageLabel"), VALID.message);
}

describe("<ContactForm />", () => {
  it("renders all form fields and the submit button", () => {
    render(<ContactForm />);
    expect(screen.getByLabelText("nameLabel")).toBeInTheDocument();
    expect(screen.getByLabelText("emailLabel")).toBeInTheDocument();
    expect(screen.getByLabelText("messageLabel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "submit" })).toBeInTheDocument();
  });

  it("submits valid data to /contact and shows the success message", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("success");
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("http://api.test/contact");
    expect(init).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    expect(JSON.parse(init.body as string)).toEqual({
      name: VALID.name,
      email: VALID.email,
      message: VALID.message,
    });
  });

  it("shows the rate-limit error message when the API returns 429", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(null, { status: 429 })))
    );

    const user = userEvent.setup();
    render(<ContactForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      expect(alerts.some((el) => el.textContent === "rateLimit")).toBe(true);
    });
  });

  it("shows the network error message when fetch rejects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("offline")))
    );

    const user = userEvent.setup();
    render(<ContactForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      expect(alerts.some((el) => el.textContent === "network")).toBe(true);
    });
  });

  it("shows a Zod-derived error message for short input and does not call the API", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText("nameLabel"), "A"); // too short
    await user.type(screen.getByLabelText("emailLabel"), VALID.email);
    await user.type(screen.getByLabelText("messageLabel"), VALID.message);
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      expect(alerts.some((el) => el.textContent === "nameTooShort")).toBe(true);
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("silently 'succeeds' when the honeypot field is filled (bot path)", async () => {
    const user = userEvent.setup();
    const { container } = render(<ContactForm />);

    await fillForm(user);
    // The honeypot field is hidden off-screen; bots that fill all inputs by
    // selector hit it. Real users never see it.
    const honeypot = container.querySelector('input[name="website"]') as HTMLInputElement;
    expect(honeypot).not.toBeNull();
    await user.type(honeypot, "https://spammer.example");

    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("success");
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});
