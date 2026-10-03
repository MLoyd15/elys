import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Icon } from "../icons.jsx";

export default function Notepad({ active }) {
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const selectedNote = notes.find((note) => note.id === selectedNoteId);
  const hasUnsavedChanges = Boolean(
    selectedNote && (title !== selectedNote.title || content !== selectedNote.content),
  );

  useEffect(() => {
    if (!active || loaded) return;
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    api("/notes")
      .then((loadedNotes) => {
        if (cancelled) return;
        setNotes(loadedNotes);
        setSelectedNoteId(loadedNotes[0]?.id || "");
        setTitle(loadedNotes[0]?.title || "");
        setContent(loadedNotes[0]?.content || "");
        setLoaded(true);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [active, loaded, reloadToken]);

  async function createNote() {
    if (hasUnsavedChanges && !window.confirm("Discard your unsaved changes and create a new note?")) return;
    setCreating(true);
    setSaveError("");
    try {
      const note = await api("/notes", { method: "POST", body: JSON.stringify({}) });
      setNotes((current) => [note, ...current]);
      setSelectedNoteId(note.id);
      setTitle(note.title);
      setContent(note.content);
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setCreating(false);
    }
  }

  function selectNote(note) {
    if (note.id === selectedNoteId) return;
    if (hasUnsavedChanges && !window.confirm("Discard your unsaved changes and switch notes?")) return;
    setSelectedNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setSaveError("");
  }

  async function saveNote(event) {
    event.preventDefault();
    if (!selectedNote || !hasUnsavedChanges) return;
    setSaving(true);
    setSaveError("");
    try {
      const updatedNote = await api(`/notes/${selectedNote.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: title.trim(), content }),
      });
      setNotes((current) => current.map((note) => note.id === updatedNote.id ? updatedNote : note));
      setTitle(updatedNote.title);
      setContent(updatedNote.content);
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote() {
    if (!selectedNote || !window.confirm(`Delete “${selectedNote.title}”? This cannot be undone.`)) return;
    setDeleting(true);
    setSaveError("");
    try {
      await api(`/notes/${selectedNote.id}`, { method: "DELETE" });
      const remainingNotes = notes.filter((note) => note.id !== selectedNote.id);
      setNotes(remainingNotes);
      setSelectedNoteId(remainingNotes[0]?.id || "");
      setTitle(remainingNotes[0]?.title || "");
      setContent(remainingNotes[0]?.content || "");
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setDeleting(false);
    }
  }

  if (!active) return null;
  if (loading) return <div className="notes-message"><span className="loader" /> Loading your notes…</div>;
  if (loadError) {
    return <div className="notes-message notes-error" role="alert">{loadError} <button className="text-button" onClick={() => { setLoadError(""); setReloadToken((current) => current + 1); }}>Try again</button></div>;
  }

  return (
    <section className="notepad-workspace" aria-label="Personal notes">
      <aside className="notes-list-panel">
        <div className="notes-list-heading">
          <div><div className="section-kicker">YOUR NOTES</div><h2>My notepad</h2></div>
          <button className="notes-new-button" onClick={createNote} disabled={creating} aria-label="Create a new note" title="Create a new note">
            <Icon name="plus" size={18} />
          </button>
        </div>
        {saveError && !selectedNote && <div className="notes-error" role="alert">{saveError}</div>}
        {notes.length === 0 ? (
          <div className="notes-empty-list"><span>✎</span><p>Your notes will show up here. Create one to get started.</p></div>
        ) : (
          <div className="notes-list">
            {notes.map((note) => (
              <button
                key={note.id}
                className={`note-list-item ${note.id === selectedNoteId ? "selected" : ""}`}
                onClick={() => selectNote(note)}
              >
                <strong>{note.title}</strong>
                <span>{note.content.trim().replace(/\s+/g, " ").slice(0, 74) || "No note text yet"}</span>
              </button>
            ))}
          </div>
        )}
      </aside>

      <form className="note-editor" onSubmit={saveNote}>
        {selectedNote ? (
          <>
            <div className="note-editor-toolbar">
              <span className={hasUnsavedChanges ? "note-save-status unsaved" : "note-save-status"}>
                {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
              </span>
              <div className="note-editor-actions">
                <button type="button" className="note-delete-button" onClick={deleteNote} disabled={deleting || saving}>
                  <Icon name="trash" size={15} /> Delete
                </button>
                <button type="submit" className="button button-primary note-save-button" disabled={!hasUnsavedChanges || saving || deleting}>
                  {saving ? "Saving…" : "Save note"}
                </button>
              </div>
            </div>
            <label className="visually-hidden" htmlFor="note-title">Note title</label>
            <input
              id="note-title"
              className="note-title-input"
              value={title}
              maxLength={120}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Note title"
            />
            <label className="visually-hidden" htmlFor="note-content">Note content</label>
            <textarea
              id="note-content"
              className="note-content-input"
              value={content}
              maxLength={50000}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write your study notes here…"
            />
            {saveError && <div className="notes-error" role="alert">{saveError}</div>}
          </>
        ) : (
          <div className="note-editor-empty"><span>✎</span><h2>Your own little study space</h2><p>Create a note for reminders, class notes, or anything you want to remember.</p><button type="button" className="button button-primary" onClick={createNote} disabled={creating}><Icon name="plus" size={16} /> Create a note</button></div>
        )}
      </form>
    </section>
  );
}
