import mongoose from "mongoose";

const noteFolderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
  },
  { timestamps: true },
);

noteFolderSchema.index({ userId: 1, name: 1 }, { collation: { locale: "en", strength: 2 } });

export const NoteFolder = mongoose.model("NoteFolder", noteFolderSchema);
