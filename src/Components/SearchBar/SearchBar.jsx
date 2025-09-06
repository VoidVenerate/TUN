import React, { useState } from "react";
import { Search } from "lucide-react";
import "./SearchBar.css";

const SearchBar = ({ onSearch }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (onSearch) onSearch(query); // pass the value up
      setOpen(false); // close input
      setQuery(""); // clear
    }
  };

  const handleBlur = () => {
    // Optional: close when user clicks away
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="search-container">
      {/* Search Icon */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="search-btn"
      >
        <Search size={20} />
      </button>

      {/* Input */}
      <input
        type="text"
        value={query}
        placeholder="Search..."
        className={`search-input ${open ? "open" : ""}`}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        autoFocus={open}
      />
    </div>
  );
};

export default SearchBar;
