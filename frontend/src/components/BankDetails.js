import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./BankDetails.css";

// Marker Fix
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

function MapRecenter({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords) map.setView(coords, 14); }, [coords, map]);
  return null;
}

function BankDetails() {
  const { bankName } = useParams();
  const navigate = useNavigate();
  const userFinance = { income: 100000, expenses: 50000 };

  const [loanType, setLoanType] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState([20.5937, 78.9629]);
  const [branches, setBranches] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [eligibility, setEligibility] = useState({ status: "", msg: "", impact: "" });

  const provider = new OpenStreetMapProvider();

  const handleCheck = async () => {
    if (!loanType || !paymentMode || !location) return alert("Fill all details first");

    const disposable = userFinance.income - userFinance.expenses;
    const emi = loanType.includes("Home") ? 35000 : 15000;
    
    if (disposable > emi) {
      setEligibility({
        status: "Eligible",
        msg: `Monthly savings (₹${disposable}) cover the ₹${emi} EMI.`,
        impact: `Expenses will rise to ₹${userFinance.expenses + emi}.`
      });
    } else {
      setEligibility({ status: "Not Eligible", msg: "Savings too low for this EMI.", impact: "N/A" });
    }

    const results = await provider.search({ query: location });
    if (results && results.length > 0) {
      setCoords([results[0].y, results[0].x]);
      setBranches([{ name: `${bankName} Main Branch`, lat: results[0].y, lng: results[0].x }]);
      setShowResults(true);
    }
  };

  return (
    <div className="bank-details-page">
      <header className="bank-header">
        {/* Updated to reliably go back to the homepage dashboard */}
        <button className="back-circle" onClick={() => navigate(-1)}>←</button>
        <h1>{bankName} Branch Locator</h1>
      </header>

      <div className="dashboard-grid">
        {/* LEFT COLUMN: Input & Conversation */}
        <div className="console-panel">
          <div className="chat-preview-card">
            <p><strong>Cust:</strong> I need a <span>{loanType || "..."}</span> at <span>{bankName}</span>.</p>
            <p><strong>Emp:</strong> Sure! Please provide your location and preferred mode.</p>
          </div>

          <div className="input-card">
            <div className="form-group">
              <label>Loan Category</label>
              <select value={loanType} onChange={(e) => setLoanType(e.target.value)}>
                <option value="">Select Type</option>
                <option value="Personal Loan">Personal Loan</option>
                <option value="Home Loan">Home Loan</option>
                <option value="Education Loan">Education Loan</option>
              </select>
            </div>

            <div className="form-group">
              <label>Payment Mode</label>
              <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                <option value="">Select Mode</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>

            <div className="form-group">
              <label>Service Area</label>
              <input type="text" placeholder="Enter City/Area" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            <button className="primary-action-btn" onClick={handleCheck}>Check Eligibility & Map</button>
          </div>

          {showResults && (
            <div className={`status-card ${eligibility.status.toLowerCase()}`}>
              <h3>{eligibility.status}</h3>
              <p>{eligibility.msg}</p>
              <small>{eligibility.impact}</small>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Map */}
        <div className="map-view-container">
          <MapContainer center={coords} zoom={5} className="leaflet-container-main">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapRecenter coords={coords} />
            {branches.map((b, i) => (
              <Marker key={i} position={[b.lat, b.lng]}><Popup>{b.name}</Popup></Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default BankDetails;
