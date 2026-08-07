"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./RegisterCard.module.css";
import { apiUrl, readApiError } from "@/app/lib/api";
import { useTranslation } from "@/app/lib/i18n/useTranslation";
import { errorText, type FieldError } from "@/app/lib/i18n/fieldError";

// -rbauer- Frontend-only, for instant feedback without a round-trip. The backend
// re-checks the same rules (register-user.dto.ts): client-side validation is
// UX, never a security boundary.
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9.-]+$/;

// ----------------------------------------------------------------------------
// -rbauer- Checks the form before calling the backend. Returns "field" ->
// FieldError for each problem; an empty object means valid.
//
// It returns translation KEYS, never resolved text, so displayed errors follow
// the language switcher (see fieldError.ts). Being language-independent, it can
// stay a plain function rather than a hook.
// ----------------------------------------------------------------------------
function validate(form: { username: string; email: string; password: string; age: string }): Record<string, FieldError> {
  const newErrors: Record<string, FieldError> = {};

  const username = form.username.trim();
  const email = form.email.trim();
  const password = form.password;
  const age = form.age.trim();

  // -rbauer- --- username: two rules, checked in order ---------------------------
  // `else if` so only the first problem is reported: stacking two messages under
  // one field is confusing. Length comes first as the more basic issue.
  if (username.length < 3) {
    newErrors.username = { key: "register.errors.usernameTooShort" };
  } else if (!USERNAME_REGEX.test(username)) {
    newErrors.username = { key: "register.errors.usernameInvalidChars" };
  }

  // -rbauer- --- email: required, then format, then length ------------------------
  if (!email) {
    newErrors.email = { key: "register.errors.emailRequired" };
  } else if (email.length > 254) {
    newErrors.email = { key: "register.errors.emailTooLong" };
  } else if (!EMAIL_REGEX.test(email)) {
    newErrors.email = { key: "register.errors.emailInvalid" };
  } else {
    // -rbauer- The regex does not check the length of each half of the address
    // (before/after the "@"). Mirrors the backend's limits.
    const parts = email.split("@");

    if (parts.length !== 2 || parts[0].length > 64 || parts[1].length > 189) {
      newErrors.email = { key: "register.errors.emailInvalid" };
    }
  }

  // -rbauer- --- password: just a minimum length for this project ------------------
  if (password.length < 8) {
    newErrors.password = { key: "register.errors.passwordTooShort" };
  }

  // --- age: required, whole number, 0 to 150 inclusive --------------------
  // -rbauerMod2- Same range as the backend (register-user.dto.ts); instant
  // feedback only.
  if (!age) {
    newErrors.age = { key: "register.errors.ageRequired" };
  } else {
    const ageNumber = Number(age);
    if (!Number.isInteger(ageNumber) || ageNumber < 0 || ageNumber > 150) {
      newErrors.age = { key: "register.errors.ageInvalid" };
    }
  }

  return newErrors;
}

const RegisterCard = () => {
  const router = useRouter();
  // -rbauer- `t` resolves a key in the current language and re-runs on every
  // render, including the one caused by switching languages.
  const { t } = useTranslation();

  // -rbauer- Controlled inputs: this state is the single source of truth for
  // what is typed, written back by each <input onChange=...> below.
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    age: "",
  });

  // -rbauer- One FieldError per faulty field ("username", "email", "password",
  // or "general"). Stored as translation keys, not resolved text (fieldError.ts).
  const [errors, setErrors] = useState<Record<string, FieldError>>({});

  // -rbauer- True while the register request is in flight: disables the submit
  // button (no double-submit) and switches its label.
  const [loading, setLoading] = useState(false);

  // -rbauer- Runs on submit (Enter key or button click).
  async function handlesSubmit(e: React.FormEvent<HTMLFormElement>) {
    // -rbauer- Prevents the browser's default full-page-reload submission; we
    // send the request ourselves with fetch().
    e.preventDefault();

    if (loading) return; // -rbauer- ignore a second click while a request is in flight

    // -rbauer- Step 1: validate locally and stop before any network request.
    // Every client-checkable problem is reported at once, on the first attempt.
    const validationErrors = validate(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // -rbauer- Step 2: valid on our side, ask the backend to create the account.
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch(apiUrl("/users"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          // -rbauerMod2- validate() already guaranteed a whole number in
          // [0, 150]; Number() just converts the input text.
          age: Number(form.age.trim()),
        }),
      });

      if (res.ok) {
        // -rbauer- Account created: send the user to the login page.
        router.push("/login");
        router.refresh();
        return;
      }

      // -rbauer- The backend refused (400, 409...). readApiError gives a typed
      // ApiErrorResponse; we branch on the stable `code`, never on `err.message`
      // (untranslatable English text) -- see the VALIDATION_ERROR exception below.
      const err = await readApiError(res);
      const fieldErrors: Record<string, FieldError> = {};

      if (err.code === "VALIDATION_ERROR") {
        // -rbauer- The DTO decorators caught a rule `validate()` does not mirror.
        // Response shape: { fields: { <fieldName>: ["message", ...] } }.
        const fields = err.details?.fields;

        if (fields && typeof fields === "object") {
          for (const [field, msgs] of Object.entries(fields)) {
            if (Array.isArray(msgs) && msgs.length > 0) {
              // -rbauer- Backend-authored English with no translation key.
              // FieldError accepts a plain string for this case and shows it
              // as-is. Known limitation (see ERRORS_LIST): fixing it needs the
              // backend to send a per-field error code.
              fieldErrors[field] = String(msgs[0]);
            }
          }
        } else {
          fieldErrors.general = { key: "register.errors.validationFailed" };
        }
      } else if (err.code === "UNIQUE_CONSTRAINT") {
        // -rbauer- Username or email already taken.
        const fields = err.details?.fields;

        if (Array.isArray(fields)) {
          for (const field of fields) {
            // -rbauer- `vars: { field }` fills the "{{field}}" placeholder in the
            // dictionary entry -- see interpolate() in useTranslation.ts.
            fieldErrors[String(field)] = { key: "register.errors.alreadyTaken", vars: { field: String(field) } };
          }
        } else {
          fieldErrors.general = { key: "register.errors.alreadyExists" };
        }
      } else if (err.code === "CONFLICT") {
        fieldErrors.general = { key: "register.errors.alreadyExists" };
      } else {
        // -rbauer- Unknown code: show a generic message rather than the raw code.
        fieldErrors.general = { key: "register.errors.generic" };
      }

      setErrors(fieldErrors);
    } catch (error) {
      // -rbauer- fetch() threw: the request never reached the backend (wrong URL,
      // untrusted TLS certificate, backend down) -- not an error status code.
      console.error("Register error:", error);
      setErrors({
        general: { key: "register.errors.network" },
      });
    } finally {
      // -rbauer- Runs on success, failure and throw: always re-enable the button.
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handlesSubmit} noValidate>
      <label htmlFor="username">{t("register.usernameLabel")}</label>
      <input
        type="text"
        id="username"
        placeholder={t("register.usernamePlaceholder")}
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      {/* -rbauer- errorText() resolves the stored FieldError into text in the
          current language, on every re-render. */}
      {errors.username && <p className={styles.error}>{errorText(errors.username, t)}</p>}

      <label htmlFor="email">{t("register.emailLabel")}</label>
      <input
        type="email"
        id="email"
        placeholder={t("register.emailPlaceholder")}
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      {errors.email && <p className={styles.error}>{errorText(errors.email, t)}</p>}

      <label htmlFor="password">{t("register.passwordLabel")}</label>
      <input
        type="password"
        id="password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      {errors.password && <p className={styles.error}>{errorText(errors.password, t)}</p>}

      <label htmlFor="age">{t("register.ageLabel")}</label>
      {/* -rbauerMod2- type="text", not "number": a native number input swallows
          non-numeric keystrokes before React sees them, so "abc" would report
          "required" instead of "invalid". inputMode="numeric" still gives a
          numeric keyboard on mobile while validate() sees what was typed. */}
      <input
        type="text"
        inputMode="numeric"
        id="age"
        placeholder={t("register.agePlaceholder")}
        value={form.age}
        onChange={(e) => setForm({ ...form, age: e.target.value })}
      />
      {errors.age && <p className={styles.error}>{errorText(errors.age, t)}</p>}

      {errors.general && <p className={styles.generalError}>{errorText(errors.general, t)}</p>}

      <button type="submit" disabled={loading}>
        {loading ? t("register.submitting") : t("register.submit")}
      </button>
    </form>
  );
};

export default RegisterCard;
