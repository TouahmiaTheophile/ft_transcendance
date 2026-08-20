"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./LoginCard.module.css";
import { apiUrl, readApiError } from "@/app/lib/api";
import { useTranslation } from "@/app/lib/i18n/useTranslation";
import { errorText, type FieldError } from "@/app/lib/i18n/fieldError";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function validate(form: { email: string; password: string }): Record<string, FieldError> {
  const newErrors: Record<string, FieldError> = {};
  const email = form.email.trim();

  if (!email) {
    newErrors.email = { key: "login.errors.emailRequired" };
  } else if (!EMAIL_REGEX.test(email)) {
    newErrors.email = { key: "login.errors.emailInvalid" };
  }

  if (!form.password) {
    newErrors.password = { key: "login.errors.passwordRequired" };
  }

  return newErrors;
}

const LoginCard = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, FieldError>>({});

  const [loading, setLoading] = useState(false);

  async function handlesSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

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
        router.push("/dashboard");
        router.refresh();
        return;
      }

      const err = await readApiError(res);
      const fieldErrors: Record<string, FieldError> = {};

      if (err.code === "VALIDATION_ERROR") {
        const fields = err.details?.fields;

        if (fields && typeof fields === "object") {
          for (const [field, msgs] of Object.entries(fields)) {
            if (Array.isArray(msgs) && msgs.length > 0) {
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
