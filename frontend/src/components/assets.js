import React, { useState, useEffect } from "react";
import "./assets.css"; 

const Assets = ({ profile = { assets: [], properties: [], riskAppetite: "Medium Risk" }, onAssetAdded }) => {
  const [assets, setAssets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("Gold / Jewelry");
  const [value, setValue] = useState("");
  const [institution, setInstitution] = useState("");
  const [isLeveragable, setIsLeveragable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync profile assets data safely with explicit fallbacks
  useEffect(() => {
    if (profile && profile.assets) {
      setAssets(profile.assets);
    } else if (profile && profile.properties) {
      setAssets(profile.properties);
    } else {
      setAssets([]);
    }
  }, [profile]);

  // Math engines to process financial parameters dynamically
  const totalEstimatedValue = (assets || []).reduce((sum, item) => sum + (Number(item?.value) || 0), 0);

  // Dynamic LTV Multiplier calculation based on standard Indian RBI guidelines
  const totalBorrowingPower = (assets || []).reduce((sum, item) => {
    if (!item) return sum;
    if (!item.isLeveragable && item.isLeveragable !== undefined) return sum;
    
    const assetVal = Number(item.value) || 0;
    switch (item.type) {
      case "Gold / Jewelry": return sum + (assetVal * 0.75); 
      case "Mutual Funds / Stocks": return sum + (assetVal * 0.50); 
      case "Fixed Deposit (FD)": return sum + (assetVal * 0.90); 
      case "Real Estate / Property": return sum + (assetVal * 0.60); 
      default: return sum + (assetVal * 0.50);
    }
  }, 0);

  const handleSaveAsset = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch("https://wealth-ai-backend.onrender.com/api/profile/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
          "x-auth-token": token || ""
        },
        body: JSON.stringify({
          name,
          type,
          value,
          institution,
          isLeveragable
        })
      });

      const data = await response.json();
      if (response.ok) {
        setAssets(data.assets || []);
        if (onAssetAdded) onAssetAdded();
        
        setName("");
        setType("Gold / Jewelry");
        setValue("");
        setInstitution("");
        setIsLeveragable(true);
        setShowModal(false);
      } else {
        alert(data.msg || "Failed to update asset portfolio parameters.");
      }
    } catch (err) {
      console.error("Network interface error:", err);
      alert("Unable to reach the server.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="properties-page-workspace">
      {/* 1. TOP HEADER SECTION */}
      <div className="properties-header-banner">
        <div className="title-block">
          <h1>Collateral Asset & Leverage Matrix</h1>
          <p className="description-text">Log asset classes to monitor real-time security lines and borrowing capacity.</p>
        </div>
        <button className="add-property-action-btn" onClick={() => setShowModal(true)}>
          + Add Asset
        </button>
      </div>

      {/* 2. CORE FINANCIAL SCORECARD ROW */}
      <div className="metrics-dashboard-row-grid">
        <div className="metric-card-box">
          <label>TOTAL ASSET VALUATION</label>
          <div className="value-display-large" style={{ color: "#1e293b" }}>
            ₹{totalEstimatedValue.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="metric-card-box" style={{ borderLeft: "4px solid #2563eb" }}>
          <label style={{ color: "#2563eb", fontWeight: "600" }}>🤖 AI BORROWING POWER</label>
          <div className="value-display-large" style={{ color: "#2563eb" }}>
            ₹{totalBorrowingPower.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* 3. CORE DISPLAY DATATABLE OR EMPTY PORTAL CANVAS */}
      <div className="properties-content-main-panel">
        {!assets || assets.length === 0 ? (
          <div className="empty-state-canvas">
            <div className="empty-state-icon">🛡️</div>
            <h3>No Assets Linked</h3>
            <p>Your active <span className="risk-highlight">{profile?.riskAppetite || "Medium Risk"}</span> dashboard requires collateral inputs to verify optimal lending channels.</p>
          </div>
        ) : (
          <div className="properties-table-wrapper-view">
            <table className="custom-portfolio-datatable">
              <thead>
                <tr>
                  <th>Asset Name</th>
                  <th>Classification Type</th>
                  <th>Financial Institution</th>
                  <th>Market Value</th>
                  <th>Collateral Safe?</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: "500" }}>{item?.name || "Unnamed Asset"}</td>
                    <td>
                      <span style={{ padding: "4px 8px", borderRadius: "12px", fontSize: "0.75rem", backgroundColor: "#f1f5f9", fontWeight: "500" }}>
                        {item?.type || "General"}
                      </span>
                    </td>
                    <td>{item?.institution || "-"}</td>
                    <td style={{ fontWeight: "600" }}>₹{Number(item?.value || 0).toLocaleString("en-IN")}</td>
                    <td>
                      <span style={{ color: item?.isLeveragable ? "#16a34a" : "#dc2626", fontWeight: "500" }}>
                        {item?.isLeveragable ? "🟢 Eligible" : "🔴 Locked"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. UPGRADED 5-FIELD ASSET SUBMISSION MODAL OVERLAY */}
      {showModal && (
        <div className="modal-backdrop-blur-overlay">
          <div className="modal-content-card-box">
            <div className="modal-header-row">
              <h3>Add Asset Record</h3>
              <button className="modal-close-dismiss-cross-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSaveAsset} className="modal-form-body-wrapper">
              
              {/* Field 1: Asset Type Dropdown Menu */}
              <div className="form-input-field-group">
                <label style={{ fontSize: "0.8rem", color: "#4b5563", display: "block", marginBottom: "4px" }}>Select Asset Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db" }}>
                  <option value="Gold / Jewelry">Gold / Jewelry</option>
                  <option value="Mutual Funds / Stocks">Mutual Funds / Stocks</option>
                  <option value="Fixed Deposit (FD)">Fixed Deposit (FD)</option>
                  <option value="Real Estate / Property">Real Estate / Property</option>
                </select>
              </div>

              {/* Field 2: Asset Name Text Entry */}
              <div className="form-input-field-group">
                <label style={{ fontSize: "0.8rem", color: "#4b5563", display: "block", marginBottom: "4px" }}>Asset Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sovereign Gold Coins, Emergency FD" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Field 3: Asset Value Box */}
              <div className="form-input-field-group">
                <label style={{ fontSize: "0.8rem", color: "#4b5563", display: "block", marginBottom: "4px" }}>Current Valuation Market Price (₹)</label>
                <input 
                  type="number" 
                  placeholder="Enter valuation amount" 
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                />
              </div>

              {/* Field 4: Bank Placement */}
              <div className="form-input-field-group">
                <label style={{ fontSize: "0.8rem", color: "#4b5563", display: "block", marginBottom: "4px" }}>Custodian / Bank Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. SBI, Muthoot Finance, Zerodha" 
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                />
              </div>

              {/* Field 5: Pledging Toggle Checkbox */}
              <div className="form-input-field-group" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0" }}>
                <input 
                  type="checkbox" 
                  id="leverageCheckbox"
                  checked={isLeveragable}
                  onChange={(e) => setIsLeveragable(e.target.checked)}
                  style={{ width: "auto", cursor: "pointer" }}
                />
                <label htmlFor="leverageCheckbox" style={{ fontSize: "0.85rem", color: "#374151", cursor: "pointer" }}>
                  This asset is available for loan collateral / pledging paths
                </label>
              </div>

              <button type="submit" className="form-save-submit-btn-cta" disabled={isSubmitting} style={{ backgroundColor: "#2563eb", marginTop: "12px" }}>
                {isSubmitting ? "Processing Transaction..." : "Securely Register Asset"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
