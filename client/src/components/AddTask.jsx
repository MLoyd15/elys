import { useState } from "react";
import { Icon } from "../icons.jsx";

export default function AddTask({ onAdd }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    try {
      await onAdd(title.trim());
      setTitle("");
      setAdding(false);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  if (!adding) {
    return (
      <button className="add-task-button" onClick={() => setAdding(true)}>
        <Icon name="plus" size={17} /> Add task
      </button>
    );
  }

  return (
    <form className="add-task-form" onSubmit={submit}>
      <input
        autoFocus
        maxLength={120}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Add a study goal…"
        aria-label="New task"
      />
      <button type="submit" disabled={saving}>{saving ? "…" : "Add"}</button>
      <button
        type="button"
        className="cancel-add"
        onClick={() => {
          setAdding(false);
          setError("");
        }}
      >
        ×
      </button>
      {error && <span className="task-form-error">{error}</span>}
    </form>
  );
}
