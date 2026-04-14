import { useNavigate } from "react-router-dom"
import supabase from "../supabaseClient"

export default function Navbar({ searchQuery, setSearchQuery }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-black/40 border-b border-slate-700">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">

        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse"></div>
          <h1 className="text-lg font-bold text-cyan-300 tracking-wide">
            Notepad Pro
          </h1>
        </div>

        {/* Search Bar */}
        {setSearchQuery && (
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-0 rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
          />
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex-shrink-0 rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition"
        >
          Logout
        </button>
      </div>
    </header>
  )
}