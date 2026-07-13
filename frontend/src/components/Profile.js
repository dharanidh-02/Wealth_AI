import React, { useState, useEffect } from "react";
import "./Profile.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function FinancialProfile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showFormOnly, setShowFormOnly] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // New flag to track if profile already exists on backend
  
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phone: "",
    occupation: "",
    employmentType: "salaried",
    city: "",
    dependents: "",
    monthlyIncome: "",
    monthlyExpenses: "",
    riskTolerance: "medium",
    investmentTimeline: "",
    financialGoals: "",
  });

  useEffect(() => {
    const checkUserProfileOnBackend = async () => {
      const token = localStorage.getItem("token");


      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }

      try {
        const config = {
          headers: { 
            "x-auth-token": token,
            "Authorization": `Bearer ${token}` 
          }
        };
        
        const res = await axios.get("https://wealth-ai-backend.onrender.com/api/profile", config);
        
        if (res.data && Object.keys(res.data).length > 0) {
          setIsEditing(true); // Flag setting: profile exists, so we update instead of create
          const justLoggedIn = sessionStorage.getItem("justLoggedIn");

          if (justLoggedIn !== "true") {
            navigate("/homepage", { replace: true });
            return;
          }

          // FIX: Maps backend values perfectly to form state inputs
          setFormData({
            name: res.data.name || localStorage.getItem("userName") || "",
            age: res.data.age || "",
            phone: res.data.phone || "",
            occupation: res.data.occupation || "",
            employmentType: res.data.employmentType || "salaried",
            city: res.data.city || "",
            dependents: res.data.dependents || "",
            monthlyIncome: res.data.monthlyIncome || "",
            monthlyExpenses: res.data.monthlyExpenses || "",
            riskTolerance: res.data.riskTolerance || "medium",
            investmentTimeline: res.data.investmentTimeline || "",
            financialGoals: res.data.financialGoals || "",
          });
        } else {
          setShowFormOnly(true);
        }
      } catch (err) {
        console.log("No profile on backend or error, moving to registration form");
        setShowFormOnly(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserProfileOnBackend();
  }, [navigate]);

  const handleGoToHome = () => {
    sessionStorage.removeItem("justLoggedIn");
    navigate("/homepage", { replace: true });
  };

  const handleCreateNewProfile = () => {
    sessionStorage.removeItem("justLoggedIn");
    setFormData({
      name: "",
      age: "",
      phone: "",
      occupation: "",
      employmentType: "salaried",
      city: "",
      dependents: "",
      monthlyIncome: "",
      monthlyExpenses: "",
      riskTolerance: "medium",
      investmentTimeline: "",
      financialGoals: "",
    });
    setIsEditing(false); // Creating a brand-new clean model profile sequence
    setShowFormOnly(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const userEmail = (localStorage.getItem("userEmail") || "user").toLowerCase().trim();

    const payload = {
      name: formData.name,
      age: formData.age,
      phone: formData.phone,
      occupation: formData.occupation,
      employmentType: formData.employmentType,
      city: formData.city,
      dependents: formData.dependents,
      monthlyIncome: formData.monthlyIncome,
      monthlyExpenses: formData.monthlyExpenses,
      riskTolerance: formData.riskTolerance,
      investmentTimeline: formData.investmentTimeline,
      financialGoals: formData.financialGoals,
      profileCompleted: true
    };

    try {
      const config = { 
        headers: { 
          "x-auth-token": token,
          "Authorization": `Bearer ${token}` 
        } 
      };

      // FIX: If profile already exists on backend, make a PUT request to update it instead of a POST request
      if (isEditing) {
        await axios.put("https://wealth-ai-backend.onrender.com/api/profile", payload, config);
      } else {
        await axios.post("https://wealth-ai-backend.onrender.com/api/profile", payload, config);
      }

      localStorage.setItem("userName", formData.name);
      localStorage.setItem(`${userEmail}_name`, formData.name);
      localStorage.setItem(`${userEmail}_age`, formData.age);
      localStorage.setItem(`${userEmail}_phone`, formData.phone);
      localStorage.setItem(`${userEmail}_occupation`, formData.occupation);
      localStorage.setItem(`${userEmail}_employmentType`, formData.employmentType);
      localStorage.setItem(`${userEmail}_city`, formData.city);
      localStorage.setItem(`${userEmail}_dependents`, formData.dependents);
      localStorage.setItem(`${userEmail}_totalIncome`, formData.monthlyIncome);
      localStorage.setItem(`${userEmail}_totalExpenses`, formData.monthlyExpenses);
      localStorage.setItem(`${userEmail}_riskTolerance`, formData.riskTolerance);
      localStorage.setItem(`${userEmail}_investmentHorizon`, formData.investmentTimeline);
      localStorage.setItem(`${userEmail}_financialGoal`, formData.financialGoals);

      alert("Profile Saved Successfully");
      navigate("/homepage", { replace: true });

    } catch (error) {
      alert(error.response?.data?.msg || "Error processing profile data payload");
    }
  };

  // FIX: Removed the "Checking database connection" fullscreen overlay message!
  if (isLoading) {
    return null; 
  }
  if (!showFormOnly) {
    return (
      <div className="welcome-container">
        <div className="welcome-card">
          <h1 className="welcome-title">Welcome Back</h1>
          <p className="welcome-subtitle">Please select an action layout option to continue.</p>

          <div className="selection-grid">
            <div className="option-box">
              <div className="option-content">
                <div className="option-icon">
                  <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: "24px", height: "24px" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                  </svg>
                </div>
                <h2 className="option-title">Already created</h2>
                <p className="option-description">Skip configuration steps and go straight to your live dashboard view.</p>
              </div>
              <button onClick={handleGoToHome} className="btn btn-primary">go to home</button>
            </div>

            <div className="option-box active-border">
              <div className="option-content">
                <div className="option-icon">
                  <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: "24px", height: "24px" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                  </svg>
                </div>
                <h2 className="option-title">create a new profile</h2>
                <p className="option-description">Overwrite parameter history logs and build a new configuration model.</p>
              </div>
              <button onClick={handleCreateNewProfile} className="btn btn-secondary">create</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-bg">
      <div className="profile-container form-view">
        <div className="form-header">
          <div className="meta-badge">PROFILE CONFIGURATION</div>
          <h2>Tell WealthAI about you.</h2>
          <p className="sub-instruction-text">
            These numbers stay with you. They power every suggestion we make — loans, schemes, EMI checks.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-box-grid">
            <div className="input-group full-width">
              <label>Full Name</label>
              <input type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} required />
            </div>
            
            <div className="input-group">
              <label>Age</label>
              <input type="number" name="age" placeholder="e.g. 25" value={formData.age} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Phone (optional)</label>
              <input type="text" name="phone" placeholder="+91..." value={formData.phone} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label>Occupation</label>
              <input type="text" name="occupation" placeholder="e.g. Software Engineer" value={formData.occupation} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Employment type</label>
              <div className="select-wrapper">
                <select name="employmentType" value={formData.employmentType} onChange={handleChange} required>
                  <option value="salaried">salaried</option>
                  <option value="self-employed">self-employed</option>
                  <option value="student">student</option>
                  <option value="unemployed">unemployed</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>City</label>
              <input type="text" name="city" placeholder="e.g. Mumbai" value={formData.city} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Dependents</label>
              <input type="number" name="dependents" placeholder="0" value={formData.dependents} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Monthly income (₹)</label>
              <input type="number" name="monthlyIncome" placeholder="0" value={formData.monthlyIncome} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Monthly expenses (₹)</label>
              <input type="number" name="monthlyExpenses" placeholder="0" value={formData.monthlyExpenses} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Risk appetite</label>
              <div className="select-wrapper">
                <select name="riskTolerance" value={formData.riskTolerance} onChange={handleChange} required>
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Investment horizon (years)</label>
              <input type="number" name="investmentTimeline" placeholder="e.g. 5" value={formData.investmentTimeline} onChange={handleChange} required />
            </div>

            <div className="input-group full-width">
              <label>Top financial goal (optional)</label>
              <input type="text" name="financialGoals" placeholder="Buy a 2BHK in 7 years" value={formData.financialGoals} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="form-submit-btn">Save & continue</button>
        </form>
      </div>
    </div>
  );
}

export default FinancialProfile;
