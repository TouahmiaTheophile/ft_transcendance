'use client';
import { useRouter } from 'next/dist/client/components/navigation';
import React, { useState } from 'react'
import styles from './RegisterCard.module.css'

function validate(form: { username: string; email: string; password: string }) {
  const newErrors: Record<string, string> = {}

  const username = form.username.trim()
  const email = form.email.trim()
  const password = form.password

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  if (username.length < 3) newErrors.username = 'Username must be at least 3 characters'

  if (!email) {
    newErrors.email = 'Email is required'
  } else if (email.length > 254) {
    newErrors.email = 'Email is too long'
  } else if (!emailRegex.test(email)) {
    newErrors.email = 'Invalid email format'
  } else {
    const parts = email.split('@')
    if (parts.length !== 2 || parts[0].length > 64 || parts[1].length > 189) {
      newErrors.email = 'Invalid email format'
    }
  }

  if (password.length < 8) newErrors.password = 'Password must be at least 8 characters'

  return newErrors
}

const RegisterCard = () => {

  const router = useRouter()

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function handlesSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setLoading(true)
    setErrors({});

    try {
      const res = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        }),
      })
      if (res.ok) {
        const createdUser = await res.json();
        console.log('User created:', createdUser);
        router.push('/login')
      }
      else {
        const err = await res.json()
        const fieldErrors: Record<string, string> = {}

        switch (err.code) {

          case 'VALIDATION_ERROR':
            // details.fields is an object : { username: ["Too short"], email: ["Invalid"] }
            for (const [field, msgs] of Object.entries(err.details.fields)) {
              fieldErrors[field] = (msgs as string[])[0]
            }
            break

          case 'UNIQUE_CONSTRAINT':
            // details.fields is an array : ["username"]
            for (const field of err.details.fields) {
              fieldErrors[field as string] = `${field} already taken`
            }
            break

          case 'BAD_REQUEST':
            // details.reason is a string or undefined
            fieldErrors.general = err.details?.reason || err.message || 'Bad request'
            break

          default:
            // INTERNAL_ERROR, UNAUTHORIZED, or anything unknown
            fieldErrors.general = err.message || 'Something went wrong'
        }

        setErrors(fieldErrors)
        }
      } catch (err) {
        // network error — server unreachable, no internet, Docker not running etc
        setErrors({ general: 'Server unreachable, please try again later' })
      } finally {
        // always runs, whether success or error
        setLoading(false) 
      }
      }

  return (
    <form className={styles.form} onSubmit={handlesSubmit} noValidate>
      <label htmlFor="username">Username</label>
      <input
        type="text"
        id="username"
        placeholder="Choose your username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      {errors.username && <p className={styles.error}>{errors.username}</p>}

      <label htmlFor="email">Email</label>
      <input
        type="email"
        id="email"
        placeholder="your@email.com"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      {errors.email && <p className={styles.error}>{errors.email}</p>}

      <label htmlFor="password">Password</label>
      <input
        type="password"
        id="password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      {errors.password && <p className={styles.error}>{errors.password}</p>}

      {errors.general && <p className={styles.generalError}>{errors.general}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  )
}

export default RegisterCard