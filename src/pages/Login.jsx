import { useState } from "react"
import { useNavigate } from "react-router-dom"
import supabase from "../supabaseClient"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)

    if (!error) {
      navigate("/dashboard")
    } else {
      alert(error.message)
    }
  }

  const handleSignup = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    setLoading(false)

    if (!error) {
      setShowConfirmation(true)
      setEmail("")
      setPassword("")
    } else {
      alert(error.message)
    }
  }

  // Show confirmation screen after signup
  if (showConfirmation) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
        <section className="max-w-md w-full rounded-2xl border border-slate-700 bg-slate-900/90 p-8 shadow-2xl backdrop-blur text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-400 mb-3">Account Created!</h1>
          <p className="text-slate-300 mb-6">
            A confirmation email has been sent to <span className="font-semibold text-cyan-300">{email}</span>
          </p>
          <p className="text-sm text-slate-400 mb-8">
            Please check your email and click the confirmation link to verify your account before logging in.
          </p>
          <button
            onClick={() => {
              setShowConfirmation(false)
              setIsSignup(false)
            }}
            className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Back to Login
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
      <section className="max-w-md w-full rounded-2xl border border-slate-700 bg-slate-900/90 p-8 shadow-2xl backdrop-blur">
        {isSignup ? (
          <>
            <h1 className="text-3xl font-bold text-cyan-300 mb-1">Create Account</h1>
            <p className="text-sm text-slate-300 mb-6">Sign up to start saving your notes.</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-cyan-300 mb-1">Welcome back</h1>
            <p className="text-sm text-slate-300 mb-6">Login to access your notes.</p>
          </>
        )}

        <label className="block mb-3 text-sm text-slate-200">
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 p-2 text-sm text-white outline-none focus:border-cyan-300"
          />
        </label>

        <label className="block mb-6 text-sm text-slate-200">
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 p-2 text-sm text-white outline-none focus:border-cyan-300"
          />
        </label>

        <button
          onClick={isSignup ? handleSignup : handleLogin}
          disabled={loading || !email || !password}
          className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 mb-4"
        >
          {loading ? "Please wait..." : isSignup ? "Create Account" : "Login"}
        </button>

        <div className="text-center">
          {isSignup ? (
            <p className="text-sm text-slate-300">
              Already have an account?{" "}
              <button
                onClick={() => setIsSignup(false)}
                className="text-cyan-300 hover:text-cyan-200 font-semibold"
              >
                Login here
              </button>
            </p>
          ) : (
            <p className="text-sm text-slate-300">
              Don't have an account?{" "}
              <button
                onClick={() => setIsSignup(true)}
                className="text-cyan-300 hover:text-cyan-200 font-semibold"
              >
                Create account
              </button>
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
