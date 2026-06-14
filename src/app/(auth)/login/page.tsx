"use client"

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Plane, Mail, ArrowRight } from "lucide-react"
import { Suspense, useState } from "react"

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"
  const error = searchParams.get("error")

  const [demoName, setDemoName] = useState("")
  const [demoEmail, setDemoEmail] = useState("")
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoError, setDemoError] = useState("")

  async function handleDemoLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!demoName.trim() || !demoEmail.trim()) {
      setDemoError("Please enter your name and email")
      return
    }
    setDemoLoading(true)
    setDemoError("")

    const res = await signIn("demo-login", {
      name: demoName.trim(),
      email: demoEmail.trim().toLowerCase(),
      callbackUrl,
      redirect: true,
    })

    if (res?.error) {
      setDemoError("Sign in failed. Check your email format.")
      setDemoLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(255,107,53,0.06)_0%,transparent_50%),radial-gradient(ellipse_at_70%_70%,rgba(0,201,167,0.04)_0%,transparent_50%)]" />

      <div className="relative w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-accent flex items-center justify-center">
            <Plane size={20} className="text-white -rotate-45" />
          </div>
          <span className="text-2xl font-bold text-text-primary">TripSync</span>
        </div>

        {/* Card */}
        <div className="bg-bg-surface border border-border-strong rounded-[var(--radius-xl)] p-8 shadow-lg">
          <h1 className="text-xl font-semibold text-text-primary text-center mb-2">
            Welcome to TripSync
          </h1>
          <p className="text-sm text-text-secondary text-center mb-8">
            Enter your name and email to get started
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-error-soft border border-error/20 rounded-[var(--radius-md)]">
              <p className="text-sm text-error">
                {error === "CredentialsSignin"
                  ? "Invalid credentials. Please check your name and email."
                  : `An error occurred (${error}). Please try again.`}
              </p>
            </div>
          )}

          {/* Email Login */}
          <form onSubmit={handleDemoLogin} className="space-y-3">
            <input
              type="text"
              value={demoName}
              onChange={(e) => setDemoName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2.5 bg-bg-base border border-border-default rounded-[var(--radius-md)] text-text-primary text-sm placeholder:text-text-tertiary focus:border-accent/50 focus:ring-2 focus:ring-accent/10 outline-none transition-all"
              required
            />
            <input
              type="email"
              value={demoEmail}
              onChange={(e) => setDemoEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 bg-bg-base border border-border-default rounded-[var(--radius-md)] text-text-primary text-sm placeholder:text-text-tertiary focus:border-accent/50 focus:ring-2 focus:ring-accent/10 outline-none transition-all"
              required
            />
            {demoError && (
              <p className="text-xs text-error">{demoError}</p>
            )}
            <button
              type="submit"
              disabled={demoLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent rounded-[var(--radius-md)] text-sm font-semibold text-white hover:bg-accent-hover hover:shadow-accent active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              <Mail size={16} />
              {demoLoading ? "Signing in..." : "Sign in"}
              {!demoLoading && <ArrowRight size={14} />}
            </button>
          </form>
        </div>

        <p className="text-xs text-text-tertiary text-center mt-6">
          No password needed. Just enter your name and email.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-base" />}>
      <LoginForm />
    </Suspense>
  )
}
