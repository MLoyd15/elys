import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Icon } from "../icons.jsx";

function notesInFolder(notes, folderId) {
  if (folderId === "all") return notes;
  if (folderId === "unfiled") return notes.filter((note) => !note.folderId);
  return notes.filter((note) => note.folderId === folderId);
}

export default function Notepad({ active }) {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolderId, setActiveFolderId] = useState("all");
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteFolderId, setNoteFolderId] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const selectedNote = notes.find((note) => note.id === selectedNoteId);
  const hasUnsavedChanges = Boolean(
    selectedNote && (
      title !== selectedNote.title
      || content !== selectedNote.content
      || noteFolderId !== (selectedNote.folderId || "")
    ),
  );
  const visibleNotes = notesInFolder(notes, activeFolderId);

  useEffect(() => {
    if (!active || loaded) return;
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    Promise.all([api("/notes"), api("/notes/folders")])
      .then(([loadedNotes, loadedFolders]) => {
        if (cancelled) return;
        setNotes(loadedNotes);
        setFolders(loadedFolders);
        setSelectedNoteId(loadedNotes[0]?.id || "");
        setTitle(loadedNotes[0]?.title || "");
        setContent(loadedNotes[0]?.content || "");
        setNoteFolderId(loadedNotes[0]?.folderId || "");
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
      const folderId = activeFolderId !== "all" && activeFolderId !== "unfiled"
        ? activeFolderId
        : null;
      const note = await api("/notes", { method: "POST", body: JSON.stringify({ folderId }) });
      setNotes((current) => [note, ...current]);
      setSelectedNoteId(note.id);
      setTitle(note.title);
      setContent(note.content);
      setNoteFolderId(note.folderId || "");
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setCreating(false);
    }
  }

  async function createFolder(event) {
    event.preventDefault();
    const name = newFolderName.trim();
    if (!name) return;
    setCreatingFolder(true);
    setSaveError("");
    try {
      const folder = await api("/notes/folders", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setFolders((current) => [...current, folder].sort((a, b) => a.name.localeCompare(b.name)));
      setNewFolderName("");
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setCreatingFolder(false);
    }
  }

  function selectFolder(folderId) {
    if (folderId === activeFolderId) return;
    if (hasUnsavedChanges && !window.confirm("Discard your unsaved changes and switch folders?")) return;
    const nextNote = notesInFolder(notes, folderId)[0];
    setActiveFolderId(folderId);
    setSelectedNoteId(nextNote?.id || "");
    setTitle(nextNote?.title || "");
    setContent(nextNote?.content || "");
    setNoteFolderId(nextNote?.folderId || "");
    setSaveError("");
  }

  function selectNote(note) {
    if (note.id === selectedNoteId) return;
    if (hasUnsavedChanges && !window.confirm("Discard your unsaved changes and switch notes?")) return;
    setSelectedNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setNoteFolderId(note.folderId || "");
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
        body: JSON.stringify({ title: title.trim(), content, folderId: noteFolderId || null }),
      });
      setNotes((current) => current.map((note) => note.id === updatedNote.id ? updatedNote : note));
      setTitle(updatedNote.title);
      setContent(updatedNote.content);
      setNoteFolderId(updatedNote.folderId || "");
      if (activeFolderId !== "all" && activeFolderId !== (updatedNote.folderId || "unfiled")) {
        setActiveFolderId(updatedNote.folderId || "unfiled");
      }
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
      const nextNote = notesInFolder(remainingNotes, activeFolderId)[0];
      setNotes(remainingNotes);
      setSelectedNoteId(nextNote?.id || "");
      setTitle(nextNote?.title || "");
      setContent(nextNote?.content || "");
      setNoteFolderId(nextNote?.folderId || "");
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
        <div className="notes-folder-list" aria-label="Note folders">
          <button className={`notes-folder-item ${activeFolderId === "all" ? "selected" : ""}`} onClick={() => selectFolder("all")}>
            <span>All notes</span><span>{notes.length}</span>
          </button>
          <button className={`notes-folder-item ${activeFolderId === "unfiled" ? "selected" : ""}`} onClick={() => selectFolder("unfiled")}>
            <span>Unfiled</span><span>{notes.filter((note) => !note.folderId).length}</span>
          </button>
          {folders.map((folder) => (
            <button key={folder.id} className={`notes-folder-item ${activeFolderId === folder.id ? "selected" : ""}`} onClick={() => selectFolder(folder.id)}>
              <span>📁 {folder.name}</span><span>{notes.filter((note) => note.folderId === folder.id).length}</span>
            </button>
          ))}
        </div>
        <form className="notes-folder-form" onSubmit={createFolder}>
          <input
            aria-label="New folder name"
            value={newFolderName}
            maxLength={60}
            onChange={(event) => setNewFolderName(event.target.value)}
            placeholder="New folder name"
          />
          <button type="submit" className="notes-folder-add" disabled={creatingFolder || !newFolderName.trim()} aria-label="Create folder">
            {creatingFolder ? "…" : <Icon name="plus" size={15} />}
          </button>
        </form>
        {saveError && !selectedNote && <div className="notes-error" role="alert">{saveError}</div>}
        {visibleNotes.length === 0 ? (
          <div className="notes-empty-list"><span>✎</span><p>{notes.length ? "No notes in this folder yet." : "Your notes will show up here. Create one to get started."}</p></div>
        ) : (
          <div className="notes-list">
            {visibleNotes.map((note) => (
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
            <label className="visually-hidden" htmlFor="note-folder">Note folder</label>
            <select id="note-folder" className="note-folder-select" value={noteFolderId} onChange={(event) => setNoteFolderId(event.target.value)}>
              <option value="">Unfiled</option>
              {folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
            </select>
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
