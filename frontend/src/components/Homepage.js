/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { LayoutDashboard, MessageSquareCode, Landmark, Building2, Plus, Calendar, Send, Compass, ArrowUpRight, ArrowDownLeft, User, Briefcase, BriefcaseBusiness, MapPin, CalendarDays, Target, LogOut, Paperclip, ArrowUp, FileText } from "lucide-react";
import "./Homepage.css";
import axios from "axios";
import AddTransactionModal from "./AddTransactionModal";
import Chatbot from "./chatbot/chatbot";
import Assets from "./assets"; 
import LoansAndInvestments from "./LoansAndInvestments";

function Homepage() {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(true);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [activeSection, setActiveSection] = useState("dashboard"); 
  const [transactions, setTransactions] = useState([]);
  const [userData, setUserData] = useState({
    name: "",
    email: ""
  });
  
  const [metrics, setMetrics] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    savingsRate: 0
  });

  const [profileSnapshot, setProfileSnapshot] = useState({
    age: "",
    phone: "",
    occupation: "",
    employmentType: "",
    city: "",
    dependents: "",
    monthlyIncome: "₹0",       
    monthlyExpenses: "₹0",      
    riskAppetite: "",
    investmentHorizon: "",
    financialGoal: ""
  });

  const [chatInput, setChatInput] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "ai", text: "Welcome to your financial intelligence nerve center. I have processed your risk parameters. What would you like to build or optimize today?" }
  ]);

  // FIX 1: Fetch profile values directly from MongoDB via GET API
  useEffect(() => {
    const loadUserAndProfile = async () => {
      const token = localStorage.getItem("token");
      const storedName = localStorage.getItem("userName") || "";
      const storedEmail = localStorage.getItem("userEmail") || "";

      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }

      setUserData({
        name: storedName,
        email: storedEmail
      });

      try {
        const config = {
          headers: { 
            "x-auth-token": token,
            "Authorization": `Bearer ${token}` 
          }
        };
        
        const res = await axios.get("https://wealth-ai-backend.onrender.com/api/profile", config);
        
        if (res.data && Object.keys(res.data).length > 0) {
          // Direct sync database fields matching your MongoDB Compass keys
          setProfileSnapshot({
            age: res.data.age || "Not Specified",
            phone: res.data.phone || "Not Provided",
            occupation: res.data.occupation || "Not Specified",
            employmentType: res.data.employmentType || "Not Specified",
            city: res.data.city || "Not Specified", 
            dependents: res.data.dependents || "0",
            monthlyIncome: res.data.monthlyIncome ? `₹${Number(res.data.monthlyIncome).toLocaleString("en-IN")}` : "₹0",
            monthlyExpenses: res.data.monthlyExpenses ? `₹${Number(res.data.monthlyExpenses).toLocaleString("en-IN")}` : "₹0",
            riskAppetite: res.data.riskTolerance || "Not Evaluated",
            investmentHorizon: res.data.investmentTimeline ? `${String(res.data.investmentTimeline).replace(/[\s]*Years/gi, "")} Years` : "Not Set",
            financialGoal: res.data.financialGoals || ""
          });

          // Sync calculation metrics state block values
          setMetrics(prev => ({
            ...prev,
            income: parseFloat(res.data.monthlyIncome) || 0,
            expenses: parseFloat(res.data.monthlyExpenses) || 0,
            balance: (parseFloat(res.data.monthlyIncome) || 0) - (parseFloat(res.data.monthlyExpenses) || 0)
          }));
        } else {
          navigate("/profile", { replace: true });
        }
      } catch (err) {
        console.log("Error querying database fields from server endpoint controller");
      }
    };

    loadUserAndProfile();
    const timer = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  useEffect(() => {
    if (!userData.email) return;
    
    const savedTransactions = JSON.parse(
      localStorage.getItem(`${userData.email}_transactions`)
    );

    if (savedTransactions) {
      setTransactions(savedTransactions);
    } else {
      setTransactions([]); 
    }
  }, [userData.email]);

  useEffect(() => {
    if (!userData.email) return;

    localStorage.setItem(
      `${userData.email}_transactions`,
      JSON.stringify(transactions)
    );
  }, [transactions, userData.email]);

  // Show 0 when no transactions have been added yet
  useEffect(() => {
    if (!userData.email) return;

    let computedIncome = 0;
    let computedExpenses = 0;

    if (transactions && transactions.length > 0) {
      transactions.forEach((tx) => {
        const amount = parseFloat(tx.amount) || 0;
        if (tx.type?.toLowerCase() === "income" || tx.category?.toLowerCase() === "income") {
          computedIncome += amount;
        } else {
          computedExpenses += amount;
        }
      });
    }

    // No transactions = show zeroes. Do NOT fall back to profile income/expenses.
    const computedBalance = computedIncome - computedExpenses;
    let computedSavingsRate = 0;

    if (computedIncome > 0) {
      computedSavingsRate = ((computedIncome - computedExpenses) / computedIncome) * 100;
      if (computedSavingsRate < 0) computedSavingsRate = 0;
    }

    setMetrics({
      balance: computedBalance,
      income: computedIncome,
      expenses: computedExpenses,
      savingsRate: parseFloat(computedSavingsRate.toFixed(1))
    });
  }, [transactions, userData.email]);

  const handleSaveTransaction = (newTx) => {
    if (Array.isArray(newTx)) {
      setTransactions(prev => [...prev, ...newTx]);
    } else {
      setTransactions(prev => [...prev, newTx]);
    }
    setIsTransactionOpen(false);
  };

  const handleManualSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const rawIncome = String(profileSnapshot.monthlyIncome || "0");
      const rawExpenses = String(profileSnapshot.monthlyExpenses || "0");
      const rawHorizon = String(profileSnapshot.investmentHorizon || "0");

      const cleanIncome = rawIncome.replace(/[₹,]/g, "");
      const cleanExpenses = rawExpenses.replace(/[₹,]/g, "");
      const cleanHorizon = rawHorizon.replace(/[^0-9]/g, "");

      const payload = {
        name: userData.name,
        age: profileSnapshot.age,
        phone: profileSnapshot.phone,
        occupation: profileSnapshot.occupation,
        employmentType: profileSnapshot.employmentType,
        city: profileSnapshot.city,
        dependents: profileSnapshot.dependents,
        monthlyIncome: cleanIncome,
        monthlyExpenses: cleanExpenses,
        riskTolerance: profileSnapshot.riskAppetite,
        investmentTimeline: cleanHorizon,
        financialGoals: profileSnapshot.financialGoal,
        profileCompleted: true
      };

      await axios.post(
        "https://wealth-ai-backend.onrender.com/api/profile",
        payload,
        { 
          headers: { 
            "x-auth-token": token,
            "Authorization": `Bearer ${token}`
          } 
        }
      );

      alert("Saved successfully!");
    } catch (error) {
      alert(error.response?.data?.msg || "Failed to backup parameters online");
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin", { replace: true });
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsReadingFile(true);
    const reader = new FileReader();
    const isText = file.type.startsWith("text/") || 
                   /\.(txt|csv|json|md|js|html|xml|ini|cfg)$/i.test(file.name);

    reader.onload = (event) => {
      setAttachedFile({
        name: file.name,
        size: formatBytes(file.size),
        type: file.type,
        content: isText ? event.target.result : null,
        isText: isText
      });
      setIsReadingFile(false);
    };

    reader.onerror = () => {
      alert("Error reading file");
      setIsReadingFile(false);
    };

    if (isText) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() && !attachedFile) return;

    const userText = chatInput;
    const currentFile = attachedFile;
    
    const userMsg = { 
      sender: "user", 
      text: userText || `Uploaded file: ${currentFile.name}`,
      file: currentFile ? { name: currentFile.name, size: currentFile.size } : null
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setAttachedFile(null);

    const loadingId = Date.now();
    setChatMessages(prev => [...prev, { sender: "ai", text: "Analyzing parameter matrix...", isLoading: true, id: loadingId }]);

    try {
      const token = localStorage.getItem("token");
      
      let apiMessage = userText;
      if (currentFile) {
        if (currentFile.isText && currentFile.content) {
          apiMessage = `[Attached Document: ${currentFile.name}]\nContent:\n${currentFile.content}\n\nUser Query: ${userText || "Please analyze this document."}`;
        } else {
          apiMessage = `[Attached Document (Binary): ${currentFile.name} of size ${currentFile.size}]\n\nUser Query: ${userText || "Please analyze this file."}`;
        }
      }

      const res = await axios.post(
        "https://wealth-ai-backend.onrender.com/api/chat",
        {
          message: apiMessage,
          userProfile: profileSnapshot 
        },
        {
          headers: {
            "x-auth-token": token,
            "Authorization": `Bearer ${token}`
          }
        }
      );

      setChatMessages(prev => 
        prev.map(msg => msg.id === loadingId ? { sender: "ai", text: res.data.reply } : msg)
      );

    } catch (error) {
      console.error("Chat failure:", error);
      setChatMessages(prev => 
        prev.map(msg => msg.id === loadingId ? { sender: "ai", text: "I ran into a telemetry link error. Please check your network credentials gateway link." } : msg)
      );
    }
  };

   const filteredTransactions = (() => {
    if (!transactions || transactions.length === 0) return [];

    const dates = transactions.map(tx => new Date(tx.date));
    const latestDate = new Date(Math.max(...dates));

    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      switch (selectedPeriod) {
        case "last_30_days":
          return txDate >= new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate() - 30);
        case "last_3_months":
          return txDate >= new Date(latestDate.getFullYear(), latestDate.getMonth() - 3, latestDate.getDate());
        case "last_6_months":
          return txDate >= new Date(latestDate.getFullYear(), latestDate.getMonth() - 6, latestDate.getDate());
        case "last_year":
          return txDate >= new Date(latestDate.getFullYear() - 1, latestDate.getMonth(), latestDate.getDate());
        default:
          return true;
      }
    });
  })();

  // Only compute from actual transactions, not profile fallback
  let totalIncome = 0;
  let totalExpenses = 0;

  if (filteredTransactions.length > 0) {
    filteredTransactions.forEach(tx => {
      const amount = parseFloat(String(tx.amount).replace(/[₹,]/g, "")) || 0;
      const typeNormalized = (tx.type || "").toLowerCase().trim();
      const catNormalized = (tx.category || "").toLowerCase().trim();
      
      if (typeNormalized === "income" || catNormalized === "income") {
        totalIncome += amount;
      } else {
        totalExpenses += amount;
      }
    });
  }
  // No transactions → all zeroes

  const calculatedBalance = totalIncome - totalExpenses;
  let calculatedSavingsRate = 0;

  if (totalIncome > 0 && totalIncome >= totalExpenses) {
    calculatedSavingsRate = ((calculatedBalance / totalIncome) * 100);
  }

  const liveMetrics = {
    balance: calculatedBalance,
    income: totalIncome,
    expenses: totalExpenses,
    savingsRate: calculatedSavingsRate.toFixed(1)
  };

  const getTimelineData = () => {
    if (filteredTransactions.length === 0) {
      return [{ name: "Current Month", Income: totalIncome, Expenses: totalExpenses }];
    }

    const sorted = [...filteredTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let runningIncome = 0;
    let runningExpenses = 0;

    return sorted.map((tx) => {
      const amt = parseFloat(String(tx.amount).replace(/[₹,]/g, "")) || 0;
      const typeNormalized = (tx.type || "").toLowerCase().trim();
      const catNormalized = (tx.category || "").toLowerCase().trim();

      if (typeNormalized === "income" || catNormalized === "income") {
        runningIncome += amt;
      } else {
        runningExpenses += amt;
      }

      return {
        name: new Date(tx.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        Income: runningIncome,
        Expenses: runningExpenses
      };
    });
  };

  const getDoughnutData = () => {
    if (filteredTransactions.length === 0) {
      return [{ name: "Profile Expenses Base", value: totalExpenses, fillColor: "#ef4444" }];
    }
    const categories = {};
    filteredTransactions.forEach(tx => {
      const typeNormalized = (tx.type || "").toLowerCase().trim();
      const catNormalized = (tx.category || "").toLowerCase().trim();
      
      if (typeNormalized !== "income" && catNormalized !== "income") {
        const cat = tx.category || "Other";
        categories[cat] = (categories[cat] || 0) + (parseFloat(String(tx.amount).replace(/[₹,]/g, "")) || 0);
      }
    });

    const chartArray = Object.keys(categories).map(key => ({
      name: key,
      value: categories[key]
    }));

    return chartArray.length > 0 ? chartArray : [{ name: "No Expenses", value: 1, fillColor: "#e2e8f0" }];
  };

  const PIE_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="dashboard-root-layout">
      <div className="ambient-blur-one"></div>
      <div className="ambient-blur-two"></div>

      {showToast && <div className="success-toast">Welcome back</div>}

      <aside className="fixed-sidebar-container">
        <div className="sidebar-brand-area">
          <div className="logo-main">Wealth<span>AI</span></div>
        </div>
        <nav className="sidebar-navigation-links">
          <div className={`nav-link-item ${activeSection === "dashboard" ? "active" : ""}`} onClick={() => setActiveSection("dashboard")}>
            <LayoutDashboard size={18} /> <span>Dashboard</span>
          </div>
          <div className={`nav-link-item ${activeSection === "advisor" ? "active" : ""}`} onClick={() => setActiveSection("advisor")}>
            <MessageSquareCode size={18} /> <span>AI advisor</span>
          </div>
          <div className={`nav-link-item ${activeSection === "loans" ? "active" : ""}`} onClick={() => setActiveSection("loans")}>
            <Landmark size={18} /> <span>Loans&Investments</span>
          </div>
          
          {/* FIXED: Changed active state tracker and onClick from "properties" to "assets" to match the component triggers */}
          <div className={`nav-link-item ${activeSection === "assets" ? "active" : ""}`} onClick={() => setActiveSection("assets")}>
            <Building2 size={18} /> <span>Assets</span>
          </div>
        </nav>
        
        <div 
          className={`sidebar-user-footer ${activeSection === "profile" ? "active" : ""}`} 
          onClick={() => setActiveSection("profile")}
          style={{ cursor: "pointer" }}
        >
          <div className="user-avatar-circle">
            {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="user-detail-meta">
            <span className="name">{userData.name || "User"}</span>
            <span className="email">{userData.email || "Validating..."}</span>
          </div>
        </div>
      </aside>

      <main className="dashboard-main-content">
        
        {activeSection === "dashboard" && (
          <>
            <header className="workspace-action-header">
              <div className="header-greeting-box">
                <p>Dashboard</p>
                <h2>Hi {userData.name || "User"}</h2>
                <p>Your active capital parameters are loaded</p>
              </div>

              <div className="header-controls-group">
                <div className="select-dropdown-style">
                  <Calendar size={14} />
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    <option value="all">All Data</option>
                    <option value="last_30_days">Last 30 days</option>
                    <option value="last_3_months">Last 3 months</option>
                    <option value="last_6_months">Last 6 months</option>
                    <option value="last_year">Last year</option>
                  </select>
                </div>

                <button
                  className="primary-action-btn"
                  onClick={() => setIsTransactionOpen(true)}
                >
                  <Plus size={16}/>
                  <span>Add Transaction</span>
                </button>
              </div>
            </header>

            <section className="metrics-summary-grid">
              <div className="metric-card-item">
                <span className="metric-label">AVAILABLE BALANCE</span>
                <h3 className="metric-value">₹{metrics.balance.toLocaleString("en-IN")}</h3>
              </div>
              <div className="metric-card-item">
                <span className="metric-label">TOTAL INCOME</span>
                <h3 className="metric-value success">₹{metrics.income.toLocaleString("en-IN")}</h3>
              </div>
              <div className="metric-card-item">
                <span className="metric-label">TOTAL EXPENSES</span>
                <h3 className="metric-value danger">₹{metrics.expenses.toLocaleString("en-IN")}</h3>
              </div>
              <div className="metric-card-item">
                <span className="metric-label">SAVINGS RATE</span>
                <h3 className="metric-value interest">{metrics.savingsRate}%</h3>
              </div>
            </section>
            <section className="charts-visual-container">
              <div className="chart-card-wrapper area-timeline-card">
                <h4>Income vs Expense Analysis</h4>
                <div className="recharts-responsive-container-box">
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={getTimelineData()}>
                      <defs>
                        <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="expenseColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="Income" stroke="#10b981" fillOpacity={1} fill="url(#incomeColor)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#expenseColor)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card-wrapper pie-allocation-card">
                <h4>Expense by Category</h4>
                <div className="recharts-responsive-container-box pie-layout-box">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={getDoughnutData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {getDoughnutData().map((entry, index) => (
                          /* FIXED: Updated entry.color to entry.fillColor to match data engine maps */
                          <Cell key={`cell-${index}`} fill={entry.fillColor || PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-custom-legends">
                    {getDoughnutData().slice(0, 3).map((item, idx) => (
                      <div className="legend-row-item" key={idx}>
                        {/* FIXED: Updated item.color to item.fillColor for baseline style loading */}
                        <span className="legend-dot" style={{ backgroundColor: item.fillColor || PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                        <span className="legend-name">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          <section className="transactions-ledger-panel" id="transactions-report-section">
              <div className="panel-header-sub">
                <h4>Transaction Records</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="total-tx-count">{filteredTransactions.length} Active Lines</span>
                  {filteredTransactions.length > 0 && (
                    <button
                      className="print-report-btn"
                      onClick={() => window.print()}
                      title="Download / Print Report"
                    >
                      ⬇ Download Report
                    </button>
                  )}
                </div>
              </div>
              <div className="table-responsive-wrapper">
                {filteredTransactions.length === 0 ? (
                  <div className="empty-ledger-state">
                    <Compass size={28} />
                    <p>No Transactions yet</p>
                  </div>
                ) : (
                  <table className="ledger-data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Reference Element</th>
                        <th>Category</th>
                        <th>Vector</th>
                        <th style={{ textAlign: "right" }}>Quantum Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx, idx) => {
                        // Normalize the string type to avoid case sensitivity bugs
                        const txTypeLower = (tx.type || "").toLowerCase().trim();
                        const isIncome = txTypeLower === "income";

                        return (
                          <tr key={idx}>
                            <td>{new Date(tx.date).toLocaleDateString("en-IN")}</td>
                            <td className="bold-desc">{tx.description}</td>
                            <td><span className="table-badge-cat">{tx.category}</span></td>
                            <td>
                              {/* FIXED: Using clean lowercase checker variable */}
                              <span className={`vector-badge ${isIncome ? "inflow" : "outflow"}`}>
                                {isIncome ? "Inflow Stream" : "Settlement"}
                              </span>
                            </td>
                            {/* FIXED: Using clean lowercase checker variable */}
                            <td className={`quantum-cell ${isIncome ? "success" : "danger"}`} style={{ textAlign: "right" }}>
                              {isIncome ? "+" : "-"} ₹{parseFloat(tx.amount).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </>
        )}

        {/* AI ADVISOR SECTION */}
        {activeSection === "advisor" && (
          <div className="ai-copilot-interface-wrapper">
            <div className="copilot-header-panel">
              <h3>AI advisor</h3>
            </div>
            <div className="chat-stream-viewport">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-bubble-row ${msg.sender}`}>
                  <div className="avatar-indicator">{msg.sender === "ai" ? "AI" : "UX"}</div>
                  <div className="bubble-payload-wrapper">
                    {msg.file && (
                      <div className="chat-message-file-card">
                        <FileText size={18} className="file-icon" />
                        <div className="file-meta">
                          <span className="file-name">{msg.file.name}</span>
                          <span className="file-size">{msg.file.size}</span>
                        </div>
                      </div>
                    )}
                    <div className="bubble-payload-content">{msg.text}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="chat-input-container-wrapper">
              <form className="chat-input-bar-modern" onSubmit={handleSendMessage}>
                {/* File upload — LEFT side of input bar */}
                <input 
                  type="file" 
                  id="chatbot-file-upload" 
                  style={{ display: "none" }} 
                  onChange={handleFileChange}
                />
                <label htmlFor="chatbot-file-upload" className="attachment-trigger-btn" title="Upload document">
                  <Paperclip size={18} />
                </label>

                <div className="input-text-area-wrapper">
                  {attachedFile && (
                    <div className="file-preview-chip">
                      <FileText size={14} className="chip-icon" />
                      <div className="chip-meta">
                        <span className="chip-name">{attachedFile.name}</span>
                        <span className="chip-size">{attachedFile.size}</span>
                      </div>
                      <button 
                        type="button" 
                        className="chip-remove-btn" 
                        onClick={() => setAttachedFile(null)}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  <input 
                    type="text" 
                    placeholder={isReadingFile ? "Reading document..." : "Message WealthAI..."}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isReadingFile}
                  />
                </div>

                {/* Send button — RIGHT side */}
                <button 
                  type="submit" 
                  className={`chat-send-btn-circle ${(chatInput.trim() || attachedFile) ? 'active' : ''}`}
                  disabled={!(chatInput.trim() || attachedFile) || isReadingFile}
                >
                  <ArrowUp size={18} />
                </button>
              </form>
            </div>
          </div>
        )}
        
        {/* ASSET YIELDS PROFILE */}
        {activeSection === "loans" && (
          <div className="real-estate-section-wrapper" style={{ width: '100%' }}>
            {/* Renders your complete interactive calculator dashboard directly inside this tab */}
            <LoansAndInvestments />
          </div>
        )}

                {/* ASSETS TRACKING VIEW PANEL */}
        {activeSection === "assets" && (
          <div className="real-estate-section-wrapper" style={{ width: '100%' }}>
            {/* FIXED: Passed the profileSnapshot state as a prop to satisfy assets.js constraints */}
            <Assets profile={profileSnapshot} />
          </div>
        )}


        {/* PROFILE CARD TAB VIEW - DYNAMIC FROM PROFILE SETUP LOCALSTORAGE SCREEN */}
        {activeSection === "profile" && (
          <div className="yields-section-wrapper">
            <div className="section-title-blurb" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3>My Profile</h3>
                <p>Review and track your holistic structural account dimensions below.</p>
              </div>
              <button
                className="edit-profile-btn"
                onClick={() => {
                  sessionStorage.setItem("justLoggedIn", "true");
                  navigate("/profile");
                }}
              >
                ✏ Edit Profile
              </button>
            </div>
            
            <div className="yields-metric-cards-subgrid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              <div className="yield-card-metric">
                <span className="sub-lbl"><User size={14} style={{ display: "inline", marginRight: "6px" }} /> Age Context</span>
                <h3>{profileSnapshot.age}</h3>
              </div>
              <div className="yield-card-metric">
                <span className="sub-lbl"><Briefcase size={14} style={{ display: "inline", marginRight: "6px" }} /> Occupation / Role</span>
                <h3>{profileSnapshot.occupation}</h3>
              </div>
              <div className="yield-card-metric">
                <span className="sub-lbl"><BriefcaseBusiness size={14} style={{ display: "inline", marginRight: "6px" }} /> Employment Nature</span>
                <h3>{profileSnapshot.employmentType}</h3>
              </div>
              <div className="yield-card-metric">
                <span className="sub-lbl"><MapPin size={14} style={{ display: "inline", marginRight: "6px" }} /> City Geolocation</span>
                <h3>{profileSnapshot.city}</h3>
              </div>
              <div className="yield-card-metric">
                <span className="sub-lbl">Monthly Income</span>
                <h3>{profileSnapshot.displayIncome || profileSnapshot.monthlyIncome}</h3>
              </div>
              <div className="yield-card-metric">
                <span className="sub-lbl">Monthly Expenses</span>
                <h3>{profileSnapshot.displayExpenses || profileSnapshot.monthlyExpenses}</h3>
              </div>
              <div className="yield-card-metric">
                <span className="sub-lbl">Registered Dependents</span>
                <h3>{profileSnapshot.dependents} Units</h3>
              </div>
              <div className="yield-card-metric">
                <span className="sub-lbl">Risk Strategy</span>
                <h3 style={{ textTransform: "capitalize" }}>{profileSnapshot.riskAppetite}</h3>
              </div>
              <div className="yield-card-metric">
                <span className="sub-lbl"><CalendarDays size={14} style={{ display: "inline", marginRight: "6px" }} /> Horizon Metric</span>
                <h3>{profileSnapshot.investmentHorizon}</h3>
              </div>
            </div>

            {/* DYNAMIC SHOW FOR FINANCIAL GOALS CARD */}
            {profileSnapshot.financialGoal && profileSnapshot.financialGoal !== "Not Set" && (
              <div className="yield-card-metric" style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ backgroundColor: "#eff6ff", padding: "12px", borderRadius: "8px", color: "#2563eb" }}>
                  <Target size={24} />
                </div>
                <div>
                  <span className="sub-lbl" style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: "600", color: "#64748b" }}>Primary Stated Financial Goal</span>
                  <h3 style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>{profileSnapshot.financialGoal}</h3>
                </div>
              </div>
            )}

            <div className="logout-container">
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={18}/>
                Logout
              </button>
            </div>
          </div>
        )}

      </main>

      {/* FLOATING ADD TRANSACTION MODAL */}
      {isTransactionOpen && (
        <AddTransactionModal 
          isOpen={isTransactionOpen}
          onClose={() => setIsTransactionOpen(false)} 
          onSave={handleSaveTransaction} 
        />
      )}
    </div>
  );
}

export default Homepage;
