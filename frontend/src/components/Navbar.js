import React, { useState } from "react";
import banks from "../data/bankData";
import "./Navbar.css";

function Navbar({ setSelectedResult }) {

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = (value) => {

    setSearch(value);

    if (!value) {
      setResults([]);
      return;
    }

    const filtered = banks.filter(
      (bank) =>
        bank.name.toLowerCase().includes(value.toLowerCase()) ||
        bank.loans.some((loan) =>
          loan.toLowerCase().includes(value.toLowerCase())
        )
    );

    setResults(filtered);
  };

  return (
    <div className="navbar">

      {/* LEFT MENU */}
      <div className="menu">☰</div>

      {/* APP NAME */}
      <h2 className="app-title">Financial Advisor</h2>

      {/* SEARCH */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search banks, loans..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />

        {results.length > 0 && (
          <div className="search-results">
            {results.map((bank, index) => (
              <div
                key={index}
                className="result-item"
                onClick={() => {
                  setSelectedResult(bank);
                  setResults([]);
                  setSearch("");
                }}
              >
                {bank.name}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Navbar;