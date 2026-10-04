import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120, default: "Untitled note" },
    content: { type: String, maxlength: 50000, default: "" },
    folderId: { type: mongoose.Schema.Types.ObjectId, ref: "NoteFolder", default: null },
  },
  { timestamps: true },
);

export const Note = mongoose.model("Note", noteSchema);
