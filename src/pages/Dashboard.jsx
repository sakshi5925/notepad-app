import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import supabase from "../supabaseClient"
import Navbar from "../components/Navbar"
import NoteCard from "../components/NoteCard"
import TagSelector from "../components/TagSelector"
import { GoogleGenAI } from "@google/genai"
import ReactMarkdown from "react-markdown"

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
  const [aiQuery, setAiQuery] = useState("")
  const [aiTitle, setAiTitle] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [aiPoints, setAiPoints] = useState([])
  const [aiImagePrompt, setAiImagePrompt] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkUser()
 
  }, [])

  useEffect(() => {
    if (user) {
      fetchNotes(user.id)
    }

  }, [showArchived, user])

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

  async function generateAiNotes() {
    if (!aiQuery.trim()) return

    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!geminiKey) {
      alert("Please add VITE_GEMINI_API_KEY to your .env.local file.")
      return
    }

    setAiLoading(true)
    setAiResponse("")
    setAiPoints([])
    setAiImagePrompt("")
    setAiTitle("")

    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey })
      const modelName = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-mini"

      const prompt = `Search this topic and return a note-ready response for the user. Topic: "${aiQuery}". Respond only with valid JSON in this format: {"title": "...", "summary": "...", "bullets": ["..."], "image_prompt": "..."}.`

      const result = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      })
      const text = result.text || ""

      let parsed = { title: "", summary: text, bullets: [], image_prompt: "" }

      try {
        parsed = JSON.parse(text)
      } catch {
        // If the model doesn't return strict JSON, keep the raw text as summary.
      }

      setAiTitle(parsed.title || "")
      setAiResponse(parsed.summary || text)
      setAiPoints(Array.isArray(parsed.bullets) ? parsed.bullets : [])
      setAiImagePrompt(parsed.image_prompt || "")
    } catch (error) {
      alert(error.message)
    } finally {
      setAiLoading(false)
    }
  }

  function applyAiResultToForm() {
    if (!aiResponse) return

    if (aiTitle) {
      setTitle(aiTitle)
    }

    setContent((currentContent) => {
      if (!currentContent.trim()) return aiResponse
      return `${currentContent}\n\n${aiResponse}`
    })
  }

  async function sendChatMessage() {
    if (!chatInput.trim()) return

    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!geminiKey) {
      alert("Please add VITE_GEMINI_API_KEY to your .env.local file.")
      return
    }

    const newMessages = [...chatMessages, { role: 'user', content: chatInput }]
    setChatMessages(newMessages)
    setChatInput('')
    setChatLoading(true)

    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey })
      const modelName = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-mini"
      const chat = ai.chats.create({
        model: modelName,
        history: newMessages.slice(0, -1).map(m => ({
          role: m.role,
          parts: [{ text: m.content }],
        })),
      })

      const response = await chat.sendMessage({ message: chatInput })
      const text = response.text || ""

      setChatMessages([...newMessages, { role: 'assistant', content: text }])
    } catch (error) {
      alert(error.message)
    } finally {
      setChatLoading(false)
    }
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
  <div className="min-h-screen bg-[#020617] text-white">
    <Navbar
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    />

    <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">

      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">

          <div className="max-w-3xl">
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-cyan-300">
              AI Powered Notes
            </p>

            <h1 className="text-5xl font-black leading-tight text-white md:text-6xl">
              Organize your ideas beautifully
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              Create notes, research topics with AI, upload images,
              and keep everything organized in one modern workspace.
            </p>

            <div className="mt-8 flex gap-4">

              <button
                onClick={() => setShowArchived(false)}
                className={`rounded-2xl px-6 py-3 font-semibold transition ${
                  !showArchived
                    ? "bg-cyan-400 text-black"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                Active Notes
              </button>

              <button
                onClick={() => setShowArchived(true)}
                className={`rounded-2xl px-6 py-3 font-semibold transition ${
                  showArchived
                    ? "bg-cyan-400 text-black"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                Archived
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-slate-400">
                Total Notes
              </p>

              <h2 className="mt-3 text-5xl font-black text-white">
                {notes.length}
              </h2>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-slate-400">
                Tags
              </p>

              <h2 className="mt-3 text-5xl font-black text-white">
                {tags.length}
              </h2>
            </div>

          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">

        {/* LEFT SIDE */}
        <div className="space-y-6">

          {/* AI RESEARCH */}
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-3xl font-black text-white">
                  AI Research
                </h2>

                <p className="mt-2 text-slate-400">
                  Generate notes from any topic instantly.
                </p>
              </div>

              <div className="rounded-2xl bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
                Gemini AI
              </div>
            </div>

            <div className="mt-6 flex gap-3">

              <input
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Search topic..."
                className="flex-1 rounded-2xl border border-white/10 bg-slate-950/50 px-5 py-4 text-white outline-none focus:border-cyan-400"
              />

              <button
                onClick={generateAiNotes}
                disabled={aiLoading}
                className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 font-semibold text-black"
              >
                {aiLoading ? "Loading..." : "Generate"}
              </button>
            </div>

            {aiResponse && (
              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/50 p-6">

                {aiTitle && (
                  <h3 className="text-2xl font-bold text-cyan-300">
                    {aiTitle}
                  </h3>
                )}

                <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-300">
                  {aiResponse}
                </p>

                <button
                  onClick={applyAiResultToForm}
                  className="mt-6 rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-black"
                >
                  Add To Editor
                </button>
              </div>
            )}
          </div>

          {/* AI CHAT */}
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

            <h2 className="text-3xl font-black text-white">
              AI Chat
            </h2>

            <div className="mt-6 h-[420px] overflow-y-auto rounded-3xl bg-slate-950/50 p-5">

              {chatMessages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-500">
                  Start chatting with AI...
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-4 flex ${
                      msg.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-3xl px-5 py-3 leading-7 ${
                        msg.role === "user"
                          ? "bg-cyan-400 text-black"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {msg.role === "user" ? (
                        msg.content
                      ) : (
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 flex gap-3">

              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI..."
                className="flex-1 rounded-2xl border border-white/10 bg-slate-950/50 px-5 py-4 text-white outline-none focus:border-cyan-400"
              />

              <button
                onClick={sendChatMessage}
                className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 font-semibold text-black"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div>

          <div className="sticky top-28 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

            <h2 className="text-3xl font-black text-white">
              {editingNote ? "Edit Note" : "Create Note"}
            </h2>

            <div className="mt-6 space-y-5">

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-5 py-4 text-white outline-none focus:border-cyan-400"
              />

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note..."
                className="min-h-[240px] w-full rounded-3xl border border-white/10 bg-slate-950/50 p-5 text-white outline-none focus:border-cyan-400 resize-none"
              />

              <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-4 py-6 text-slate-400 hover:border-cyan-400 hover:text-white">

                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />

                {file ? file.name : "Upload image"}
              </label>

              <TagSelector
                tags={tags}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                userId={user?.id}
                onTagsUpdate={() => fetchTags(user?.id)}
              />

              <button
                onClick={addNote}
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-4 text-lg font-bold text-black"
              >
                {loading
                  ? "Saving..."
                  : editingNote
                  ? "Update Note"
                  : "Create Note"}
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* NOTES SECTION */}
      <section className="mt-10">

        <div className="mb-8 flex items-center justify-between">

          <div>
            <h2 className="text-4xl font-black text-white">
              {showArchived ? "Archived Notes" : "Your Notes"}
            </h2>

            <p className="mt-2 text-slate-400">
              Click any note to open full note.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-slate-300">
            {filteredNotes.length} Notes
          </div>
        </div>

        {filteredNotes.length === 0 ? (

          <div className="rounded-[2rem] border border-white/10 bg-white/5 py-24 text-center">

            <p className="text-2xl font-semibold text-slate-400">
              No notes found
            </p>

          </div>

        ) : (

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                tags={tags}
                onView={() => navigate(`/dashboard/note/${note.id}`)}
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