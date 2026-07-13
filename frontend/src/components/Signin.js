import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import "../components/auth.css";

function Signin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://wealth-ai-backend.onrender.com/api/auth/login",
        form
      );

      const user = res.data.user;

      // token save
      localStorage.setItem("token", res.data.token);

      // full user object save
      localStorage.setItem("user", JSON.stringify(user));

      // profile details save
      localStorage.setItem("userName", user.name || "");
      localStorage.setItem("userEmail", user.email || "");
      localStorage.setItem("age", user.age || "");
      localStorage.setItem("phone", user.phone || "");
      localStorage.setItem("occupation", user.occupation || "");
      localStorage.setItem("employmentType", user.employmentType || "");
      localStorage.setItem("city", user.city || "");
      localStorage.setItem("dependents", user.dependents || "");
      localStorage.setItem("totalIncome", user.monthlyIncome || "");
      localStorage.setItem("totalExpenses", user.monthlyExpenses || "");
      localStorage.setItem("riskTolerance", user.riskTolerance || "");
      localStorage.setItem("investmentHorizon", user.investmentTimeline || "");
      localStorage.setItem("financialGoal", user.financialGoals || "");

      // Sync specific email keys with Homepage component expectations
      if (user.email) {
        localStorage.setItem(`${user.email}_age`, user.age || "");
      }

      // FIXED: Set session indicator flag to tell Profile component to display block panels
      sessionStorage.setItem("justLoggedIn", "true");

      alert("Login successful!");

      // Lands on the profile choices selection panel first
      navigate("/profile");

    } catch (err) {
      alert(
        err.response?.data?.msg ||
        "Invalid credentials"
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <input className="auth-input" name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
          <input className="auth-input" name="password" type="password" placeholder="Password" onChange={handleChange} required />
          <button className="auth-button">Sign In</button>
        </form>
        <div className="social-divider"></div>
        <div className="social-icons-wrapper">
          <a href="https://wealth-ai-backend.onrender.com/api/auth/google" className="social-icon-btn google"><FaGoogle /></a>
          <a href="https://wealth-ai-backend.onrender.com/api/auth/facebook" className="social-icon-btn facebook"><FaFacebookF /></a>
        </div>
        <div className="auth-footer">
          Don't have an account? <Link to="/signup" className="auth-link"> Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Signin;
