import { useState } from "react"
import supabase from "../supabaseClient"

export default function NoteCard({ note, tags, onDelete, onArchive, onEdit, refresh, showArchived }) {
  const [expanded, setExpanded] = useState(false)
  const [showImage, setShowImage] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loadingFav, setLoadingFav] = useState(false)

  function handleDelete() {
    onDelete()
  }

  function copyText() {
    navigator.clipboard.writeText(note.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function toggleFavorite() {
    setLoadingFav(true)

    await supabase
      .from("notes")
      .update({ favorite: !note.favorite })
      .eq("id", note.id)

    setLoadingFav(false)
    refresh()
  }

  function getTimeAgo(date) {
    const diff = Math.floor((new Date() - new Date(date)) / 1000)
    if (diff < 60) return "just now"
    if (diff < 3600) return Math.floor(diff / 60) + " min ago"
    if (diff < 86400) return Math.floor(diff / 3600) + " hr ago"
    return Math.floor(diff / 86400) + " days ago"
  }

  // Get tag names for this note
  const noteTags = note.note_tags?.map(nt => {
    const tag = tags.find(t => t.id === nt.tag_id)
    return tag
  }).filter(Boolean) || []

  return (
    <>
      <div className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-4 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/20">

        {/* Glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 blur-xl"></div>

        <div className="relative z-10">

          {/* Top Row */}
          <div className="flex justify-between items-start gap-2">

            <h2 className="text-lg font-semibold text-cyan-300 flex-1">
              {note.title || "Untitled"}
            </h2>

            <button
              onClick={toggleFavorite}
              disabled={loadingFav}
              className={`text-lg transition flex-shrink-0 ${
                note.favorite ? "text-red-400" : "text-slate-500"
              }`}
            >
              {loadingFav ? "..." : "❤️"}
            </button>
          </div>

          {/* Tags */}
          {noteTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {noteTags.map(tag => (
                <span
                  key={tag.id}
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-${tag.color}-500/20 text-${tag.color}-300 border border-${tag.color}-500/30`}
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          <p className={`mt-2 text-sm text-slate-300 whitespace-pre-wrap break-words ${expanded ? "" : "line-clamp-3"}`}>
            {note.content}
          </p>

          {note.content?.length > 100 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-cyan-400 text-xs mt-1 hover:underline"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}

          {note.image_url && (
            <div className="mt-3 rounded-lg overflow-hidden border border-slate-700 bg-black">
              <img
                src={note.image_url}
                alt="note"
                onClick={() => setShowImage(true)}
                className="w-full max-h-60 object-contain cursor-pointer hover:opacity-80 transition"
              />
            </div>
          )}

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>{getTimeAgo(note.created_at)}</span>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
              <button onClick={copyText} title="Copy content" className="hover:text-green-400">
                📋
              </button>

              <button onClick={onEdit} title="Edit note" className="hover:text-yellow-400">
                ✏️
              </button>

              {showArchived ? (
                <button onClick={onArchive} title="Restore from archive" className="hover:text-blue-400">
                  ↩️
                </button>
              ) : (
                <button onClick={onArchive} title="Archive note" className="hover:text-orange-400">
                  📦
                </button>
              )}

              <button onClick={handleDelete} title="Delete permanently" className="hover:text-red-400">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      {showImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setShowImage(false)}
        >
          <img
            src={note.image_url}
            className="max-h-[90%] max-w-[90%] rounded-xl shadow-2xl"
          />
        </div>
      )}
    </>
  )
}