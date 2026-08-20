"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./RegisterCard.module.css";
import { apiUrl, readApiError } from "@/app/lib/api";
import { useTranslation } from "@/app/lib/i18n/useTranslation";
import { errorText, type FieldError } from "@/app/lib/i18n/fieldError";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9.-]+$/;

function validate(form: { username: string; email: string; password: string; age: string }): Record<string, FieldError> {
  const newErrors: Record<string, FieldError> = {};

  const username = form.username.trim();
  const email = form.email.trim();
  const password = form.password;
  const age = form.age.trim();

  if (username.length < 3) {
    newErrors.username = { key: "register.errors.usernameTooShort" };
  } else if (!USERNAME_REGEX.test(username)) {
    newErrors.username = { key: "register.errors.usernameInvalidChars" };
  }

  if (!email) {
    newErrors.email = { key: "register.errors.emailRequired" };
  } else if (email.length > 254) {
    newErrors.email = { key: "register.errors.emailTooLong" };
  } else if (!EMAIL_REGEX.test(email)) {
    newErrors.email = { key: "register.errors.emailInvalid" };
  } else {
    const parts = email.split("@");

    if (parts.length !== 2 || parts[0].length > 64 || parts[1].length > 189) {
      newErrors.email = { key: "register.errors.emailInvalid" };
    }
  }

  if (password.length < 8) {
    newErrors.password = { key: "register.errors.passwordTooShort" };
  }

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
  const { t } = useTranslation();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    age: "",
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
          age: Number(form.age.trim()),
        }),
      });

      if (res.ok) {
        router.push("/login");
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
          fieldErrors.general = { key: "register.errors.validationFailed" };
        }
      } else if (err.code === "UNIQUE_CONSTRAINT") {
        const fields = err.details?.fields;

        if (Array.isArray(fields)) {
          for (const field of fields) {
            fieldErrors[String(field)] = { key: "register.errors.alreadyTaken", vars: { field: String(field) } };
          }
        } else {
          fieldErrors.general = { key: "register.errors.alreadyExists" };
        }
      } else if (err.code === "CONFLICT") {
        fieldErrors.general = { key: "register.errors.alreadyExists" };
      } else {
        fieldErrors.general = { key: "register.errors.generic" };
      }

      setErrors(fieldErrors);
    } catch (error) {
      console.error("Register error:", error);
      setErrors({
        general: { key: "register.errors.network" },
      });
    } finally {
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
