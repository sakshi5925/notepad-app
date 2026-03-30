import { useState } from "react"
import { useNavigate } from "react-router-dom"
import supabase from "../supabaseClient"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
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
      alert("Signup successful! Check your email for confirmation.")
    } else {
      alert(error.message)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
      <section className="max-w-md w-full rounded-2xl border border-slate-700 bg-slate-900/90 p-8 shadow-2xl backdrop-blur">
        <h1 className="text-3xl font-bold text-cyan-300 mb-1">Welcome back</h1>
        <p className="text-sm text-slate-300 mb-6">Login or sign up to keep your notes synced.</p>

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

        <label className="block mb-4 text-sm text-slate-200">
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 p-2 text-sm text-white outline-none focus:border-cyan-300"
          />
        </label>

        <div className="flex gap-3">
          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="flex-1 rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Please wait..." : "Login"}
          </button>
          <button
            onClick={handleSignup}
            disabled={loading || !email || !password}
            className="flex-1 rounded-lg border border-cyan-500 bg-transparent px-4 py-2 font-semibold text-cyan-300 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Signup
          </button>
        </div>
      </section>
    </main>
  )
}
