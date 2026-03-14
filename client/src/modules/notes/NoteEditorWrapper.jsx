// 📁 modules/notes/NoteEditorWrapper.jsx
import { useParams } from "react-router-dom";
import NoteEditor from "./NoteEditor";

export default function NoteEditorWrapper() {
  const { noteId } = useParams();

  return (
    <NoteEditor
      noteId={noteId}
      onClose={() => window.history.back()}
    />
  );
}
