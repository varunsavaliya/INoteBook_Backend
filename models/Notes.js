import mongoose, { Schema } from "mongoose";

const NoteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      default: "General",
    },
  },
  {
    timestamps: true,
  }
);

const Note = mongoose.model("note", NoteSchema);
export default Note;
