"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./LoginCard.module.css";
import { apiUrl, readApiError } from "@/app/lib/api";
import { useTranslation } from "@/app/lib/i18n/useTranslation";
import { errorText, type FieldError } from "@/app/lib/i18n/fieldError";

// -rbauer- Checked on the frontend only for instant feedback. The backend re-checks
// email format on its own (backend/src/auth/dto/login.dto.ts) and is the
// only one that actually enforces it -- this regex is a UX nicety, not a
// security boundary.
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// ----------------------------------------------------------------------------
// -rbauer- Checks the form BEFORE calling the backend. Returns translation KEYS (see
// app/lib/i18n/fieldError.ts), not resolved text, so the errors stay correct
// even if the user changes language after they appear on screen.
//
// Why this function exists at all: originally this page had NO client-side
// checks, so a badly formatted email only got caught by the backend, whose
// answer is always in English (see ERRORS_LIST) -- the error text never
// matched the selected language. Adding this check means the common case
// (empty or malformed email) never even reaches the network, and is shown
// correctly translated immediately.
// ----------------------------------------------------------------------------
function validate(form: { email: string; password: string }): Record<string, FieldError> {
  const newErrors: Record<string, FieldError> = {};
  const email = form.email.trim();

  if (!email) {
    newErrors.email = { key: "login.errors.emailRequired" };
  } else if (!EMAIL_REGEX.test(email)) {
    newErrors.email = { key: "login.errors.emailInvalid" };
  }

  // -rbauer- Login only needs to know a password was typed -- unlike registration,
  // there's no length/strength rule to check here, the backend is the one
  // that knows if it's actually correct.
  if (!form.password) {
    newErrors.password = { key: "login.errors.passwordRequired" };
  }

  return newErrors;
}

const LoginCard = () => {
  const router = useRouter();
  // -rbauer- `t` translates a key to text in the CURRENTLY selected language, and
  // re-computes automatically on every render (including the render caused
  // by the user switching languages -- see LanguageContext.tsx).
  const { t } = useTranslation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // -rbauer- One FieldError per field with a problem ("email", "password", or
  // "general"). Stored as a translation key (FieldError), never as
  // already-translated text -- see app/lib/i18n/fieldError.ts for why that
  // distinction matters.
  const [errors, setErrors] = useState<Record<string, FieldError>>({});

  // -rbauer- True while waiting for the backend's answer; disables the submit
  // button so a slow connection can't cause a double request.
  const [loading, setLoading] = useState(false);

  async function handlesSubmit(e: React.FormEvent<HTMLFormElement>) {
    // -rbauer- Prevents the browser's default full-page-reload form submission --
    // we handle everything ourselves with fetch() below.
    e.preventDefault();

    if (loading) return;

    // -rbauer- Client-side checks first: if anything's wrong, show it immediately
    // and skip the network call entirely.
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
        // -rbauer- Logged in: the backend has already set the session cookies,
        // just navigate to the app.
        router.push("/dashboard");
        router.refresh();
        return;
      }

      // -rbauer- The backend refused the request. `err.code` is a stable identifier
      // we can safely branch on (unlike `err.message`, which is free
      // English text -- see the VALIDATION_ERROR case below for the one
      // place we still have to fall back to it, and why).
      const err = await readApiError(res);
      const fieldErrors: Record<string, FieldError> = {};

      if (err.code === "VALIDATION_ERROR") {
        // -rbauer- The backend re-validated and rejected something our own
        // `validate()` above didn't catch. Its response shape is
        // { fields: { <fieldName>: ["message", ...] } }.
        const fields = err.details?.fields;

        if (fields && typeof fields === "object") {
          for (const [field, msgs] of Object.entries(fields)) {
            if (Array.isArray(msgs) && msgs.length > 0) {
              // -rbauer- Backend-authored English text, no translation key exists
              // for it -- stored and shown as-is (FieldError also accepts
              // a plain string for this exact situation).
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
      // -rbauer- fetch() itself threw -- the request never reached the backend
      // (unreachable host, untrusted TLS certificate, etc.), as opposed to
      // the backend answering with an error status code.
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
      {/* -rbauer- errorText() turns the stored FieldError into real text, in the
          CURRENT language, every time this component re-renders. */}
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
