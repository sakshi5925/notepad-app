import { useState } from "react"
import supabase from "../supabaseClient"

const TAG_COLORS = ["cyan", "emerald", "violet", "rose", "amber", "blue"]

export default function TagSelector({ tags, selectedTags, onTagsChange, userId, onTagsUpdate }) {
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("cyan")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creatingTag, setCreatingTag] = useState(false)

  const handleTagToggle = (tagId) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId))
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
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-200">
        Tags (Optional)
      </label>

      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <button
            key={tag.id}
            onClick={() => handleTagToggle(tag.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              selectedTags.includes(tag.id)
                ? `bg-${tag.color}-500 text-black`
                : `bg-slate-700 text-slate-300 hover:bg-slate-600`
            }`}
          >
            #{tag.name}
            {selectedTags.includes(tag.id) && " ✓"}
          </button>
        ))}

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-3 py-1 rounded-full text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition"
        >
          + New Tag
        </button>
      </div>

      {/* Create Tag Form */}
      {showCreateForm && (
        <div className="rounded-lg border border-slate-600 bg-slate-800/50 p-3 space-y-3">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Tag name"
            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-2 text-sm text-white outline-none focus:border-cyan-400"
          />

          <div className="flex gap-2">
            <select
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800 p-2 text-sm text-white"
            >
              {TAG_COLORS.map(color => (
                <option key={color} value={color}>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </option>
              ))}
            </select>

            <button
              onClick={handleCreateTag}
              disabled={creatingTag || !newTagName.trim()}
              className="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-black hover:bg-cyan-400 disabled:opacity-50"
            >
              {creatingTag ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
