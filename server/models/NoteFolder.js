import mongoose from "mongoose";

const noteFolderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
  },
  { timestamps: true },
);

noteFolderSchema.index({ name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

export const NoteFolder = mongoose.model("NoteFolder", noteFolderSchema);
