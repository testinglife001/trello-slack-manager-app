// modules/search/SearchResult.jsx
import { useNavigate } from "react-router-dom";

export default function SearchResult({ r, close }) {
  const navigate = useNavigate();

  const jump = () => {
    if (r.type === "card")
      navigate(`/cards/${r._id}`);

    if (r.type === "channel")
      navigate(`/channels/${r._id}`);

    if (r.type === "note")
      navigate(`/notes/${r._id}`);

    close?.();
  };

  return (
    <div className="search-item" onClick={jump}>
      <div className="search-title">{r.title || r.name}</div>
      <div className="search-type">{r.type}</div>
    </div>
  );
}
