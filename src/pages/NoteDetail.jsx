import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import supabase from "../supabaseClient"
import Navbar from "../components/Navbar"

export default function NoteDetail() {
  const { id } = useParams()

  const navigate = useNavigate()

  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showImage, setShowImage] = useState(false)

  useEffect(() => {
    if (id) {
      fetchNote()
    }
  }, [id])

  async function fetchNote() {
    setLoading(true)

    const { data, error } = await supabase
      .from("notes")
      .select(`
        *,
        note_tags (
          tag_id,
          tags (id, name, color)
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      setError(error.message)
    } else {
      setNote(data)
    }

    setLoading(false)
  }

  async function archiveNote() {
    if (!note) return

    await supabase
      .from("notes")
      .update({
        archived: !note.archived,
      })
      .eq("id", note.id)

    navigate("/dashboard")
  }

  async function deleteNote() {
    if (!confirm("Delete this note permanently?")) return

    if (note.image_url) {
      const path = note.image_url.split("/notes-files/")[1]

      await supabase.storage
        .from("notes-files")
        .remove([path])
    }

    await supabase
      .from("notes")
      .delete()
      .eq("id", note.id)

    navigate("/dashboard")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <Navbar />

        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-xl text-slate-400">
            Loading note...
          </div>
        </div>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <Navbar />

        <div className="flex h-[80vh] items-center justify-center">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">

            <p className="text-xl text-slate-300">
              {error || "Note not found"}
            </p>

            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-black"
            >
              Back To Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const noteTags =
    note.note_tags
      ?.map((nt) => nt.tags)
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
    <div className="min-h-screen bg-[#020617] text-white">

      {/* Background Glow */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute left-1/3 top-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">

        {/* HEADER */}
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">

            {/* LEFT */}
            <div className="max-w-4xl">

              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                Note Detail
              </p>

              <h1 className="mt-5 text-5xl font-black leading-tight text-white">
                {note.title || "Untitled"}
              </h1>

              <div className="mt-6 flex flex-wrap gap-3">

                {noteTags.map((tag) => (
                  <span
                    key={tag.id}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                      TAG_STYLES[tag.color] || TAG_STYLES.cyan
                    }`}
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-400">

                <div>
                  Created:
                  <span className="ml-2 text-slate-200">
                    {new Date(note.created_at).toLocaleString()}
                  </span>
                </div>

                {note.updated_at && (
                  <div>
                    Updated:
                    <span className="ml-2 text-slate-200">
                      {new Date(note.updated_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap gap-3">

              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-2xl bg-white/5 px-5 py-3 text-slate-300 transition hover:bg-white/10"
              >
                Back
              </button>

              <button
                onClick={archiveNote}
                className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-black"
              >
                {note.archived ? "Restore" : "Archive"}
              </button>

              <button
                onClick={deleteNote}
                className="rounded-2xl bg-red-500/15 px-5 py-3 font-semibold text-red-300 transition hover:bg-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* IMAGE */}
        {note.image_url && (
          <div className="mt-8 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5">

            <img
              src={note.image_url}
              alt="note"
              onClick={() => setShowImage(true)}
              className="max-h-[600px] w-full cursor-pointer object-cover transition duration-500 hover:scale-[1.02]"
            />
          </div>
        )}

        {/* CONTENT */}
        <section className="mt-8 rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">

          <div className="prose prose-invert max-w-none">

            <div className="whitespace-pre-wrap break-words text-[1.1rem] leading-9 text-slate-200">
              {note.content || "No content available."}
            </div>

          </div>
        </section>
      </main>

      {/* IMAGE MODAL */}
      {showImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-5"
          onClick={() => setShowImage(false)}
        >

          <img
            src={note.image_url}
            alt="note"
            className="max-h-[92vh] max-w-[92vw] rounded-3xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  )
}