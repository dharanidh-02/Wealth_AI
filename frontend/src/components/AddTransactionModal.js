import React, { useState } from "react";
import "./AddTransactionModal.css";

function AddTransactionModal({ isOpen, onClose, onSave }) {
  // Local form state initialization
  const [formData, setFormData] = useState({
    type: "Income",
    title: "",
    amount: "",
    category: "",
    date: "2026-05-19",
    paymentMethod: "",
    isRecurring: false,
  });

  const [bulkFile, setBulkFile] = useState(null);
  const [bulkFileName, setBulkFileName] = useState("No file chosen");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBulkFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBulkFile(file);
      setBulkFileName(file.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
      alert("Please fill in Title and Amount");
      return;
    }

    const completedPayload = {
      ...formData,
      description: formData.title
    };

    onSave(completedPayload);
    onClose();
  };

  // NATIVE JAVASCRIPT CSV PARSER AND ENGINE MAPPER
  const handleBulkSubmit = (e) => {
    e.preventDefault();
    if (!bulkFile) {
      alert("Please select a valid CSV file first.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const text = event.target.result;
      const lines = text.split("\n");
      
      if (lines.length <= 1) {
        alert("The uploaded CSV file appears to be empty.");
        return;
      }

      // Read headers and standardize casing
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      
      // Match column indexes to find data fields in Kaggle files
      const dateIdx = headers.findIndex(h => h.includes("date") || h.includes("time"));
      const descIdx = headers.findIndex(h => h.includes("title") || h.includes("desc") || h.includes("item") || h.includes("ref"));
      const catIdx = headers.findIndex(h => h.includes("cat"));
      const typeIdx = headers.findIndex(h => h.includes("type") || h.includes("vector"));
      const amtIdx = headers.findIndex(h => h.includes("amount") || h.includes("value") || h.includes("price"));

      if (amtIdx === -1) {
        alert("Error: Could not identify an 'Amount' column in the CSV file headers.");
        return;
      }

      const parsedTransactions = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const row = lines[i].split(",").map(r => r.trim().replace(/['"]+/g, ''));
        
        // Dynamic map falling back on defaults if fields are missing in rows
        const rawType = typeIdx !== -1 ? row[typeIdx] : "Expense";
        const typeNormalized = (rawType.toLowerCase().includes("inc") || rawType.toLowerCase().includes("inflow")) ? "Income" : "Expense";
        
        const cleanAmount = Math.abs(parseFloat(row[amtIdx])) || 0;
        if (cleanAmount === 0) continue; 

        const item = {
          date: dateIdx !== -1 && row[dateIdx] ? row[dateIdx] : new Date().toISOString().split('T')[0],
          title: descIdx !== -1 && row[descIdx] ? row[descIdx] : "Bulk Import Item",
          description: descIdx !== -1 && row[descIdx] ? row[descIdx] : "Bulk Import Item",
          category: catIdx !== -1 && row[catIdx] ? row[catIdx] : "Other",
          type: typeNormalized,
          amount: cleanAmount,
          paymentMethod: "Bank Transfer",
          isRecurring: false
        };

        parsedTransactions.push(item);
      }

      if (parsedTransactions.length > 0) {
        // Send parsed items array upstream to Homepage context handlers
        onSave(parsedTransactions);
        alert(`Successfully imported ${parsedTransactions.length} transaction records!`);
        onClose();
      } else {
        alert("No valid rows could be processed from this file structure.");
      }
    };

    reader.readAsText(bulkFile);
  };

  return (
    <div className="transaction-modal-overlay" onClick={onClose}>
      <div className="transaction-modal-container" onClick={(e) => e.stopPropagation()}>
        
        <div className="transaction-modal-header">
          <div>
            <h2>Add Transaction</h2>
            <p>Add individual transactions or import statements in bulk</p>
          </div>
          <button type="button" className="close-x-btn" onClick={onClose}>&times;</button>
        </div>

        {/* BULK IMPORT FIELD */}
        <div className="bulk-import-section">
          <label className="section-minor-label">Bulk Statements Upload</label>
          <div className="file-uploader-row bulk-row">
            <div className="scan-icon-box">📊</div>
            <label className="file-input-label bulk-btn">
              Select CSV File
              <input 
                type="file" 
                accept=".csv" 
                style={{ display: "none" }} 
                onChange={handleBulkFileChange}
              />
            </label>
            <span className="file-status-text">{bulkFileName}</span>
          </div>
          <span className="helper-text">Supports banking statements in standard format (.CSV)</span>
          <button type="button" className="bulk-process-btn" onClick={handleBulkSubmit}>
            Process Bulk Statement
          </button>
        </div>

        <div className="modal-section-divider">
          <span>OR MANUALLY ENTER</span>
        </div>

        <form onSubmit={handleSubmit} className="transaction-modal-form">
          <div className="form-element">
            <label>AI Scan Receipt</label>
            <div className="file-uploader-row">
              <div className="scan-icon-box">🔍</div>
              <label className="file-input-label">
                Choose File
                <input type="file" accept="image/png, image/jpeg" style={{ display: "none" }} />
              </label>
              <span className="file-status-text">No file chosen</span>
            </div>
            <span className="helper-text">JPG, PNG up to 2MB</span>
          </div>

          <div className="form-element">
            <label>Transaction Type</label>
            <div className="radio-toggle-group">
              <div 
                className={`radio-label-box ${formData.type === "Income" ? "active-income" : ""}`}
                onClick={() => setFormData(prev => ({ ...prev, type: "Income" }))}
              >
                Income
              </div>
              <div 
                className={`radio-label-box ${formData.type === "Expense" ? "active-expense" : ""}`}
                onClick={() => setFormData(prev => ({ ...prev, type: "Expense" }))}
              >
                Expense
              </div>
            </div>
          </div>

          <div className="form-element">
            <label>Title</label>
            <input type="text" name="title" placeholder="Transaction title" required value={formData.title} onChange={handleChange} />
          </div>

          <div className="form-element">
            <label>Amount</label>
            <input type="number" name="amount" placeholder="0.00" required value={formData.amount} onChange={handleChange} />
          </div>

          <div className="form-element">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="">Select Category</option>
              <option value="Salary">Salary</option>
              <option value="Food">Food & Dining</option>
              <option value="Rent">Rent / Housing</option>
              <option value="Utilities">Utilities</option>
            </select>
          </div>

          <div className="form-element">
            <label>Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} />
          </div>

          <div className="form-element">
            <label>Payment Method</label>
            <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
              <option value="">Select payment method</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="UPI">UPI / Net Banking</option>
            </select>
          </div>

          <div className="recurring-row">
            <div>
              <label style={{ margin: 0 }}>Recurring Transaction</label>
              <span className="helper-text">Set recurring to repeat this transaction</span>
            </div>
            <div 
              className={`switch-toggle ${formData.isRecurring ? "switch-active" : ""}`}
              onClick={() => setFormData(prev => ({ ...prev, isRecurring: !prev.isRecurring }))}
            >
              <div className="switch-slider"></div>
            </div>
          </div>

          <button type="submit" className="save-transaction-btn">Save</button>
        </form>
      </div>
    </div>
  );
}

export default AddTransactionModal;
