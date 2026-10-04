import { useRef, useState } from "react";
import { Icon } from "../icons.jsx";

const MAX = 120;

function localDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AddTask({ onAdd }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  function close() {
    setAdding(false);
    setTitle("");
    setDueDate("");
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    const clean = title.trim();
    if (!clean || saving) return;
    setSaving(true);
    setError("");
    try {
      await onAdd(clean, dueDate);
      setTitle("");
      setDueDate("");
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
      <div className="task-form-fields">
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
        <label className="task-deadline-field">
          <span>Deadline <small>(optional)</small></span>
          <input
            type="date"
            value={dueDate}
            min={localDateValue()}
            onChange={(event) => setDueDate(event.target.value)}
            aria-label="Task deadline"
            disabled={saving}
          />
        </label>
        <button type="submit" disabled={saving || !title.trim()}>
          {saving ? "Adding…" : "Add task"}
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
      </div>

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