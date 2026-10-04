import { useRef, useState } from "react";
import { Icon } from "../icons.jsx";

const MAX = 120;

export default function AddTask({ onAdd }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  function close() {
    setAdding(false);
    setTitle("");
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    const clean = title.trim();
    if (!clean || saving) return;
    setSaving(true);
    setError("");
    try {
      await onAdd(clean);
      setTitle("");
      // stay open so several tasks can be added quickly
      inputRef.current?.focus();
    } catch (saveError) {
      setError(saveError.message || "Couldn't save that task. Please try again.");
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

  const nearLimit = title.length >= MAX - 20;

  return (
    <form
      className="add-task-form"
      onSubmit={submit}
      onKeyDown={(e) => e.key === "Escape" && close()}
    >
      <input
        ref={inputRef}
        autoFocus
        maxLength={MAX}
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (error) setError("");
        }}
        placeholder="e.g. Review 20 pharmacology questions"
        aria-label="New study goal"
        aria-invalid={!!error}
        disabled={saving}
      />
      <button type="submit" disabled={saving || !title.trim()}>
        {saving ? "Adding…" : "Add"}
      </button>
      <button
        type="button"
        className="cancel-add"
        onClick={close}
        aria-label="Cancel"
        title="Cancel (Esc)"
      >
        ×
      </button>

      <div className="task-form-meta">
        {error ? (
          <span className="task-form-error" role="alert">{error}</span>
        ) : (
          <span className="task-form-hint">Enter to add · Esc to close</span>
        )}
        {nearLimit && (
          <span className="task-form-count">{title.length}/{MAX}</span>
        )}
      </div>
    </form>
  );
}