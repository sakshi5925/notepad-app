import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import supabase from "../supabaseClient"
import Navbar from "../components/Navbar"
import NoteCard from "../components/NoteCard"
import TagSelector from "../components/TagSelector"

export default function Dashboard() {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [file, setFile] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [editingNote, setEditingNote] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const [tags, setTags] = useState([])
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data } = await supabase.auth.getUser()
    if (!data?.user) {
      navigate("/")
    } else {
      setUser(data.user)
      fetchTags(data.user.id)
      fetchNotes(data.user.id)
    }
  }

  async function fetchTags(userId) {
    const { data } = await supabase
      .from("tags")
      .select("*")
      .eq("user_id", userId)
    setTags(data || [])
  }

  async function fetchNotes(userId) {
    const { data } = await supabase
      .from("notes")
      .select(`
        *,
        note_tags (
          tag_id,
          tags (id, name, color)
        )
      `)
      .eq("user_id", userId)
      .eq("archived", showArchived)
      .order("favorite", { ascending: false })
      .order("created_at", { ascending: false })

    setNotes(data || [])
  }

  async function addNote() {
    if (!title.trim() && !content.trim()) return

    setLoading(true)

    const currentUser = user || (await supabase.auth.getUser()).data.user
    if (!currentUser) return navigate("/")

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

      // Update tags
      await supabase
        .from("note_tags")
        .delete()
        .eq("note_id", editingNote.id)

      if (selectedTags.length > 0) {
        const tagInserts = selectedTags.map(tagId => ({
          note_id: editingNote.id,
          tag_id: tagId
        }))
        await supabase.from("note_tags").insert(tagInserts)
      }

      setEditingNote(null)
    }
    // ➕ CREATE MODE
    else {
      const { data: noteData, error } = await supabase
        .from("notes")
        .insert([
          {
            title,
            content,
            user_id: currentUser.id,
            image_url,
          },
        ])
        .select()

      if (!error && noteData?.[0]) {
        // Insert tags
        if (selectedTags.length > 0) {
          const tagInserts = selectedTags.map(tagId => ({
            note_id: noteData[0].id,
            tag_id: tagId
          }))
          await supabase.from("note_tags").insert(tagInserts)
        }
      }
    }

    // reset
    setTitle("")
    setContent("")
    setFile(null)
    setSelectedTags([])
    setLoading(false)

    fetchNotes(currentUser.id)
  }


  async function deleteNote(note) {
    if (!confirm("Delete this note permanently?")) return

    if (note.image_url) {
      const path = note.image_url.split("/notes-files/")[1]
      await supabase.storage
        .from("notes-files")
        .remove([path])
    }

    await supabase.from("notes").delete().eq("id", note.id)
    fetchNotes(user.id)
  }

  async function archiveNote(note) {
    await supabase
      .from("notes")
      .update({ archived: !note.archived })
      .eq("id", note.id)
    fetchNotes(user.id)
  }

  function startEdit(note) {
    setEditingNote(note)
    setTitle(note.title)
    setContent(note.content)
    setSelectedTags(note.note_tags?.map(nt => nt.tag_id) || [])
  }

  // Filter notes based on search
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">

        {/* Archive Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchived(false)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              !showArchived
                ? "bg-cyan-500 text-black"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Active Notes
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              showArchived
                ? "bg-cyan-500 text-black"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Archived
          </button>
        </div>

        {/* Create Note Section */}
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

            {/* Tag Selector */}
            <div className="md:col-span-2">
              <TagSelector
                tags={tags}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                userId={user?.id}
                onTagsUpdate={() => fetchTags(user?.id)}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={addNote}
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 px-5 py-2 font-semibold text-black hover:scale-105 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : editingNote ? "Update Note" : "Add Note"}
            </button>
            {editingNote && (
              <button
                onClick={() => {
                  setEditingNote(null)
                  setTitle("")
                  setContent("")
                  setFile(null)
                  setSelectedTags([])
                }}
                className="rounded-lg border border-slate-600 px-5 py-2 font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </section>

        {/* Notes Section */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl text-cyan-300">
              {showArchived ? "Archived Notes" : "Your Notes"} ({filteredNotes.length})
            </h3>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto text-slate-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-slate-400 text-lg">
                {searchQuery
                  ? "No notes match your search"
                  : showArchived
                  ? "No archived notes yet"
                  : "No notes yet. Create one to get started!"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  tags={tags}
                  onDelete={() => deleteNote(note)}
                  onArchive={() => archiveNote(note)}
                  onEdit={() => startEdit(note)}
                  refresh={() => fetchNotes(user?.id)}
                  showArchived={showArchived}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}