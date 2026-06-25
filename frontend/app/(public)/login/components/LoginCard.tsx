'use client'
import React, { useState } from 'react'
import styles from './LoginCard.module.css'
import { useRouter } from 'next/navigation';


const LoginCard = () => {
const router = useRouter()

    const [form, setForm] = useState({
    email: '',
    password: '',
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    async function handlesSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setErrors({})
        
        try {
            const res = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                email: form.email.trim(),
                password: form.password,
                }),
            })
            if (res.ok) {
                const data = await res.json();
                
                console.log('Login successful:', data);
                router.push('/dashboard')
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

                  case 'UNAUTHORIZED':
                    fieldErrors.general = err.message || 'Invalid credentials'
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
        } catch (error) {
            console.error('Login error:', error)
            setErrors({ general: 'Network error. Please try again.' })
        } finally {
            setLoading(false)
        }
    }

  return (
    <form className={styles.form} onSubmit={handlesSubmit} noValidate>
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
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}

export default LoginCard