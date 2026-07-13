/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { ChevronDown, Check, ExternalLink } from 'lucide-react';
import './LoansAndInvestments.css';

// 1. DATA REPOSITORY: HIGH-FIDELITY IDBI BANK PRODUCT PORTFOLIO
const allBanksData = [
  // --- IDBI Home Loan Categories ---
  { id: 'IDBI_VANILLA', name: 'IDBI Plain Vanilla Home Loan', type: 'Housing Loans', rating: '4.5', homeRate: 8.50, personalRate: 10.85, url: 'https://idbibank.in' },
  { id: 'IDBI_RURAL', name: 'IDBI Rural & Semi-Urban Housing', type: 'Housing Loans', rating: '4.3', homeRate: 8.50, personalRate: 10.80, url: 'https://idbibank.in' },
  { id: 'IDBI_ULTRA', name: 'IDBI Home Loan Ultra Saver', type: 'Housing Loans', rating: '4.4', homeRate: 8.90, personalRate: 12.75, url: 'https://idbibank.in' },
  { id: 'IDBI_PLOT', name: 'IDBI Plot Loan for Construction', type: 'Housing Loans', rating: '4.2', homeRate: 9.90, personalRate: 10.50, url: 'https://idbibank.in' },

  // --- IDBI Personal & Retail Facilities ---
  { id: 'IDBI_SANJEEVANI', name: 'IDBI Sanjeevani Personal Loan', type: 'Personal & Retail', rating: '4.4', homeRate: 9.50, personalRate: 11.25, url: 'https://idbibank.in' },
  { id: 'IDBI_PROP_POWER', name: 'IDBI Property Power (LAP)', type: 'Personal & Retail', rating: '4.1', homeRate: 9.00, personalRate: 10.00, url: 'https://idbibank.in' },
  { id: 'IDBI_SUVIDHA', name: 'IDBI Suvidha Top-Up Loan', type: 'Personal & Retail', rating: '4.2', homeRate: 8.70, personalRate: 11.60, url: 'https://idbibank.in' }
];

// DEDICATED NEW SECTION: SPECIFIC IDBI PARTNERED GOVERNMENT SAVING SCHEMES
const governmentSchemes = [
  { name: "IDBI Sukanya Samriddhi Yojana (SSY)", return: "8.2%", lockIn: "21y", risk: "Low (Sovereign)", tax: "Section 80C Exempt" },
  { name: "IDBI Public Provident Fund (PPF)", return: "7.1%", lockIn: "15y", risk: "Low (Sovereign)", tax: "Triple Tax Exempt (EEE)" },
  { name: "IDBI Senior Citizen Savings Scheme", return: "8.2%", lockIn: "5y", risk: "Low (Sovereign)", tax: "Section 80C Benefit" },
  { name: "IDBI Kisan Vikas Patra (KVP)", return: "7.5%", lockIn: "115 months", risk: "Low", tax: "Interest Taxable" },
  { name: "IDBI Mahila Samman Savings Certificate", return: "7.5%", lockIn: "2y", risk: "Low", tax: "Taxable Gross" }
];

// DEDICATED NEW SECTION: IDBI WEALTH MANAGEMENT & CORE INVESTMENT PRODUCTS
const bankLedSchemes = [
  { name: "IDBI Utsav Special FD (700 Days)", return: "6.45%", lockIn: "700 Days", risk: "Low", tax: "Regular Bank FD Rates", bestFitRisk: "Low" },
  { name: "IDBI Vasundhara Green Deposit", return: "6.35%", lockIn: "1111 Days", risk: "Low", tax: "Green Infrastructure Pool", bestFitRisk: "Low" },
  { name: "IDBI Mutual Fund SIP (Flexi-Cap)", return: "13.2%", lockIn: "None (Open)", risk: "Medium-High", tax: "Equity Capital Gains", bestFitRisk: "Medium" },
  { name: "IDBI Equity Linked Saving Scheme (ELSS)", return: "12.8%", lockIn: "3y", risk: "High", tax: "Section 80C Tax Saver", bestFitRisk: "Medium" },
  { name: "IDBI Portfolio Investment Scheme (PIS)", return: "Market Linked", lockIn: "None", risk: "High", tax: "Capital Gains Tax Deducted", bestFitRisk: "High" }
];

const calculateLoanMetrics = (p, annualRate, years, monthlyIncome) => {
  const P = parseFloat(p) || 0;
  if (P <= 0 || annualRate <= 0) return { emi: 0, totalPayable: 0, interestPaid: 0, pctOfIncome: 0 };

  const monthlyRate = (annualRate / 12) / 100;
  const numberOfMonths = years * 12;

  const emi = (P * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) / (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
  const totalPayable = emi * numberOfMonths;
  const interestPaid = totalPayable - P;
  const pctOfIncome = (emi / monthlyIncome) * 100;

  return {
    emi: Math.round(emi),
    totalPayable: Math.round(totalPayable),
    interestPaid: Math.round(interestPaid),
    pctOfIncome: pctOfIncome.toFixed(1)
  };
};

export default function LoansAndInvestments({ profile }) {
  const [activeTab, setActiveTab] = useState('loans'); 
  const [bankType, setBankType] = useState('Housing Loans'); // Updated default categorization filter matching IDBI data keys
  
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [confirmedBanks, setConfirmedBanks] = useState([]);

  const [loanType, setLoanType] = useState('Home Loan (30y)');
  const [principal, setPrincipal] = useState(2500000);
  
  const userEmail = localStorage.getItem("userEmail") || "user";
  const storedIncome = localStorage.getItem(`${userEmail}_totalIncome`);
  const monthlyIncome = Number(profile?.monthlyIncome || profile?.totalIncome || storedIncome || 50000);
  
  const targetHorizon = profile?.investmentTimeline || localStorage.getItem(`${userEmail}_investmentHorizon`) || "5";
  const targetRisk = profile?.riskTolerance || localStorage.getItem(`${userEmail}_riskTolerance`) || "medium";
  const safeEmiCapPercent = 40;

  // Dynamic CIBIL credit score estimate based on risk profile
  const creditScore = targetRisk.toLowerCase() === "low" ? 780 
    : targetRisk.toLowerCase() === "high" ? 650 
    : 720;
  const creditLabel = creditScore >= 750 ? "Excellent" : creditScore >= 700 ? "Good" : "Fair";
  const creditColor = creditScore >= 750 ? "#10b981" : creditScore >= 700 ? "#f59e0b" : "#ef4444";

  const isHomeLoan = loanType.includes('Home') || bankType === 'Housing Loans';
  const loanTenureYears = isHomeLoan ? 30 : 5;

  const filteredBanksPool = allBanksData.filter(bank => bank.type === bankType);

  const calculatedCards = allBanksData
    .filter(bank => confirmedBanks.includes(bank.id) && bank.type === bankType)
    .map(bank => {
      const activeRate = isHomeLoan ? bank.homeRate : bank.personalRate;
      const metrics = calculateLoanMetrics(principal, activeRate, loanTenureYears, monthlyIncome);
      return { ...bank, activeRate, ...metrics };
    });

  const bestCard = calculatedCards.length > 0 
    ? [...calculatedCards].sort((a, b) => a.emi - b.emi)[0] 
    : null;

  const toggleBank = (id) => {
    if (selectedBanks.includes(id)) {
      setSelectedBanks(selectedBanks.filter(b => b !== id));
    } else {
      setSelectedBanks([...selectedBanks, id]);
    }
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    if (selectedBanks.length === 0) {
      alert("Please select at least 1 IDBI financial facility checkbox first!");
      return;
    }
    setConfirmedBanks(selectedBanks);
  };

  return (
    <div className="loans-container">
      <div className="loans-header">
        <span className="subtitle">IDBI Wealth Solutions</span>
        <h1 className="title">Loans & Investments</h1>
        <p className="description">Select custom IDBI structures, check dynamic risk-to-income models, and deploy smart capital.</p>
      </div>

      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'loans' ? 'active' : ''}`} onClick={() => setActiveTab('loans')}>IDBI Credit Pools</button>
        <button className={`tab-btn ${activeTab === 'investments' ? 'active' : ''}`} onClick={() => setActiveTab('investments')}>IDBI Wealth Schemes</button>
      </div>
      <div className="workspace-layout">
        {activeTab === 'loans' ? (
          <>
            {/* LEFT SELECTION COLUMN FORM */}
            <div className="control-panel">
              <div className="form-group">
                <label className="input-label">IDBI Scheme Category</label>
                <div className="select-wrapper">
                  <select 
                    value={bankType} 
                    onChange={(e) => {
                      setBankType(e.target.value);
                      setSelectedBanks([]);
                      setConfirmedBanks([]);
                    }}
                    className="form-select"
                  >
                    <option value="Housing Loans">Housing Loans</option>
                    <option value="Personal & Retail">Personal & Retail Facilities</option>
                  </select>
                  <ChevronDown className="select-icon" />
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">Pick IDBI Products (1 or more)</label>
                <div className="checkbox-list">
                  {filteredBanksPool.map((bank) => (
                    <div key={bank.id} onClick={() => toggleBank(bank.id)} className="checkbox-row">
                      <div className="checkbox-left">
                        <div className={`custom-checkbox ${selectedBanks.includes(bank.id) ? 'checked' : ''}`}>
                          {selectedBanks.includes(bank.id) && <Check className="check-icon" />}
                        </div>
                        <span className="bank-name">{bank.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">Loan type</label>
                <div className="select-wrapper">
                  <select value={loanType} onChange={(e) => setLoanType(e.target.value)} className="form-select">
                    <option>Home Loan (30y)</option>
                    <option>Personal Loan (5y)</option>
                  </select>
                  <ChevronDown className="select-icon" />
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">Principal (₹)</label>
                <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="form-input" />
              </div>

              <button onClick={handleCompareClick} className="submit-btn">Compare against my income</button>
            </div>

            {/* RIGHT ANALYSIS DATA GRID DISPLAY (Guarded until click happens) */}
            <div className="display-panel">
              {confirmedBanks.length === 0 ? (
                <div className="profile-card" style={{ justifyContent: "center", padding: "40px", textAlign: "center", background: "#f8fafc" }}>
                  <p style={{ color: "#64748b", fontWeight: "500" }}>Select your target IDBI credit schemes on the left and click compare to run the math engines.</p>
                </div>
              ) : (
                <>
                  <div className="profile-card">
                    <div>
                        <span className="card-subtitle">Ecosystem Evaluation</span>
                        <div className="scenario-title">
                          <h2>{isHomeLoan ? 'Home Loan Setup' : 'Personal Credit Setup'}</h2>
                          <span className="dot">·</span>
                          <h2>₹{(principal / 100000).toFixed(2)} L</h2>
                          <span className="dot">·</span>
                          <h2 className="tenure">{loanTenureYears}y</h2>
                        </div>
                        <p className="income-note">
                          Your monthly income: <span className="highlight-text">₹{monthlyIncome.toLocaleString('en-IN')}</span> · Safe EMI cap: <span className="highlight-text">{safeEmiCapPercent}%</span>
                        </p>
                        <p className="income-note" style={{ marginTop: '6px' }}>
                          Estimated CIBIL Score: <span style={{ fontWeight: 700, color: creditColor }}>{creditScore} — {creditLabel}</span>
                        </p>
                      </div>
                    {bestCard && (
                      <div className="best-emi-badge">
                        Optimal Configuration: ₹{bestCard.emi.toLocaleString('en-IN')}/Mo · {bestCard.name}
                      </div>
                    )}
                  </div>

                  <div className="cards-grid">
                    {calculatedCards.map((bank) => (
                      <div key={bank.id} className="bank-card">
                        <div className="card-top">
                          <div className="card-meta">
                            <h3 className="card-bank-name">{bank.name}</h3>
                            <p className="card-bank-details">
                              Interest Rate: <span className="highlight-text">{bank.activeRate}%</span>
                            </p>
                          </div>
                          <span className="affordable-tag"><Check className="tag-check" /> Verified Option</span>
                        </div>

                        <div className="metrics-grid">
                          <div className="metric-box">
                            <span className="metric-label">EMI / Month</span>
                            <span className="metric-value">₹{bank.emi.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="metric-box">
                            <span className="metric-label">% of Income</span>
                            <span className="metric-value">{bank.pctOfIncome}%</span>
                          </div>
                          <div className="metric-box">
                            <span className="metric-label">Total Payable</span>
                            <span className="metric-value">₹{(bank.totalPayable / 100000).toFixed(2)} L</span>
                          </div>
                          <div className="metric-box">
                            <span className="metric-label">Interest Paid</span>
                            <span className="metric-value">₹{(bank.interestPaid / 100000).toFixed(2)} L</span>
                          </div>
                        </div>

                        <div className="card-footer">
                          <a href={bank.url} className="external-link" target="_blank" rel="noreferrer">
                            View Official IDBI Prospectus <ExternalLink className="link-icon" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          /* INVESTMENTS SIDE PANEL CONTENT */
          <div className="investments-workspace" style={{ width: "100%" }}>
            <div className="profile-card">
              <div>
                <span className="card-subtitle">TAILORED WEALTH TARGETS</span>
                <div className="scenario-title" style={{ marginTop: "4px" }}>
                  <p className="income-note" style={{ fontSize: "1.1rem" }}>
                    Your horizon: <span className="highlight-text" style={{ fontWeight: "600" }}>{targetHorizon} years</span> 
                    <span className="dot" style={{ margin: "0 10px" }}>·</span> 
                    Risk Vector: <span className="highlight-text" style={{ fontWeight: "600" }}>{targetRisk.toUpperCase()}</span>
                  </p>
                </div>
              </div>
            </div>

            <h2 style={{ fontSize: "1.3rem", fontWeight: "600", margin: "24px 0 16px 0", color: "#1f2937" }}>IDBI Government-Sponsored Schemes</h2>
            <div className="cards-grid">
              {governmentSchemes.map((scheme, index) => (
                <div key={index} className="bank-card">
                  <div className="card-top">
                    <div className="card-meta">
                      <h3 className="card-bank-name" style={{ fontSize: "1.05rem" }}>{scheme.name}</h3>
                    </div>
                  </div>
                  <div className="metrics-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                    <div className="metric-box"><span className="metric-label">BASE RETURN</span><span className="metric-value" style={{ fontSize: "0.95rem" }}>{scheme.return}</span></div>
                    <div className="metric-box"><span className="metric-label">TENURE LOCK-IN</span><span className="metric-value" style={{ fontSize: "0.95rem" }}>{scheme.lockIn}</span></div>
                    <div className="metric-box"><span className="metric-label">SECURITY RISK</span><span className="metric-value" style={{ fontSize: "0.95rem" }}>{scheme.risk}</span></div>
                    <div className="metric-box"><span className="metric-label">TAX PROVISION</span><span className="metric-value" style={{ fontSize: "0.85rem" }}>{scheme.tax}</span></div>
                  </div>
                  <div className="card-footer">
                    <a href="https://idbibank.in" target="_blank" rel="noreferrer" className="external-link" style={{ fontSize: "0.85rem", cursor: "pointer", textDecoration: "none" }}>
                      View Distribution Details ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: "1.3rem", fontWeight: "600", margin: "32px 0 16px 0", color: "#1f2937" }}>IDBI Bank-Led Wealth Schemes</h2>
            <div className="cards-grid">
              {bankLedSchemes.map((scheme, index) => (
                <div key={index} className="bank-card">
                  <div className="card-top">
                    <div className="card-meta">
                      <h3 className="card-bank-name" style={{ fontSize: "1.05rem" }}>{scheme.name}</h3>
                    </div>
                    {targetRisk.toLowerCase() === scheme.bestFitRisk?.toLowerCase() && (
                      <span className="affordable-tag" style={{ backgroundColor: "#ffedd5", color: "#ea580c" }}>Algorithmic Fit</span>
                    )}
                  </div>
                  <div className="metrics-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                    <div className="metric-box"><span className="metric-label">PROSPECTUS RETURN</span><span className="metric-value" style={{ fontSize: "0.95rem" }}>{scheme.return}</span></div>
                    <div className="metric-box"><span className="metric-label">TENURE LOCK-IN</span><span className="metric-value" style={{ fontSize: "0.95rem" }}>{scheme.lockIn}</span></div>
                    <div className="metric-box"><span className="metric-label">ASSET RISK</span><span className="metric-value" style={{ fontSize: "0.95rem" }}>{scheme.risk}</span></div>
                  </div>
                  <div className="card-footer">
                    <a href="https://idbibank.in" target="_blank" rel="noreferrer" className="external-link" style={{ fontSize: "0.85rem", cursor: "pointer", textDecoration: "none" }}>
                      Analyze Performance Portfolio ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
