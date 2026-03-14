// modules/search/SearchModal.jsx
import { useState } from "react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import useDebouncedSearch from "./useDebouncedSearch";
import SearchResult from "./SearchResult";
import "./search.css";

export default function SearchModal({ onClose }) {
  const [q, setQ] = useState("");
  const results = useDebouncedSearch(q);

  const [active, setActive] = useState(0);

  const key = (e) => {
    if (e.key === "ArrowDown") setActive(a => a + 1);
    if (e.key === "ArrowUp") setActive(a => Math.max(0, a - 1));
    if (e.key === "Enter") jump(results[active]);
  };


  return (
    <Modal onClose={onClose}>
      <div className="search-modal">
        <Input
          placeholder="Search anything..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />

        <div className="search-results">
          {results.map(r => (
            <SearchResult
              key={r._id}
              r={r}
              close={onClose}
            />
          ))}

          {!results.length && q && (
            <div className="empty">No results</div>
          )}
        </div>
      </div>
    </Modal>
  );
}
