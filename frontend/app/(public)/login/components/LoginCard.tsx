"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./LoginCard.module.css";
import { apiUrl, readApiError } from "@/app/lib/api";
import { useTranslation } from "@/app/lib/i18n/useTranslation";
import { errorText, type FieldError } from "@/app/lib/i18n/fieldError";

// -rbauer- Frontend-only, for instant feedback. The backend re-checks the email
// format (auth/dto/login.dto.ts) and is the only real enforcement point.
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// ----------------------------------------------------------------------------
// -rbauer- Checks the form before calling the backend. Returns translation KEYS
// (fieldError.ts), not resolved text, so errors stay correct after a language
// change.
//
// Without it, a malformed email was only caught by the backend, whose answers
// are always in English (see ERRORS_LIST). The common case is now caught before
// the network call and shown translated.
// ----------------------------------------------------------------------------
function validate(form: { email: string; password: string }): Record<string, FieldError> {
  const newErrors: Record<string, FieldError> = {};
  const email = form.email.trim();

  if (!email) {
    newErrors.email = { key: "login.errors.emailRequired" };
  } else if (!EMAIL_REGEX.test(email)) {
    newErrors.email = { key: "login.errors.emailInvalid" };
  }

  // -rbauer- Login only checks that a password was typed: no length rule here,
  // only the backend knows whether it is correct.
  if (!form.password) {
    newErrors.password = { key: "login.errors.passwordRequired" };
  }

  return newErrors;
}

const LoginCard = () => {
  const router = useRouter();
  // -rbauer- `t` resolves a key in the current language and re-runs on every
  // render, including the one caused by switching languages.
  const { t } = useTranslation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // -rbauer- One FieldError per faulty field ("email", "password", "general"),
  // stored as a translation key rather than resolved text (fieldError.ts).
  const [errors, setErrors] = useState<Record<string, FieldError>>({});

  // -rbauer- True while the request is in flight; disables the submit button so
  // a slow connection cannot produce a double request.
  const [loading, setLoading] = useState(false);

  async function handlesSubmit(e: React.FormEvent<HTMLFormElement>) {
    // -rbauer- Prevents the browser's default full-page-reload submission; the
    // request is sent with fetch() below.
    e.preventDefault();

    if (loading) return;

    // -rbauer- Client-side checks first: on failure, report at once and skip the
    // network call.
    const validationErrors = validate(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      if (res.ok) {
        // -rbauer- Logged in: the backend already set the session cookies.
        router.push("/dashboard");
        router.refresh();
        return;
      }

      // -rbauer- The backend refused. Branch on `err.code`, a stable identifier,
      // never on `err.message` (free English text) -- see VALIDATION_ERROR below
      // for the one remaining exception.
      const err = await readApiError(res);
      const fieldErrors: Record<string, FieldError> = {};

      if (err.code === "VALIDATION_ERROR") {
        // -rbauer- The backend rejected something `validate()` did not catch.
        // Response shape: { fields: { <fieldName>: ["message", ...] } }.
        const fields = err.details?.fields;

        if (fields && typeof fields === "object") {
          for (const [field, msgs] of Object.entries(fields)) {
            if (Array.isArray(msgs) && msgs.length > 0) {
              // -rbauer- Backend-authored English with no translation key:
              // FieldError accepts a plain string and shows it as-is.
              fieldErrors[field] = String(msgs[0]);
            }
          }
        } else {
          fieldErrors.general = { key: "login.errors.validationFailed" };
        }
      } else if (err.code === "UNAUTHORIZED" || err.code === "INVALID_CREDENTIALS") {
        fieldErrors.general = { key: "login.errors.invalidCredentials" };
      } else {
        fieldErrors.general = { key: "login.errors.generic" };
      }

      setErrors(fieldErrors);
    } catch (error) {
      // -rbauer- fetch() threw: the request never reached the backend (host
      // unreachable, untrusted TLS certificate) -- not an error status code.
      console.error("Login error:", error);
      setErrors({
        general: { key: "login.errors.network" },
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handlesSubmit} noValidate>
      <label htmlFor="email">{t("login.emailLabel")}</label>
      <input
        type="email"
        id="email"
        placeholder={t("login.emailPlaceholder")}
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      {/* -rbauer- errorText() resolves the stored FieldError into text in the
          current language, on every re-render. */}
      {errors.email && <p className={styles.error}>{errorText(errors.email, t)}</p>}

      <label htmlFor="password">{t("login.passwordLabel")}</label>
      <input
        type="password"
        id="password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      {errors.password && <p className={styles.error}>{errorText(errors.password, t)}</p>}

      {errors.general && <p className={styles.generalError}>{errorText(errors.general, t)}</p>}

      <button type="submit" disabled={loading}>
        {loading ? t("login.submitting") : t("login.submit")}
      </button>
    </form>
  );
};

export default LoginCard;
