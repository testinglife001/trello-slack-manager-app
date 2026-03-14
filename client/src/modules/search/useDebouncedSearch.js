// modules/search/useDebouncedSearch.js
import { useEffect, useState } from "react";
import { request } from "../../services/api";

export default function useDebouncedSearch(query, delay = 300) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const t = setTimeout(async () => {
      try {
        const data = await request(`/search?q=${query}`);
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      }
    }, delay);

    return () => clearTimeout(t);
  }, [query, delay]);

  return results;
}

