import { useNavigate } from "react-router-dom"
import supabase from "../supabaseClient"
import { Search, LogOut, NotebookPen } from "lucide-react"

export default function Navbar({ searchQuery, setSearchQuery }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/20">
            <NotebookPen size={22} className="text-black" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Notepad
            </h1>
            <p className="text-xs text-slate-400">
              Smart workspace
            </p>
          </div>
        </div>

        {/* Search */}
        {setSearchQuery && (
          <div className="relative hidden w-full max-w-xl md:block">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400 focus:bg-slate-900"
            />
          </div>
        )}

        {/* Right */}
        <div className="flex items-center gap-3">

          <button className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 md:block">
            Upgrade
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      {setSearchQuery && (
        <div className="px-6 pb-4 md:hidden">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none"
            />
          </div>
        </div>
      )}
    </header>
  )
}