import React, { useState, useEffect, useRef } from "react";
import "./chatbot.css";

const Chatbot = ({ userName, profile }) => {
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState("start");
  const [loanType, setLoanType] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const initialized = useRef(false);

  // 1. DYNAMIC WELCOME GREETING WITH ACTIVE USERNAME
  useEffect(() => {
    if (!initialized.current && userName) {
      setMessages([
        {
          text: `Hi ${userName || "User"}, how can I help you today?`,
          isUser: false,
          link: "",
          bankName: ""
        }
      ]);
      initialized.current = true;
    }
  }, [userName]);

  // SMOOTH SCROLL CONTEXT TO NEWEST MESSAGE BLOCK
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // LOCAL BANK COMPARISON CONVERSATION REFERENCE MATRIX
  const bankData = {
    "SBI": { rate: "8.50% - 9.65%", tenure: "30 yrs", link: "https://sbi.co.in" },
    "HDFC Bank": { rate: "8.75% - 9.65%", tenure: "30 yrs", link: "https://hdfcbank.com" },
    "ICICI Bank": { rate: "8.75% onwards", tenure: "30 yrs", link: "https://icicibank.com" },
    "Axis Bank": { rate: "8.75% onwards", tenure: "30 yrs", link: "https://axisbank.com" },
    "Bank of Baroda": { rate: "8.40% onwards", tenure: "30 yrs", link: "https://bankofbaroda.in" },
    "PNB": { rate: "8.50% onwards", tenure: "30 yrs", link: "https://pnbindia.in" },
    "Canara Bank": { rate: "8.60% onwards", tenure: "30 yrs", link: "https://canarabank.com" },
    "Union Bank": { rate: "8.50% onwards", tenure: "30 yrs", link: "https://unionbankofindia.co.in" },
    "Kotak Bank": { rate: "8.70% onwards", tenure: "30 yrs", link: "https://kotak.com" },
    "Yes Bank": { rate: "9.25% onwards", tenure: "25 yrs", link: "https://yesbank.in" },
    "Ujjivan SFB": { rate: "12% onwards", tenure: "20 yrs", link: "https://ujjivansfb.in" },
    "Equitas SFB": { rate: "11% onwards", tenure: "20 yrs", link: "https://equitasbank.com" },
    "Jana SFB": { rate: "10.5% onwards", tenure: "20 yrs", link: "https://janabank.com" },
    "Kerala Gramin Bank": { rate: "8.5% onwards", tenure: "20 yrs", link: "https://keralagbank.com" },
    "Karnataka Gramin Bank": { rate: "8.6% onwards", tenure: "20 yrs", link: "https://karnatakagraminbank.com" },
    "AP Grameena Bank": { rate: "8.5% onwards", tenure: "20 yrs", link: "https://apgb.in" }
  };

  // FIXED PARAMETERS LAYER: Wipes out duplicate rupee strings safely before setting state
  function addBotMessage(text, link = "", bankName = "") {
    let cleanedText = text ? text.replace(/₹₹/g, "₹") : "";
    const newMsg = { text: cleanedText, isUser: false, link: link, bankName: bankName };
    setMessages(prev => [...prev, newMsg]);
  }

  // 2. DISPATCH PAYLOAD BACKEND SECURE COMMUNICATOR WITH TOKEN HEADER FIXED
  async function sendMessageToAI(userInput) {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("https://wealth-ai-backend.onrender.com/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ 
          message: userInput,
          userProfile: profile 
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.reply) {
        addBotMessage(data.reply);
      } else {
        addBotMessage(data.error || "Sorry, I encountered an error processing that statement.");
      }
    } catch (error) {
      console.error("API Link Error:", error);
      addBotMessage("Unable to reach the server. Please verify your Node server.js execution states on port 5000.");
    } finally {
      setIsLoading(false);
    }
  }

  function addUserMessage(text) {
    const newMsg = { text: text, isUser: true };
    setMessages(prev => [...prev, newMsg]);
    handleLogic(text);
  }
  // 3. HUMAN CONVERSATION LOGIC STEPS INTEGRATED SECURELY WITH FALLBACK TO AI
  function handleLogic(userInput) {
    const input = userInput.trim();
    const lowerInput = input.toLowerCase();

    // --- INTEGRATED NEW ADVANCED FEATURES (EMI, Eligibility, Credit Score, Schemes) ---
    if (lowerInput.includes("calculator") || lowerInput.includes("emi")) {
      addBotMessage("🧮 WealthAI EMI Calculator Quick Reference:\nFormula: [P x R x (1+R)^N]/[(1+R)^N-1]\n\nFor a personalized breakdown or step-by-step math computation graph, ask me: 'Calculate EMI for 5 Lakhs at 9% interest for 5 years' and Gemini will compute it for you!");
      return;
    }
    
    if (lowerInput.includes("eligibility") || lowerInput.includes("eligible")) {
      const income = profile?.monthlyIncome || "0";
      const expenses = profile?.monthlyExpenses || "0";
      addBotMessage(`📋 Loan Eligibility Assessment Mode:\nBased on your database profile, your Monthly Income is ₹${income} and Expenses are ₹${expenses}.\n\nStandard rules suggest your total EMIs shouldn't exceed 40%-50% of your net income. To check if you qualify for a specific amount, type: 'Am I eligible for a 10 Lakh home loan with my income?'`);
      return;
    }

    if (lowerInput.includes("credit score") || lowerInput.includes("cibil")) {
      addBotMessage("💳 Credit Score (CIBIL) Advice:\n- Keep utilization below 30%\n- Never miss repayment dates\n- Avoid applying for multiple loans simultaneously\n\nIf you want strategic techniques to repair an active low score, tell me: 'How do I raise my credit score quickly?'");
      return;
    }

    if (lowerInput.includes("scheme") || lowerInput.includes("government")) {
      addBotMessage("🏛️ Government Loan Schemes Hub:\n- PMAY (Pradhan Mantri Awas Yojana) for Housing\n- PMEGP for Business/Startup Setup\n- Vidyalakshmi Portal for Education Loans\n\nTo know which scheme matches your current parameters, ask me: 'Which government scheme can I get as an Embedded Engineer?'");
      return;
    }

    if (lowerInput.includes("comparison") || lowerInput.includes("compare")) {
      addBotMessage("📊 Loan Comparison Matrix Engine:\nYou can type: 'Public', 'Private', 'Rural', or 'Small Finance' right now to scroll through our hardcoded benchmark matrix. Or ask me to compare customized variables like: 'Compare SBI Home loan vs HDFC Home loan features'!");
      return;
    }

    if (lowerInput.includes("business")) {
      addBotMessage("💼 Business Loan Suggestions Factory:\n- SIDBI/Mudra Schemes (Micro & Small Enterprises)\n- CGTMSE Collateral-Free Pipeline\n\nAsk me: 'Suggest a startup business loan framework' to evaluate requirements!");
      return;
    }

    // --- MASTER CONFIGURATION BLUEPRINT WORKFLOW (STEPS 2 - 8) ---
    if (step === "start" && (lowerInput.includes("loan") || lowerInput.includes("apply"))) {
      setStep("loanType");
      setTimeout(() => {
        addBotMessage("Sure! Please type the type of loan you want.\n(e.g., Home Loan, Personal Loan, Education Loan)");
      }, 600);
    } 
    else if (step === "loanType") {
      setLoanType(input);
      setStep("bankCategory");
      setTimeout(() => {
        addBotMessage("Which type of bank do you prefer?\n\n- Public\n- Private\n- Rural\n- Small Finance");
      }, 600);
    }
    else if (step === "bankCategory" && (lowerInput.includes("public") || lowerInput.includes("private") || lowerInput.includes("rural") || lowerInput.includes("small finance"))) {
      setStep("bankSelect");
      let banksText = "";
      if (lowerInput.includes("public")) {
        banksText = "Sure! Here are some Public Banks listed below:\n\ni) SBI\nii) PNB\niii) Bank of Baroda\niv) Canara Bank\nv) Union Bank";
      } else if (lowerInput.includes("private")) {
        banksText = "Sure! Here are some Private Banks listed below:\n\ni) HDFC Bank\nii) ICICI Bank\niii) Axis Bank\niv) Kotak Bank\nv) Yes Bank";
      } else if (lowerInput.includes("rural")) {
        banksText = "Sure! Here are some Rural Banks listed below:\n\ni) Kerala Gramin Bank\nii) Karnataka Gramin Bank\niii) AP Grameena Bank";
      } else {
        banksText = "Sure! Here are some Small Finance Banks listed below:\n\ni) Ujjivan SFB\nii) Equitas SFB\niii) Jana SFB";
      }
      setTimeout(() => {
        addBotMessage(banksText + "\n\nPlease type the name of the bank to see details.");
      }, 600);
    }
    else if (step === "bankSelect" && bankData[input]) {
      showBankDetails(input);
    }
    // --- STEPS 9 & 10: DYNAMIC FALLBACK INTEGRATION STRAIGHT TO GEMINI AI LAYER ---
    else {
      sendMessageToAI(input);
    }
  }

  function showBankDetails(bank) {
    const info = bankData[bank];
    if (info) {
      const details = `🏦 ${bank} ${loanType}\n\n✔ Interest: ${info.rate}\n✔ Max Tenure: ${info.tenure}\n\nFor more details visit the official site:`;
      setTimeout(() => {
        addBotMessage(details, info.link, bank);
        setStep("start"); // Clean layout resets back to start
      }, 600);
    } else {
      sendMessageToAI(bank);
    }
  }

  const handleSend = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      addUserMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="embedded-chatbot-workspace">
      {/* Scrollable Conversation Matrix Workspace Area */}
      <div className="chat-body-stream">
        {messages.map((msg, i) => {
          let cleanLines = [];
          if (msg.text) {
            // Regex to smartly force break on list items if AI missed newlines
            cleanLines = msg.text
              .replace(/([0-9]+\.\s+[A-Za-z])/g, "\n$1")
              .replace(/([a-z]\.\s+[A-Za-z])/g, "\n$1")
              .split("\n");
          }

          return (
            <div key={i} className={`chat-row ${msg.isUser ? "user-row" : "bot-row"}`}>
              {!msg.isUser && <div className="ai-avatar-badge">AI</div>}
              
              <div className="message-text-bubble">
                {cleanLines.map((line, index) => {
                  if (!line.trim()) return null;
                  const isListItem = /^\s*(\d+\.|[a-z]\.|[i|v|x]+\)|✔)/i.test(line.trim());
                  
                  return (
                    <span 
                      key={index} 
                      style={{ 
                        display: "block", 
                        marginBottom: isListItem ? "10px" : "4px",
                        paddingLeft: isListItem ? "18px" : "0px",
                        textIndent: isListItem ? "-18px" : "0px",
                        lineHeight: "1.6",
                        textAlign: "left"
                      }}
                    >
                      {line}
                    </span>
                  );
                })}
                
                {/* RETAINED ANCHOR ACTION BLOCK TO RENDER REDIRECT EXTERNAL LINKS */}
                {!msg.isUser && msg.link && (
                   <div className="link-box" style={{ marginTop: "12px" }}>
                     <a 
                       href={msg.link} 
                       target="_blank" 
                       rel="noreferrer" 
                       className="visit-btn"
                       style={{ display: "inline-block", color: "#3b82f6", textDecoration: "underline", fontWeight: "500" }}
                     >
                       Visit {msg.bankName} Official Site ↗
                     </a>
                   </div>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="chat-row bot-row">
            <div className="ai-avatar-badge">AI</div>
            <div className="message-text-bubble loading-dots">
              <p>Thinking...</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Persistent Static Form Controls Field Bar */}
      <form onSubmit={handleSend} className="chat-input-wrapper-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Query market execution strategies, asset re-balancing algorithms..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !inputValue.trim()}>
          ➔
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
