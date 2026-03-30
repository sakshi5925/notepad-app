import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import supabase from "../supabaseClient"
import Navbar from "../components/Navbar"
import NoteCard from "../components/NoteCard"

export default function Dashboard() {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [file, setFile] = useState(null)
  const [editingNote, setEditingNote] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data } = await supabase.auth.getUser()
    if (!data?.user) navigate("/")
    else fetchNotes()
  }

  async function fetchNotes() {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return

    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("favorite", { ascending: false }) 
      .order("created_at", { ascending: false })

    setNotes(data || [])
  }

  async function addNote() {
    if (!title.trim() && !content.trim()) return

    setLoading(true)

    const user = (await supabase.auth.getUser()).data.user
    if (!user) return navigate("/")

    let image_url = editingNote?.image_url || null

    // 📸 Upload new image
    if (file) {
      const filePath = `public/${Date.now()}-${file.name}`

      const { error } = await supabase.storage
        .from("notes-files")
        .upload(filePath, file, { upsert: true })

      if (error) {
        alert(error.message)
        setLoading(false)
        return
      }

      // ❗ delete old image if editing
      if (editingNote?.image_url) {
        const oldPath = editingNote.image_url.split("/notes-files/")[1]

        await supabase.storage
          .from("notes-files")
          .remove([oldPath])
      }

      const { data: urlData } = supabase.storage
        .from("notes-files")
        .getPublicUrl(filePath)

      image_url = urlData.publicUrl
    }

    // ✏️ EDIT MODE
    if (editingNote) {
      await supabase
        .from("notes")
        .update({
          title,
          content,
          image_url,
        })
        .eq("id", editingNote.id)

      setEditingNote(null)
    }
    // ➕ CREATE MODE
    else {
      await supabase.from("notes").insert([
        {
          title,
          content,
          user_id: user.id,
          image_url,
        },
      ])
    }

    // reset
    setTitle("")
    setContent("")
    setFile(null)
    setLoading(false)

    fetchNotes()
  }


  async function deleteNote(note) {
    if (note.image_url) {
      const path = note.image_url.split("/notes-files/")[1]

      await supabase.storage
        .from("notes-files")
        .remove([path])
    }

    await supabase.from("notes").delete().eq("id", note.id)
    fetchNotes()
  }

  function startEdit(note) {
    setEditingNote(note)
    setTitle(note.title)
    setContent(note.content)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <Navbar />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">

  
        <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 shadow-xl">
          <h2 className="text-2xl font-bold text-cyan-200">
            {editingNote ? "Edit Note" : "Create Note"}
          </h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="rounded-lg border border-slate-600 bg-slate-800/80 p-2 text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
            />

            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="rounded-lg bg-slate-800 p-2"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content"
              className="md:col-span-2 h-28 rounded-lg border border-slate-600 bg-slate-800/80 p-2 text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
            />
          </div>

          <button
            onClick={addNote}
            disabled={loading}
            className="mt-4 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 px-5 py-2 font-semibold text-black hover:scale-105 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : editingNote ? "Update Note" : "Add Note"}
          </button>
        </section>

    
        <section>
          <h3 className="text-xl text-cyan-300 mb-3">
            Your notes ({notes.length})
          </h3>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={() => deleteNote(note)}
                onEdit={() => startEdit(note)}
                refresh={fetchNotes}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}