import { useState } from "react"
import supabase from "../supabaseClient"

export default function NoteCard({
  note,
  tags,
  onView,
  onDelete,
  onArchive,
  onEdit,
  refresh,
  showArchived,
}) {
  const [copied, setCopied] = useState(false)
  const [loadingFav, setLoadingFav] = useState(false)

  async function toggleFavorite(e) {
    e.stopPropagation()

    setLoadingFav(true)

    await supabase
      .from("notes")
      .update({ favorite: !note.favorite })
      .eq("id", note.id)

    setLoadingFav(false)
    refresh()
  }

  function copyText(e) {
    e.stopPropagation()

    navigator.clipboard.writeText(note.content)

    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 1500)
  }

  function getTimeAgo(date) {
    const diff = Math.floor((new Date() - new Date(date)) / 1000)

    if (diff < 60) return "Just now"
    if (diff < 3600) return Math.floor(diff / 60) + " min ago"
    if (diff < 86400) return Math.floor(diff / 3600) + " hr ago"

    return Math.floor(diff / 86400) + " days ago"
  }

  // Tags
  const noteTags =
    note.note_tags
      ?.map((nt) => tags.find((t) => t.id === nt.tag_id))
      .filter(Boolean) || []

  const TAG_STYLES = {
    cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    violet: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    rose: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  }

  return (
    <div
      onClick={onView}
      className="group cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.07]"
    >

      {/* IMAGE */}
      {note.image_url && (
        <div className="relative h-52 overflow-hidden">

          <img
            src={note.image_url}
            alt="note"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
      )}

      {/* CONTENT */}
      <div className="p-5">

        {/* TOP */}
        <div className="flex items-start justify-between gap-3">

          <div className="flex-1">

            <h2 className="line-clamp-1 text-xl font-bold text-white">
              {note.title || "Untitled"}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {getTimeAgo(note.created_at)}
            </p>
          </div>

          {/* Favorite */}
          <button
            onClick={toggleFavorite}
            disabled={loadingFav}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${
              note.favorite
                ? "bg-red-500/20 text-red-400"
                : "bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            {loadingFav ? "..." : "❤"}
          </button>
        </div>

        {/* TAGS */}
        {noteTags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">

            {noteTags.map((tag) => (
              <span
                key={tag.id}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  TAG_STYLES[tag.color] || TAG_STYLES.cyan
                }`}
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* CONTENT PREVIEW */}
        <div className="mt-5">

          <p className="line-clamp-3 leading-7 text-slate-300">
            {note.content}
          </p>

          <button
            className="mt-4 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
          >
            View Full Note →
          </button>
        </div>

        {/* ACTIONS */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">

          <button
            onClick={(e) => {
              e.stopPropagation()
              copyText(e)
            }}
            className="rounded-xl bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            {copied ? "Copied" : "Copy"}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="rounded-xl bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            Edit
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onArchive()
            }}
            className="rounded-xl bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            {showArchived ? "Restore" : "Archive"}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/20"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}