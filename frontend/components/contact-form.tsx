"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import { contactSchema, type ContactInput } from "@/lib/contact-schema";

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function ContactForm() {
  const t = useTranslations("contact.form");
  const tErrors = useTranslations("contact.form.errors");
  const [state, setState] = useState<FormState>({ kind: "idle" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "", website: "" },
  });

  async function onSubmit(data: ContactInput) {
    if (data.website && data.website.length > 0) {
      setState({ kind: "success" });
      return;
    }

    setState({ kind: "submitting" });

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: data.message,
        }),
      });

      if (res.status === 204) {
        setState({ kind: "success" });
        reset();
        return;
      }

      if (res.status === 429) {
        setState({ kind: "error", message: tErrors("rateLimit") });
        return;
      }

      setState({ kind: "error", message: tErrors("generic") });
    } catch {
      setState({ kind: "error", message: tErrors("network") });
    }
  }

  const labelClass =
    "font-mono text-[9px] tracking-[0.14em] uppercase text-text-faint mb-1.5 block";
  const inputClass =
    "w-full bg-surface-1 border border-border-1 rounded-[5px] px-3 py-2 text-[12px] text-text placeholder:text-text-faint focus:border-accent-border focus:outline-none transition-colors";

  const submitting = state.kind === "submitting";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
      {/* Honeypot — hidden from real users, bots fill it */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label>
          Website (leave empty)
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            {t("nameLabel")}
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={inputClass}
            disabled={submitting}
            {...register("name")}
          />
          {errors.name && (
            <p id="contact-name-error" role="alert" className="mt-1 text-[11px] text-destructive">
              {tErrors(errors.name.message as string)}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-email" className={labelClass}>
            {t("emailLabel")}
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={inputClass}
            disabled={submitting}
            {...register("email")}
          />
          {errors.email && (
            <p id="contact-email-error" role="alert" className="mt-1 text-[11px] text-destructive">
              {tErrors(errors.email.message as string)}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          {t("messageLabel")}
        </label>
        <textarea
          id="contact-message"
          rows={5}
          aria-invalid={errors.message ? "true" : "false"}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={`${inputClass} resize-y`}
          disabled={submitting}
          {...register("message")}
        />
        {errors.message && (
          <p id="contact-message-error" role="alert" className="mt-1 text-[11px] text-destructive">
            {tErrors(errors.message.message as string)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="font-mono border border-border-4 text-text-mute hover:text-text hover:border-accent-border transition-colors px-[14px] py-[6px] text-[11px] tracking-[0.06em] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? t("submitting") : t("submit")}
        </button>

        {state.kind === "success" && (
          <p role="status" className="text-[11px] text-accent">
            {t("success")}
          </p>
        )}
        {state.kind === "error" && (
          <p role="alert" className="text-[11px] text-destructive">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
