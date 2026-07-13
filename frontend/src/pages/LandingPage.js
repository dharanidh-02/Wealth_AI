import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  TrendingUp, 
  Wallet, 
  Home, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* HERO SECTION */}
      <header className="hero">
        <div className="hero-content">
          <div className="hero-left">
            <div className="badge">
              <Sparkles size={14} className="badge-icon" />
              <span>Next-Gen Financial Intelligence</span>
            </div>
            <h1>
              AI-Powered Financial <br />
              <span>Advisor</span>
            </h1>
            <p className="hero-desc">
              Get smarter insights on savings, loans, and investments. Outmaneuver market changes based on your unique financial profile and career trajectory.
            </p>
            <div className="hero-cta-group">
              <button className="primary-btn" onClick={() => navigate("/signup")}>
                Start Free Trial <ArrowRight size={18} />
              </button>
              <button className="secondary-btn" onClick={() => navigate("/signin")}>
                Book a Demo
              </button>
            </div>
            <div className="hero-trust">
              <div className="trust-item"><CheckCircle2 size={16} /> Bank-Grade Security</div>
              <div className="trust-item"><CheckCircle2 size={16} /> No Credit Card Required</div>
            </div>
          </div>
          
          <div className="hero-right">
            {/* Mock Dashboard UI Graphic */}
            <div className="dashboard-mockup">
              <div className="mockup-header">
                <span className="dot"></span><span className="dot"></span><span className="dot"></span>
              </div>
              <div className="mockup-body">
                <div className="mockup-balance">
                  <p>Total Asset Value</p>
                  <h3>$142,384.50</h3>
                  <span className="trend-up">+12.4% this month</span>
                </div>
                <div className="mockup-chart">
                  <div className="bar" style={{height: '40px'}}></div>
                  <div className="bar" style={{height: '70px'}}></div>
                  <div className="bar" style={{height: '55px'}}></div>
                  <div className="bar" style={{height: '90px'}}></div>
                  <div className="bar" style={{height: '110px'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <div className="section-header">
          <h2>Engineered for Wealth Creation</h2>
          <p>Everything you need to automate your finances, reduce debt, and build a lasting portfolio.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon-wrapper primary">
              <Sparkles size={24} />
            </div>
            <h3>Personalized AI Advisor</h3>
            <p>Get real-time tailored financial advice mapped explicitly to your income tax brackets and retirement goals.</p>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper success">
              <TrendingUp size={24} />
            </div>
            <h3>Smart Recommendations</h3>
            <p>Automated deployment modeling across PPF, NSC, low-cost mutual funds, and custom fixed deposits.</p>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper warning">
              <Wallet size={24} />
            </div>
            <h3>Expense Tracking</h3>
            <p>Deep-dive algorithmic classification of your expenditure habits with predictive cashflow warnings.</p>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper info">
              <Home size={24} />
            </div>
            <h3>Property Management</h3>
            <p>Easily track physical real estate equity, monitor rental yields, and discover optimization strategies.</p>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper purple">
              <BarChart3 size={24} />
            </div>
            <h3>Financial Dashboard</h3>
            <p>A unified, interactive Command Center displaying your real-time net worth and debt-to-income metrics.</p>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper danger">
              <ShieldCheck size={24} />
            </div>
            <h3>Secure & Private</h3>
            <p>Your records are shielded by AES-256 bank-level encryption, multi-factor gates, and strict zero-knowledge protocols.</p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-wrapper">
        <div className="cta-box">
          <h2>Take Control of Your Capital Today</h2>
          <p>Join over 40,000+ investors utilizing AI-driven engineering to maximize compounding returns.</p>
          <button className="cta-btn" onClick={() => navigate("/signup")}>
            Get Started Free <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">Wealth<span>AI</span></div>
            <p>Intelligent asset optimization systems for Everyone.</p>
          </div>
          <div className="footer-rights">
            <p>© 2026 WealthAI Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
