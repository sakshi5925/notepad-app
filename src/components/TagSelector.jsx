import { useState } from "react"
import supabase from "../supabaseClient"
import { Plus, Check } from "lucide-react"

const TAG_COLORS = [
  "cyan",
  "emerald",
  "violet",
  "rose",
  "amber",
  "blue",
]

const TAG_STYLES = {
  cyan: "bg-cyan-500/15 border-cyan-400/30 text-cyan-300",
  emerald: "bg-emerald-500/15 border-emerald-400/30 text-emerald-300",
  violet: "bg-violet-500/15 border-violet-400/30 text-violet-300",
  rose: "bg-rose-500/15 border-rose-400/30 text-rose-300",
  amber: "bg-amber-500/15 border-amber-400/30 text-amber-300",
  blue: "bg-blue-500/15 border-blue-400/30 text-blue-300",
}

export default function TagSelector({
  tags,
  selectedTags,
  onTagsChange,
  userId,
  onTagsUpdate,
}) {
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("cyan")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creatingTag, setCreatingTag] = useState(false)

  const handleTagToggle = (tagId) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter((id) => id !== tagId))
    } else {
      onTagsChange([...selectedTags, tagId])
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    setCreatingTag(true)

    const { error } = await supabase
      .from("tags")
      .insert([
        {
          user_id: userId,
          name: newTagName.trim(),
          color: newTagColor,
        },
      ])

    if (!error) {
      setNewTagName("")
      setNewTagColor("cyan")
      setShowCreateForm(false)
      onTagsUpdate()
    } else {
      alert(error.message)
    }

    setCreatingTag(false)
  }

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200">
          Tags
        </label>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10"
        >
          <Plus size={16} />
          New Tag
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => {
          const selected = selectedTags.includes(tag.id)

          return (
            <button
              key={tag.id}
              onClick={() => handleTagToggle(tag.id)}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                selected
                  ? TAG_STYLES[tag.color]
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <span>#{tag.name}</span>

              {selected && <Check size={14} />}
            </button>
          )
        })}
      </div>

      {/* Create Tag Form */}
      {showCreateForm && (
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg">

          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Enter tag name..."
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
          />

          {/* Color Picker */}
          <div className="flex flex-wrap gap-3">
            {TAG_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setNewTagColor(color)}
                className={`h-10 w-10 rounded-full border-2 transition hover:scale-110 ${
                  newTagColor === color
                    ? "border-white scale-110"
                    : "border-transparent"
                } ${
                  color === "cyan"
                    ? "bg-cyan-400"
                    : color === "emerald"
                    ? "bg-emerald-400"
                    : color === "violet"
                    ? "bg-violet-400"
                    : color === "rose"
                    ? "bg-rose-400"
                    : color === "amber"
                    ? "bg-amber-400"
                    : "bg-blue-400"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleCreateTag}
            disabled={creatingTag || !newTagName.trim()}
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 font-semibold text-black transition hover:scale-[1.02] disabled:opacity-50"
          >
            {creatingTag ? "Creating..." : "Create Tag"}
          </button>
        </div>
      )}
    </div>
  )
}