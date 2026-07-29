"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./RegisterCard.module.css";
import { apiUrl, readApiError } from "@/app/lib/api";
import { useTranslation } from "@/app/lib/i18n/useTranslation";
import { errorText, type FieldError } from "@/app/lib/i18n/fieldError";

// -rbauer- These two regexes exist ONLY on the frontend to give instant feedback
// (no network round-trip needed). The backend re-checks everything with the
// exact same rules (see backend/src/users/dto/register-user.dto.ts) --
// client-side validation is a UX nicety, never a security boundary, so the
// backend must never trust it and always re-validate on its own.
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9.-]+$/;

// ----------------------------------------------------------------------------
// -rbauer- Checks the form BEFORE we ever call the backend, and returns a map of
// "field name" -> FieldError (see app/lib/i18n/fieldError.ts) for every
// problem found. An empty object means the form is valid.
//
// Why this matters for translations specifically: this function returns
// translation KEYS (e.g. { key: "register.errors.usernameTooShort" }), never
// already-translated text. That's what lets the error message shown on
// screen automatically follow the language switcher -- see fieldError.ts
// for the full explanation of why storing resolved text would be a bug.
//
// It's a plain function (not a React hook) because it no longer needs
// useTranslation()/t() at all -- returning keys instead of text means it
// doesn't depend on the current language, so it doesn't need any React
// hook and can run outside of a component if ever needed (e.g. in a test).
// ----------------------------------------------------------------------------
function validate(form: { username: string; email: string; password: string; age: string }): Record<string, FieldError> {
  const newErrors: Record<string, FieldError> = {};

  const username = form.username.trim();
  const email = form.email.trim();
  const password = form.password;
  const age = form.age.trim();

  // -rbauer- --- username: two independent rules, checked in order -----------------
  // We use `else if` (not two separate `if`s) on purpose: showing two error
  // messages stacked under the same field at once would be confusing, so we
  // only ever report the FIRST problem found. Length is checked before
  // character set because "too short" is the more fundamental issue.
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
    // -rbauer- The regex above already rejects most malformed addresses, but it
    // doesn't check the length of each half of the address on its own
    // (before/after the "@"). The backend enforces these limits too, so we
    // mirror them here to catch the mistake before submitting.
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
  // -rbauerMod2- The backend enforces the exact same range (see
  // backend/src/users/dto/register-user.dto.ts) -- this is purely instant
  // feedback, never the real security boundary.
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
  // -rbauer- `t` translates a key to text in the CURRENTLY selected language, and
  // re-computes automatically on every render (including the render caused
  // by the user switching languages -- see LanguageContext.tsx).
  const { t } = useTranslation();

  // -rbauer- The 3 form fields, as plain controlled inputs: React state is the
  // single source of truth for what's currently typed, and every
  // <input onChange=...> below writes back into it.
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    age: "",
  });

  // -rbauer- One FieldError per field that currently has a problem ("username",
  // "email", "password", or "general" for errors that don't belong to one
  // specific field). Stored as FieldError (translation keys), NOT as
  // already-translated text -- see app/lib/i18n/fieldError.ts for why.
  const [errors, setErrors] = useState<Record<string, FieldError>>({});

  // -rbauer- True while we're waiting for the backend's response to the register
  // request. Used to disable the submit button (avoids double-submits) and
  // to show "Signing up..." instead of "Sign Up".
  const [loading, setLoading] = useState(false);

  // -rbauer- Runs when the form is submitted (Enter key, or clicking the button).
  async function handlesSubmit(e: React.FormEvent<HTMLFormElement>) {
    // -rbauer- Stops the browser's default behaviour, which would be to reload the
    // whole page and send the form the old-fashioned HTML way -- we want to
    // handle it ourselves with fetch() instead, without a page reload.
    e.preventDefault();

    if (loading) return; // -rbauer- ignore a second click while a request is in flight

    // -rbauer- Step 1: check the form ourselves first. If anything's wrong, show the
    // errors immediately and stop here -- no network request at all. This
    // is exactly the fix for the bug where a bad username only showed up
    // once email/password were already valid: now ALL client-checkable
    // problems (username length AND characters, email, password) are
    // caught and shown together, on the very first attempt.
    const validationErrors = validate(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // -rbauer- Step 2: the form looks valid on our side, actually ask the backend
    // to create the account.
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
          // -rbauerMod2- validate() already guaranteed this is a whole
          // number between 0 and 150 before we ever got here -- Number()
          // just converts the text from the input into the actual number
          // the backend expects.
          age: Number(form.age.trim()),
        }),
      });

      if (res.ok) {
        // -rbauer- Account created: send the user to the login page.
        router.push("/login");
        router.refresh();
        return;
      }

      // -rbauer- The backend refused the request (400, 409...). Turn its response
      // into a typed ApiErrorResponse (see app/lib/api.ts) and figure out
      // what to show, based on the stable `code` the backend sends --
      // never based on `err.message`, which is free English text we can't
      // translate (see the VALIDATION_ERROR branch below for the one place
      // this rule still has an exception, and why).
      const err = await readApiError(res);
      const fieldErrors: Record<string, FieldError> = {};

      if (err.code === "VALIDATION_ERROR") {
        // -rbauer- The backend re-ran its own validation (the DTO's decorators) and
        // found a problem our client-side `validate()` above didn't catch
        // -- for example a rule we don't mirror on the frontend. Its
        // response shape is { fields: { <fieldName>: ["message", ...] } }.
        const fields = err.details?.fields;

        if (fields && typeof fields === "object") {
          for (const [field, msgs] of Object.entries(fields)) {
            if (Array.isArray(msgs) && msgs.length > 0) {
              // -rbauer- This text was written by the backend (English, hardcoded
              // in the DTO's decorators), not by us -- we have no
              // translation key for it. FieldError also accepts a plain
              // string for exactly this case: it's displayed as-is,
              // untranslated. This is a known, accepted limitation (see
              // ERRORS_LIST): fully fixing it would require the backend
              // to send a stable error code per field instead of English
              // text, which is a backend change outside this module.
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
            // -rbauer- `vars: { field }` fills in the "{{field}}" placeholder inside
            // the "register.errors.alreadyTaken" dictionary entry -- see
            // interpolate() in useTranslation.ts.
            fieldErrors[String(field)] = { key: "register.errors.alreadyTaken", vars: { field: String(field) } };
          }
        } else {
          fieldErrors.general = { key: "register.errors.alreadyExists" };
        }
      } else if (err.code === "CONFLICT") {
        fieldErrors.general = { key: "register.errors.alreadyExists" };
      } else {
        // -rbauer- Unknown/unexpected error code: show a generic message rather
        // than nothing, or the raw code.
        fieldErrors.general = { key: "register.errors.generic" };
      }

      setErrors(fieldErrors);
    } catch (error) {
      // -rbauer- fetch() itself threw: the request never reached the backend at all
      // (wrong URL, TLS certificate not trusted, backend down...). This is
      // different from the backend answering with an error status code.
      console.error("Register error:", error);
      setErrors({
        general: { key: "register.errors.network" },
      });
    } finally {
      // -rbauer- Runs whether we succeeded, failed, or threw -- always re-enable
      // the submit button at the end.
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
      {/* -rbauer- errorText() turns the stored FieldError into real text, in the
          CURRENT language, every time this component re-renders. */}
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
      {/* -rbauerMod2- type="text" (not "number") on purpose: a native
          number input silently swallows non-numeric keystrokes before React
          ever sees them, so typing "abc" leaves the field empty and wrongly
          reports "required" instead of "invalid". Using text +
          inputMode="numeric" still shows a numeric keyboard on mobile, but
          lets OUR validate() function below see and reject whatever was
          actually typed. */}
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
