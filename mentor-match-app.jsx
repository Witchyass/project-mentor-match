import React, { useState, useEffect, createContext, useContext } from 'react';

// ============================================
// THEME CONTEXT
// ============================================
const ThemeContext = createContext();

const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const toggleTheme = () => setIsDark(!isDark);
  
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ============================================
// MAIN APP WITH ROUTING
// ============================================
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  
  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <ThemeProvider>
      <AppContent currentPage={currentPage} navigate={navigate} />
    </ThemeProvider>
  );
};

const AppContent = ({ currentPage, navigate }) => {
  const { isDark } = useTheme();
  
  const renderPage = () => {
    switch(currentPage) {
      case 'home': return <HomePage navigate={navigate} />;
      case 'discover': return <DiscoverPage navigate={navigate} />;
      case 'help': return <HelpPage navigate={navigate} />;
      case 'login': return <LoginPage navigate={navigate} />;
      case 'register': return <RegisterPage navigate={navigate} />;
      default: return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`}>
      <GlobalStyles />
      {renderPage()}
    </div>
  );
};

// ============================================
// GLOBAL STYLES
// ============================================
const GlobalStyles = () => {
  const { isDark } = useTheme();
  
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      html {
        scroll-behavior: smooth;
      }

      :root {
        --gradient-start: #6366f1;
        --gradient-end: #8b5cf6;
        --gradient: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
        --accent: #06b6d4;
        --success: #10b981;
        --warning: #f59e0b;
        --error: #ef4444;
        --info: #3b82f6;
      }

      .app.dark {
        --bg-primary: #0f0f1a;
        --bg-secondary: #1a1a2e;
        --bg-tertiary: #25253d;
        --bg-card: rgba(255, 255, 255, 0.05);
        --text-primary: #ffffff;
        --text-secondary: rgba(255, 255, 255, 0.7);
        --text-tertiary: rgba(255, 255, 255, 0.5);
        --border: rgba(255, 255, 255, 0.1);
        --shadow: rgba(0, 0, 0, 0.5);
      }

      .app.light {
        --bg-primary: #ffffff;
        --bg-secondary: #f8fafc;
        --bg-tertiary: #f1f5f9;
        --bg-card: #ffffff;
        --text-primary: #0f172a;
        --text-secondary: #475569;
        --text-tertiary: #94a3b8;
        --border: rgba(0, 0, 0, 0.08);
        --shadow: rgba(0, 0, 0, 0.08);
      }

      .app {
        font-family: 'Sora', sans-serif;
        background: var(--bg-primary);
        color: var(--text-primary);
        min-height: 100vh;
        transition: background 0.3s, color 0.3s;
      }

      /* Shared Navigation Styles */
      .nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        padding: 20px 60px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.4s;
      }

      .nav.scrolled {
        background: var(--bg-primary);
        backdrop-filter: blur(20px);
        padding: 14px 60px;
        border-bottom: 1px solid var(--border);
        box-shadow: 0 4px 20px var(--shadow);
      }

      .logo {
        font-size: 26px;
        font-weight: 800;
        cursor: pointer;
        letter-spacing: -1px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .logo-icon {
        width: 36px;
        height: 36px;
        background: var(--gradient);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      }

      .logo-text {
        background: var(--gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .nav-links {
        display: flex;
        gap: 40px;
        align-items: center;
      }

      .nav-link {
        text-decoration: none;
        color: var(--text-secondary);
        font-weight: 500;
        font-size: 14px;
        cursor: pointer;
        transition: color 0.3s;
        background: none;
        border: none;
        font-family: inherit;
      }

      .nav-link:hover {
        color: var(--text-primary);
      }

      .nav-btn {
        background: var(--gradient);
        color: white;
        border: none;
        padding: 12px 28px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;
        font-family: inherit;
      }

      .nav-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
      }

      .nav-btn.ghost {
        background: transparent;
        border: 2px solid var(--border);
        color: var(--text-primary);
      }

      .nav-btn.ghost:hover {
        border-color: var(--text-secondary);
        box-shadow: none;
      }

      /* Theme Toggle */
      .theme-toggle {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 18px;
        transition: all 0.3s;
      }

      .theme-toggle:hover {
        background: var(--bg-tertiary);
        transform: rotate(15deg);
      }

      /* Buttons */
      .btn-primary {
        background: var(--gradient);
        color: white;
        border: none;
        padding: 16px 36px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s;
        font-family: inherit;
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .btn-primary:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 40px rgba(99, 102, 241, 0.4);
      }

      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .btn-secondary {
        background: var(--bg-card);
        color: var(--text-primary);
        border: 2px solid var(--border);
        padding: 14px 32px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s;
        font-family: inherit;
      }

      .btn-secondary:hover {
        border-color: var(--text-secondary);
        transform: translateY(-3px);
      }

      /* Form Inputs */
      .input-group {
        margin-bottom: 20px;
      }

      .input-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        font-size: 14px;
        color: var(--text-secondary);
      }

      .input-group input, .input-group select {
        width: 100%;
        padding: 16px 20px;
        border-radius: 12px;
        border: 2px solid var(--border);
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-size: 16px;
        font-family: inherit;
        transition: all 0.3s;
      }

      .input-group input:focus, .input-group select:focus {
        outline: none;
        border-color: var(--gradient-start);
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
      }

      .input-group input::placeholder {
        color: var(--text-tertiary);
      }

      /* Tags */
      .tag {
        display: inline-block;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        background: var(--bg-tertiary);
        color: var(--text-secondary);
        margin: 4px;
      }

      .tag.primary {
        background: rgba(99, 102, 241, 0.15);
        color: var(--gradient-start);
      }

      /* Animation Keyframes */
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideIn {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.05); }
      }

      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }

      /* Responsive */
      @media (max-width: 768px) {
        .nav {
          padding: 16px 24px;
        }
        
        .nav-links {
          gap: 16px;
        }
        
        .nav-link:not(.nav-btn) {
          display: none;
        }
      }
    `}</style>
  );
};

// ============================================
// SHARED NAVIGATION COMPONENT
// ============================================
const Navigation = ({ navigate, scrolled = false }) => {
  const { isDark, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(scrolled);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="logo" onClick={() => navigate('home')}>
        <div className="logo-icon">🎯</div>
        <span className="logo-text">MentorMatch</span>
      </div>
      <div className="nav-links">
        <button className="nav-link" onClick={() => navigate('discover')}>How It Works</button>
        <button className="nav-link" onClick={() => navigate('help')}>Support</button>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDark ? '☀️' : '🌙'}
        </button>
        <button className="nav-btn ghost" onClick={() => navigate('login')}>Log in</button>
        <button className="nav-btn" onClick={() => navigate('register')}>Join Free</button>
      </div>
    </nav>
  );
};

// ============================================
// HOME PAGE (Parallax Landing)
// ============================================
const HomePage = ({ navigate }) => {
  const { isDark } = useTheme();
  const [scrollY, setScrollY] = useState(0);
  const [windowHeight, setWindowHeight] = useState(800);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroOpacity = Math.max(0, 1 - scrollY / (windowHeight * 0.6));
  const heroScale = 1 + scrollY * 0.0003;
  const heroBlur = Math.min(scrollY * 0.02, 10);
  const textY = scrollY * 0.4;

  return (
    <div className="home-page">
      <style>{`
        .home-page .hero {
          position: relative;
          height: 100vh;
          min-height: 700px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .home-page .hero-bg {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .home-page .hero-bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .home-page .hero-overlay {
          position: absolute;
          inset: 0;
          background: ${isDark 
            ? 'linear-gradient(to bottom, rgba(15,15,26,0.5) 0%, rgba(15,15,26,0.7) 50%, rgba(15,15,26,1) 100%)'
            : 'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,1) 100%)'
          };
          z-index: 2;
        }

        .home-page .hero-content {
          position: relative;
          z-index: 3;
          text-align: center;
          max-width: 900px;
          padding: 0 40px;
        }

        .home-page .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          padding: 12px 24px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 32px;
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .home-page .hero-tag .dot {
          width: 8px;
          height: 8px;
          background: var(--success);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .home-page .hero h1 {
          font-size: clamp(44px, 9vw, 80px);
          font-weight: 800;
          line-height: 1.05;
          margin-bottom: 28px;
          letter-spacing: -3px;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        .home-page .hero h1 .gradient {
          background: var(--gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .home-page .hero p {
          font-size: 20px;
          color: var(--text-secondary);
          line-height: 1.7;
          max-width: 620px;
          margin: 0 auto 48px;
          animation: fadeInUp 0.8s ease-out 0.6s both;
        }

        .home-page .hero-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          animation: fadeInUp 0.8s ease-out 0.8s both;
        }

        .home-page .scroll-indicator {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          animation: float 3s ease-in-out infinite;
        }

        .home-page .scroll-indicator span {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--text-tertiary);
        }

        .home-page .scroll-indicator .arrow {
          width: 20px;
          height: 20px;
          border-right: 2px solid var(--text-tertiary);
          border-bottom: 2px solid var(--text-tertiary);
          transform: rotate(45deg);
        }

        /* How It Works Section */
        .home-page .how-it-works {
          padding: 120px 60px;
          background: var(--bg-secondary);
        }

        .home-page .section-header {
          text-align: center;
          max-width: 600px;
          margin: 0 auto 80px;
        }

        .home-page .section-header .eyebrow {
          color: var(--gradient-start);
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 16px;
        }

        .home-page .section-header h2 {
          font-size: 44px;
          font-weight: 800;
          letter-spacing: -2px;
          margin-bottom: 20px;
        }

        .home-page .section-header p {
          color: var(--text-secondary);
          font-size: 18px;
          line-height: 1.6;
        }

        .home-page .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .home-page .step-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 40px 32px;
          text-align: center;
          transition: all 0.4s;
          position: relative;
        }

        .home-page .step-card:hover {
          transform: translateY(-8px);
          border-color: var(--gradient-start);
          box-shadow: 0 20px 60px var(--shadow);
        }

        .home-page .step-number {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 40px;
          background: var(--gradient);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: white;
          font-size: 16px;
        }

        .home-page .step-icon {
          width: 72px;
          height: 72px;
          background: var(--bg-tertiary);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin: 20px auto 24px;
        }

        .home-page .step-card h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .home-page .step-card p {
          color: var(--text-secondary);
          font-size: 15px;
          line-height: 1.6;
        }

        /* Features Section */
        .home-page .features {
          padding: 120px 60px;
        }

        .home-page .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 80px;
          max-width: 1200px;
          margin: 0 auto;
          align-items: center;
        }

        .home-page .features-content h2 {
          font-size: 40px;
          font-weight: 800;
          letter-spacing: -2px;
          margin-bottom: 24px;
        }

        .home-page .features-content p {
          font-size: 17px;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 32px;
        }

        .home-page .feature-list {
          list-style: none;
        }

        .home-page .feature-list li {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 20px;
        }

        .home-page .feature-list .check {
          width: 24px;
          height: 24px;
          background: var(--success);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .home-page .feature-list span {
          font-size: 16px;
          color: var(--text-secondary);
        }

        .home-page .features-visual {
          display: flex;
          justify-content: center;
        }

        .home-page .mentor-cards {
          position: relative;
          width: 340px;
          height: 420px;
        }

        .home-page .mentor-card {
          position: absolute;
          width: 280px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 20px 60px var(--shadow);
          transition: all 0.4s;
        }

        .home-page .mentor-card:nth-child(1) {
          top: 0;
          left: 0;
          z-index: 3;
        }

        .home-page .mentor-card:nth-child(2) {
          top: 40px;
          left: 60px;
          z-index: 2;
          opacity: 0.8;
        }

        .home-page .mentor-card:hover {
          transform: translateY(-8px);
        }

        .home-page .mentor-card .avatar {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: var(--gradient);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        .home-page .mentor-card h4 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .home-page .mentor-card .role {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .home-page .mentor-card .company {
          font-size: 13px;
          color: var(--gradient-start);
          font-weight: 600;
          margin-bottom: 16px;
        }

        .home-page .mentor-card .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .home-page .mentor-card .skill {
          padding: 6px 12px;
          background: var(--bg-tertiary);
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        /* Stats Section */
        .home-page .stats {
          padding: 100px 60px;
          background: var(--gradient);
        }

        .home-page .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
          max-width: 1100px;
          margin: 0 auto;
          text-align: center;
        }

        .home-page .stat-item .number {
          font-size: 52px;
          font-weight: 800;
          color: white;
          letter-spacing: -2px;
        }

        .home-page .stat-item .label {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
        }

        /* Testimonials */
        .home-page .testimonials {
          padding: 120px 60px;
          background: var(--bg-secondary);
        }

        .home-page .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .home-page .testimonial-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 32px;
          transition: all 0.3s;
        }

        .home-page .testimonial-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px var(--shadow);
        }

        .home-page .testimonial-card .quote {
          font-size: 32px;
          color: var(--gradient-start);
          margin-bottom: 16px;
        }

        .home-page .testimonial-card p {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 24px;
        }

        .home-page .testimonial-author {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .home-page .testimonial-author .avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .home-page .testimonial-author h4 {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .home-page .testimonial-author span {
          font-size: 13px;
          color: var(--text-tertiary);
        }

        /* CTA Section */
        .home-page .cta {
          padding: 140px 60px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .home-page .cta::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 60%);
        }

        .home-page .cta h2 {
          font-size: 48px;
          font-weight: 800;
          letter-spacing: -2px;
          margin-bottom: 20px;
          position: relative;
        }

        .home-page .cta p {
          font-size: 18px;
          color: var(--text-secondary);
          margin-bottom: 40px;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
          position: relative;
        }

        /* Footer */
        .home-page .footer {
          padding: 60px;
          border-top: 1px solid var(--border);
        }

        .home-page .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .home-page .footer-links {
          display: flex;
          gap: 32px;
        }

        .home-page .footer-links a {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 14px;
          cursor: pointer;
          transition: color 0.3s;
        }

        .home-page .footer-links a:hover {
          color: var(--text-primary);
        }

        .home-page .footer p {
          color: var(--text-tertiary);
          font-size: 14px;
        }

        @media (max-width: 1024px) {
          .home-page .steps-grid,
          .home-page .features-grid,
          .home-page .testimonials-grid,
          .home-page .stats-grid {
            grid-template-columns: 1fr;
            max-width: 500px;
          }
          
          .home-page .features-grid {
            gap: 60px;
          }
        }

        @media (max-width: 768px) {
          .home-page .how-it-works,
          .home-page .features,
          .home-page .testimonials,
          .home-page .cta {
            padding: 80px 24px;
          }
          
          .home-page .hero-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .home-page .footer-content {
            flex-direction: column;
            gap: 24px;
            text-align: center;
          }
          
          .home-page .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <Navigation navigate={navigate} />

      {/* Hero Section */}
      <section className="hero">
        <div 
          className="hero-bg"
          style={{
            transform: `scale(${heroScale})`,
            opacity: heroOpacity,
            filter: `blur(${heroBlur}px)`
          }}
        >
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80" 
            alt="Mentorship session"
          />
        </div>
        <div className="hero-overlay" />
        
        <div 
          className="hero-content"
          style={{ transform: `translateY(${textY}px)`, opacity: heroOpacity }}
        >
          <div className="hero-tag">
            <span className="dot"></span>
            Join 50,000+ professionals growing together
          </div>
          <h1>
            Find Your Perfect<br />
            <span className="gradient">Mentor Match</span>
          </h1>
          <p>
            Connect with industry experts who've been where you want to go. 
            Whether you're seeking guidance or ready to give back, meaningful 
            mentorship is just a swipe away.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('register')}>
              Find a Mentor
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="btn-secondary" onClick={() => navigate('register')}>
              Become a Mentor
            </button>
          </div>
        </div>

        <div className="scroll-indicator" style={{ opacity: heroOpacity }}>
          <span>Scroll</span>
          <div className="arrow"></div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="section-header">
          <div className="eyebrow">How It Works</div>
          <h2>Three Steps to Growth</h2>
          <p>Our AI-powered matching connects you with mentors who align with your goals, industry, and learning style.</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon">📝</div>
            <h3>Create Your Profile</h3>
            <p>Tell us about your goals, skills, and what you're looking to learn or share. Our AI understands your unique journey.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon">🎯</div>
            <h3>Discover Matches</h3>
            <p>Browse curated mentor profiles. Swipe right on those who inspire you, and we'll notify them of your interest.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon">🚀</div>
            <h3>Start Growing</h3>
            <p>When both sides connect, schedule your first session. Set goals, track progress, and accelerate your career.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="features-grid">
          <div className="features-content">
            <h2>Mentorship Made Simple</h2>
            <p>
              We've removed the barriers between ambitious professionals and the 
              guidance they need. Our platform makes it easy to find, connect, 
              and grow with mentors who truly understand your path.
            </p>
            <ul className="feature-list">
              <li>
                <span className="check">✓</span>
                <span>AI-powered matching based on goals, skills & personality</span>
              </li>
              <li>
                <span className="check">✓</span>
                <span>Verified industry professionals from top companies</span>
              </li>
              <li>
                <span className="check">✓</span>
                <span>Built-in scheduling, video calls & progress tracking</span>
              </li>
              <li>
                <span className="check">✓</span>
                <span>Structured programs or flexible 1:1 sessions</span>
              </li>
            </ul>
            <button className="btn-primary" onClick={() => navigate('discover')}>
              See How It Works
            </button>
          </div>
          <div className="features-visual">
            <div className="mentor-cards">
              <div className="mentor-card">
                <div className="avatar">👩‍💼</div>
                <h4>Sarah Chen</h4>
                <div className="role">Senior Product Manager</div>
                <div className="company">@ Google</div>
                <div className="skills">
                  <span className="skill">Product Strategy</span>
                  <span className="skill">Leadership</span>
                  <span className="skill">Career Growth</span>
                </div>
              </div>
              <div className="mentor-card">
                <div className="avatar">👨‍💻</div>
                <h4>James Wilson</h4>
                <div className="role">Engineering Director</div>
                <div className="company">@ Microsoft</div>
                <div className="skills">
                  <span className="skill">System Design</span>
                  <span className="skill">Team Building</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="number">50K+</div>
            <div className="label">Active Members</div>
          </div>
          <div className="stat-item">
            <div className="number">12K+</div>
            <div className="label">Verified Mentors</div>
          </div>
          <div className="stat-item">
            <div className="number">85%</div>
            <div className="label">Goal Achievement</div>
          </div>
          <div className="stat-item">
            <div className="number">150+</div>
            <div className="label">Industries Covered</div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="section-header">
          <div className="eyebrow">Success Stories</div>
          <h2>Real Growth, Real Results</h2>
          <p>Hear from professionals who transformed their careers through mentorship.</p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="quote">"</div>
            <p>My mentor helped me navigate the transition from engineer to engineering manager. Within 6 months, I got promoted and felt confident leading my team.</p>
            <div className="testimonial-author">
              <div className="avatar">👩‍🦱</div>
              <div>
                <h4>Priya Sharma</h4>
                <span>Engineering Manager @ Stripe</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="quote">"</div>
            <p>As a career changer, I was lost. MentorMatch connected me with someone who made the same pivot. Now I'm thriving in my dream role in product.</p>
            <div className="testimonial-author">
              <div className="avatar">👨</div>
              <div>
                <h4>Marcus Johnson</h4>
                <span>Product Manager @ Airbnb</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="quote">"</div>
            <p>Being a mentor here has been incredibly rewarding. Helping others grow while staying connected to emerging talent keeps me sharp and motivated.</p>
            <div className="testimonial-author">
              <div className="avatar">👩‍💼</div>
              <div>
                <h4>Lisa Park</h4>
                <span>VP of Design @ Figma</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Ready to Accelerate Your Growth?</h2>
        <p>Join thousands of professionals building meaningful mentorship connections.</p>
        <button className="btn-primary" onClick={() => navigate('register')}>
          Get Started Free
        </button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="logo" onClick={() => navigate('home')}>
            <div className="logo-icon">🎯</div>
            <span className="logo-text">MentorMatch</span>
          </div>
          <div className="footer-links">
            <a onClick={() => navigate('discover')}>How It Works</a>
            <a onClick={() => navigate('help')}>Support</a>
            <a>For Companies</a>
            <a>Privacy</a>
            <a>Terms</a>
          </div>
          <p>© 2026 MentorMatch</p>
        </div>
      </footer>
    </div>
  );
};

// ============================================
// DISCOVER PAGE (Features / How It Works)
// ============================================
const DiscoverPage = ({ navigate }) => {
  const { isDark } = useTheme();
  
  const mentors = [
    { id: 1, name: 'Dr. Amara Osei', role: 'AI Research Lead', company: 'DeepMind', skills: ['Machine Learning', 'Research', 'PhD Guidance'], image: '👩‍🔬' },
    { id: 2, name: 'Michael Torres', role: 'Startup Founder', company: 'YC Alum', skills: ['Entrepreneurship', 'Fundraising', 'Product'], image: '👨‍💼' },
    { id: 3, name: 'Jennifer Wu', role: 'Design Director', company: 'Apple', skills: ['UX Strategy', 'Leadership', 'Portfolio Review'], image: '👩‍🎨' },
  ];

  return (
    <div className="discover-page">
      <style>{`
        .discover-page {
          min-height: 100vh;
        }

        .discover-page .hero {
          padding: 140px 60px 100px;
          display: flex;
          align-items: center;
          gap: 80px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .discover-page .hero-content {
          flex: 1;
        }

        .discover-page .hero-tag {
          display: inline-block;
          background: var(--gradient);
          color: white;
          padding: 8px 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .discover-page .hero h1 {
          font-size: 56px;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 24px;
          letter-spacing: -2px;
        }

        .discover-page .hero h1 .gradient {
          background: var(--gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .discover-page .hero p {
          font-size: 18px;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 36px;
          max-width: 500px;
        }

        /* Card Stack */
        .discover-page .card-stack-container {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .discover-page .card-stack {
          position: relative;
          width: 320px;
          height: 440px;
        }

        .discover-page .mentor-card {
          position: absolute;
          width: 100%;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 20px 60px var(--shadow);
          transition: transform 0.3s;
        }

        .discover-page .mentor-card:nth-child(1) {
          z-index: 3;
        }

        .discover-page .mentor-card:nth-child(2) {
          z-index: 2;
          transform: translateY(16px) scale(0.96);
        }

        .discover-page .mentor-card:nth-child(3) {
          z-index: 1;
          transform: translateY(32px) scale(0.92);
        }

        .discover-page .mentor-card .avatar {
          width: 80px;
          height: 80px;
          background: var(--gradient);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          margin-bottom: 20px;
        }

        .discover-page .mentor-card h3 {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .discover-page .mentor-card .role {
          font-size: 15px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .discover-page .mentor-card .company {
          font-size: 14px;
          color: var(--gradient-start);
          font-weight: 600;
          margin-bottom: 20px;
        }

        .discover-page .mentor-card .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
        }

        .discover-page .mentor-card .skill {
          padding: 8px 14px;
          background: var(--bg-tertiary);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .discover-page .mentor-card .match-score {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 12px;
          color: var(--success);
          font-weight: 600;
          font-size: 14px;
        }

        .discover-page .card-actions {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 30px;
        }

        .discover-page .action-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
        }

        .discover-page .action-btn.skip {
          background: ${isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)'};
          color: #ef4444;
          border: 2px solid #ef4444;
        }

        .discover-page .action-btn.connect {
          background: ${isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)'};
          color: #10b981;
          border: 2px solid #10b981;
        }

        .discover-page .action-btn.bookmark {
          background: ${isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)'};
          color: #6366f1;
          border: 2px solid #6366f1;
        }

        .discover-page .action-btn:hover {
          transform: scale(1.1);
        }

        /* Features Section */
        .discover-page .features-section {
          padding: 100px 60px;
          background: var(--bg-secondary);
        }

        .discover-page .features-section h2 {
          font-size: 40px;
          font-weight: 800;
          text-align: center;
          margin-bottom: 60px;
          letter-spacing: -2px;
        }

        .discover-page .feature-row {
          display: flex;
          align-items: center;
          gap: 80px;
          max-width: 1200px;
          margin: 0 auto 100px;
        }

        .discover-page .feature-row:nth-child(even) {
          flex-direction: row-reverse;
        }

        .discover-page .feature-row:last-child {
          margin-bottom: 0;
        }

        .discover-page .feature-text {
          flex: 1;
        }

        .discover-page .feature-text .eyebrow {
          color: var(--gradient-start);
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 12px;
        }

        .discover-page .feature-text h3 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 16px;
          letter-spacing: -1px;
        }

        .discover-page .feature-text p {
          font-size: 17px;
          color: var(--text-secondary);
          line-height: 1.7;
        }

        .discover-page .feature-visual {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .discover-page .phone-mockup {
          width: 280px;
          height: 560px;
          background: ${isDark ? '#1a1a2e' : '#333'};
          border-radius: 40px;
          padding: 10px;
          box-shadow: 0 40px 80px var(--shadow);
        }

        .discover-page .phone-screen {
          width: 100%;
          height: 100%;
          background: var(--bg-secondary);
          border-radius: 32px;
          overflow: hidden;
        }

        .discover-page .chat-preview {
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .discover-page .chat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 20px;
        }

        .discover-page .chat-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .discover-page .chat-name {
          font-weight: 600;
          font-size: 15px;
        }

        .discover-page .chat-status {
          font-size: 12px;
          color: var(--success);
        }

        .discover-page .messages {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .discover-page .message {
          max-width: 85%;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
          animation: slideIn 0.4s ease-out both;
        }

        .discover-page .message.received {
          background: var(--bg-tertiary);
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }

        .discover-page .message.sent {
          background: var(--gradient);
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }

        /* Matching Visual */
        .discover-page .matching-visual {
          width: 320px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 32px;
        }

        .discover-page .matching-visual h4 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 24px;
          text-align: center;
        }

        .discover-page .match-criteria {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .discover-page .criteria-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: var(--bg-tertiary);
          border-radius: 12px;
        }

        .discover-page .criteria-item .label {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .discover-page .criteria-item .value {
          font-weight: 600;
          color: var(--success);
        }

        .discover-page .overall-match {
          margin-top: 24px;
          padding: 20px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 16px;
          text-align: center;
        }

        .discover-page .overall-match .score {
          font-size: 48px;
          font-weight: 800;
          color: var(--success);
        }

        .discover-page .overall-match .label {
          font-size: 14px;
          color: var(--text-secondary);
        }

        @media (max-width: 1024px) {
          .discover-page .hero,
          .discover-page .feature-row {
            flex-direction: column;
            text-align: center;
          }
          
          .discover-page .feature-row:nth-child(even) {
            flex-direction: column;
          }
        }

        @media (max-width: 768px) {
          .discover-page .hero {
            padding: 120px 24px 60px;
          }
          
          .discover-page .hero h1 {
            font-size: 36px;
          }
          
          .discover-page .features-section {
            padding: 60px 24px;
          }
        }
      `}</style>

      <Navigation navigate={navigate} />

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">✨ Discover</span>
          <h1>
            Find Mentors Who<br />
            <span className="gradient">Get Your Journey</span>
          </h1>
          <p>
            Our AI analyzes your goals, experience, and learning style to match you 
            with mentors who can truly help you grow. Swipe through profiles, 
            connect with the right people, and start your journey.
          </p>
          <button className="btn-primary" onClick={() => navigate('register')}>
            Start Matching
          </button>
        </div>
        <div className="card-stack-container">
          <div>
            <div className="card-stack">
              {mentors.map((mentor, index) => (
                <div key={mentor.id} className="mentor-card">
                  <div className="avatar">{mentor.image}</div>
                  <h3>{mentor.name}</h3>
                  <div className="role">{mentor.role}</div>
                  <div className="company">@ {mentor.company}</div>
                  <div className="skills">
                    {mentor.skills.map((skill, i) => (
                      <span key={i} className="skill">{skill}</span>
                    ))}
                  </div>
                  {index === 0 && (
                    <div className="match-score">
                      <span>🎯</span>
                      94% Match with your goals
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="card-actions">
              <button className="action-btn skip">✕</button>
              <button className="action-btn bookmark">⭐</button>
              <button className="action-btn connect">✓</button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <h2>Built for Meaningful Connections</h2>
        
        <div className="feature-row">
          <div className="feature-text">
            <div className="eyebrow">AI Matching</div>
            <h3>Smart Compatibility Scoring</h3>
            <p>
              Our algorithm considers your career goals, industry experience, 
              communication preferences, and availability to find mentors 
              who are the perfect fit for your growth journey.
            </p>
          </div>
          <div className="feature-visual">
            <div className="matching-visual">
              <h4>Match Analysis</h4>
              <div className="match-criteria">
                <div className="criteria-item">
                  <span className="label">Industry Alignment</span>
                  <span className="value">96%</span>
                </div>
                <div className="criteria-item">
                  <span className="label">Skills Match</span>
                  <span className="value">92%</span>
                </div>
                <div className="criteria-item">
                  <span className="label">Goal Compatibility</span>
                  <span className="value">94%</span>
                </div>
                <div className="criteria-item">
                  <span className="label">Availability</span>
                  <span className="value">88%</span>
                </div>
              </div>
              <div className="overall-match">
                <div className="score">94%</div>
                <div className="label">Overall Match Score</div>
              </div>
            </div>
          </div>
        </div>

        <div className="feature-row">
          <div className="feature-text">
            <div className="eyebrow">Communication</div>
            <h3>Seamless Conversations</h3>
            <p>
              Once you match, start chatting right away. Share your goals, 
              ask questions, and schedule your first mentorship session — 
              all within the platform.
            </p>
          </div>
          <div className="feature-visual">
            <div className="phone-mockup">
              <div className="phone-screen">
                <div className="chat-preview">
                  <div className="chat-header">
                    <div className="chat-avatar">👩‍🔬</div>
                    <div>
                      <div className="chat-name">Dr. Amara Osei</div>
                      <div className="chat-status">Online now</div>
                    </div>
                  </div>
                  <div className="messages">
                    <div className="message received" style={{animationDelay: '0.2s'}}>Hi! I saw you're interested in transitioning to ML research. I'd love to help!</div>
                    <div className="message sent" style={{animationDelay: '0.4s'}}>Yes! I'm currently a software engineer wanting to move into AI. Would love your guidance.</div>
                    <div className="message received" style={{animationDelay: '0.6s'}}>Great! Let's schedule a call to discuss your background and create a learning roadmap 📚</div>
                    <div className="message sent" style={{animationDelay: '0.8s'}}>That sounds perfect! When works for you?</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// ============================================
// HELP PAGE
// ============================================
const HelpPage = ({ navigate }) => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const categories = [
    { icon: '👤', title: 'Account & Profile', articles: 12, desc: 'Settings, verification, profile tips' },
    { icon: '🎯', title: 'Finding Mentors', articles: 15, desc: 'Search, matching, connecting' },
    { icon: '💬', title: 'Sessions & Chat', articles: 10, desc: 'Scheduling, video calls, messaging' },
    { icon: '🏆', title: 'For Mentors', articles: 14, desc: 'Becoming a mentor, best practices' },
    { icon: '💳', title: 'Premium & Billing', articles: 8, desc: 'Subscriptions, payments, features' },
    { icon: '🔒', title: 'Safety & Privacy', articles: 11, desc: 'Reporting, blocking, data protection' },
  ];

  const faqs = [
    { 
      question: 'How does the matching algorithm work?', 
      answer: 'Our AI considers your career goals, industry experience, skills you want to develop, communication style preferences, and scheduling availability. We then score potential mentors and surface the best matches for your growth journey.' 
    },
    { 
      question: 'Is MentorMatch free to use?', 
      answer: 'Yes! You can create a profile, browse mentors, and connect with matches for free. Premium plans offer additional features like unlimited connections, priority matching, and advanced analytics.' 
    },
    { 
      question: 'How do I become a mentor?', 
      answer: 'During signup, choose "I want to mentor others" and complete your mentor profile. We verify your professional background through LinkedIn and ask for a brief application. Most mentors are approved within 48 hours.' 
    },
    { 
      question: 'What if a mentorship isn\'t working out?', 
      answer: 'Mentorship fit is important. You can gracefully end any mentorship connection through the app. We also offer mediation support if needed. Your experience and safety are our priorities.' 
    },
    { 
      question: 'Can I be both a mentor and mentee?', 
      answer: 'Absolutely! Many of our best members both give and receive mentorship. You can seek guidance in one area while sharing your expertise in another.' 
    },
  ];

  return (
    <div className="help-page">
      <style>{`
        .help-page {
          min-height: 100vh;
        }

        .help-page .hero {
          padding: 160px 60px 80px;
          text-align: center;
          background: var(--bg-secondary);
        }

        .help-page .hero h1 {
          font-size: 48px;
          font-weight: 800;
          letter-spacing: -2px;
          margin-bottom: 16px;
        }

        .help-page .hero p {
          font-size: 18px;
          color: var(--text-secondary);
          margin-bottom: 40px;
        }

        .help-page .search-box {
          max-width: 600px;
          margin: 0 auto;
          position: relative;
        }

        .help-page .search-box input {
          width: 100%;
          padding: 20px 24px 20px 56px;
          border-radius: 16px;
          border: 2px solid var(--border);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 16px;
          font-family: inherit;
          transition: all 0.3s;
        }

        .help-page .search-box input:focus {
          outline: none;
          border-color: var(--gradient-start);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .help-page .search-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 20px;
          color: var(--text-tertiary);
        }

        /* Categories */
        .help-page .categories {
          padding: 80px 60px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .help-page .categories h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 40px;
          text-align: center;
        }

        .help-page .categories-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .help-page .category-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 32px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .help-page .category-card:hover {
          transform: translateY(-4px);
          border-color: var(--gradient-start);
          box-shadow: 0 20px 40px var(--shadow);
        }

        .help-page .category-icon {
          font-size: 40px;
          margin-bottom: 16px;
        }

        .help-page .category-card h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .help-page .category-card .desc {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .help-page .category-card span {
          font-size: 13px;
          color: var(--gradient-start);
          font-weight: 600;
        }

        /* FAQs */
        .help-page .faqs {
          padding: 80px 60px;
          background: var(--bg-secondary);
        }

        .help-page .faqs-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .help-page .faqs h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 40px;
          text-align: center;
        }

        .help-page .faq-item {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          margin-bottom: 16px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .help-page .faq-item:hover {
          border-color: var(--text-tertiary);
        }

        .help-page .faq-question {
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          font-weight: 600;
          font-size: 16px;
        }

        .help-page .faq-toggle {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          font-size: 18px;
          flex-shrink: 0;
        }

        .help-page .faq-item.expanded .faq-toggle {
          transform: rotate(45deg);
          background: var(--gradient);
          color: white;
        }

        .help-page .faq-answer {
          padding: 0 24px 24px;
          color: var(--text-secondary);
          line-height: 1.7;
          display: none;
        }

        .help-page .faq-item.expanded .faq-answer {
          display: block;
          animation: fadeIn 0.3s ease-out;
        }

        /* Contact */
        .help-page .contact {
          padding: 100px 60px;
          text-align: center;
        }

        .help-page .contact h2 {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .help-page .contact p {
          color: var(--text-secondary);
          margin-bottom: 32px;
          font-size: 17px;
        }

        .help-page .contact-options {
          display: flex;
          justify-content: center;
          gap: 24px;
        }

        .help-page .contact-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 32px;
          border-radius: 12px;
          border: 2px solid var(--border);
          background: var(--bg-card);
          color: var(--text-primary);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-family: inherit;
          font-size: 15px;
        }

        .help-page .contact-btn:hover {
          border-color: var(--gradient-start);
          transform: translateY(-2px);
        }

        .help-page .contact-btn .icon {
          font-size: 20px;
        }

        @media (max-width: 1024px) {
          .help-page .categories-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .help-page .hero,
          .help-page .categories,
          .help-page .faqs,
          .help-page .contact {
            padding: 80px 24px;
          }
          
          .help-page .hero {
            padding-top: 140px;
          }
          
          .help-page .hero h1 {
            font-size: 32px;
          }
          
          .help-page .categories-grid {
            grid-template-columns: 1fr;
          }
          
          .help-page .contact-options {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>

      <Navigation navigate={navigate} />

      {/* Hero */}
      <section className="hero">
        <h1>How can we help you?</h1>
        <p>Search our knowledge base or browse categories below</p>
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search for help with matching, sessions, billing..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <h2>Browse by Topic</h2>
        <div className="categories-grid">
          {categories.map((cat, index) => (
            <div key={index} className="category-card">
              <div className="category-icon">{cat.icon}</div>
              <h3>{cat.title}</h3>
              <div className="desc">{cat.desc}</div>
              <span>{cat.articles} articles →</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="faqs">
        <div className="faqs-container">
          <h2>Frequently Asked Questions</h2>
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${expandedFaq === index ? 'expanded' : ''}`}
            >
              <div 
                className="faq-question"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                {faq.question}
                <div className="faq-toggle">+</div>
              </div>
              <div className="faq-answer">{faq.answer}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="contact">
        <h2>Still have questions?</h2>
        <p>Our support team is here to help you succeed</p>
        <div className="contact-options">
          <button className="contact-btn">
            <span className="icon">💬</span>
            Live Chat
          </button>
          <button className="contact-btn">
            <span className="icon">📧</span>
            Email Support
          </button>
          <button className="contact-btn">
            <span className="icon">📅</span>
            Book a Call
          </button>
        </div>
      </section>
    </div>
  );
};

// ============================================
// LOGIN PAGE
// ============================================
const LoginPage = ({ navigate }) => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-page">
      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
        }

        .auth-page .auth-visual {
          flex: 1;
          background: var(--gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .auth-page .auth-visual::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200') center/cover;
          opacity: 0.25;
        }

        .auth-page .visual-content {
          position: relative;
          z-index: 2;
          text-align: center;
          color: white;
          padding: 40px;
        }

        .auth-page .visual-content .icon {
          font-size: 64px;
          margin-bottom: 24px;
        }

        .auth-page .visual-content h2 {
          font-size: 44px;
          font-weight: 800;
          margin-bottom: 16px;
          letter-spacing: -2px;
        }

        .auth-page .visual-content p {
          font-size: 18px;
          opacity: 0.9;
          max-width: 400px;
        }

        .auth-page .auth-form-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: var(--bg-primary);
          position: relative;
        }

        .auth-page .auth-form {
          width: 100%;
          max-width: 420px;
        }

        .auth-page .auth-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .auth-page .auth-header .logo {
          font-size: 32px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .auth-page .auth-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .auth-page .auth-header p {
          color: var(--text-secondary);
        }

        .auth-page .social-login {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
        }

        .auth-page .social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px;
          border-radius: 12px;
          border: 2px solid var(--border);
          background: var(--bg-card);
          color: var(--text-primary);
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s;
          font-family: inherit;
        }

        .auth-page .social-btn:hover {
          border-color: var(--text-secondary);
          transform: translateY(-2px);
        }

        .auth-page .social-btn .icon {
          font-size: 20px;
        }

        .auth-page .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
          color: var(--text-tertiary);
          font-size: 14px;
        }

        .auth-page .divider::before,
        .auth-page .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        .auth-page .password-input {
          position: relative;
        }

        .auth-page .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          font-size: 18px;
        }

        .auth-page .forgot-link {
          display: block;
          text-align: right;
          color: var(--gradient-start);
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 24px;
          cursor: pointer;
        }

        .auth-page .submit-btn {
          width: 100%;
          padding: 18px;
          border-radius: 12px;
          background: var(--gradient);
          color: white;
          border: none;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
          font-family: inherit;
        }

        .auth-page .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
        }

        .auth-page .auth-footer {
          text-align: center;
          margin-top: 32px;
          color: var(--text-secondary);
          font-size: 15px;
        }

        .auth-page .auth-footer a {
          color: var(--gradient-start);
          font-weight: 600;
          cursor: pointer;
        }

        .auth-page .back-link {
          position: absolute;
          top: 24px;
          left: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 14px;
          cursor: pointer;
          z-index: 10;
        }

        .auth-page .back-link:hover {
          color: var(--text-primary);
        }

        @media (max-width: 1024px) {
          .auth-page .auth-visual {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .auth-page .auth-form-container {
            padding: 24px;
          }
        }
      `}</style>

      <div className="auth-visual">
        <div className="visual-content">
          <div className="icon">🎯</div>
          <h2>Welcome Back</h2>
          <p>Sign in to continue your mentorship journey and connect with your network.</p>
        </div>
      </div>

      <div className="auth-form-container">
        <div className="back-link" onClick={() => navigate('home')}>
          ← Back to home
        </div>
        
        <div className="auth-form">
          <div className="auth-header">
            <div className="logo">
              <div className="logo-icon">🎯</div>
              <span className="logo-text">MentorMatch</span>
            </div>
            <h1>Sign in</h1>
            <p>Access your mentorship dashboard</p>
          </div>

          <div className="social-login">
            <button className="social-btn">
              <span className="icon">🔗</span>
              Continue with LinkedIn
            </button>
            <button className="social-btn">
              <span className="icon">📧</span>
              Continue with Google
            </button>
          </div>

          <div className="divider">or sign in with email</div>

          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-input">
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <a className="forgot-link">Forgot password?</a>

          <button className="submit-btn">Sign In</button>

          <p className="auth-footer">
            New to MentorMatch? <a onClick={() => navigate('register')}>Create account</a>
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// REGISTER PAGE
// ============================================
const RegisterPage = ({ navigate }) => {
  const { isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    industry: '',
    goals: []
  });

  const updateForm = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleGoal = (goal) => {
    const goals = formData.goals.includes(goal)
      ? formData.goals.filter(g => g !== goal)
      : [...formData.goals, goal];
    updateForm('goals', goals);
  };

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Marketing', 
    'Design', 'Consulting', 'Nonprofit', 'Entrepreneurship', 'Other'
  ];

  const goalOptions = [
    { id: 'career', label: 'Career Advancement', icon: '📈' },
    { id: 'skills', label: 'Skill Development', icon: '🎯' },
    { id: 'leadership', label: 'Leadership Growth', icon: '👑' },
    { id: 'transition', label: 'Career Transition', icon: '🔄' },
    { id: 'network', label: 'Build Network', icon: '🤝' },
    { id: 'startup', label: 'Start a Business', icon: '🚀' },
  ];

  return (
    <div className="auth-page register">
      <style>{`
        .auth-page.register .auth-visual {
          flex: 1;
          background: var(--gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .auth-page.register .auth-visual::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200') center/cover;
          opacity: 0.25;
        }

        .auth-page.register .visual-content {
          position: relative;
          z-index: 2;
          text-align: center;
          color: white;
          padding: 40px;
        }

        .auth-page.register .visual-content .icon {
          font-size: 64px;
          margin-bottom: 24px;
        }

        .auth-page.register .visual-content h2 {
          font-size: 44px;
          font-weight: 800;
          margin-bottom: 16px;
          letter-spacing: -2px;
        }

        .auth-page.register .visual-content p {
          font-size: 18px;
          opacity: 0.9;
          max-width: 400px;
        }

        .auth-page.register .step-indicator {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 40px;
        }

        .auth-page.register .step {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          border: 2px solid var(--border);
          color: var(--text-tertiary);
          transition: all 0.3s;
        }

        .auth-page.register .step.active {
          background: var(--gradient);
          border-color: transparent;
          color: white;
        }

        .auth-page.register .step.completed {
          background: var(--success);
          border-color: transparent;
          color: white;
        }

        .auth-page.register .step-connector {
          width: 40px;
          height: 2px;
          background: var(--border);
          align-self: center;
        }

        .auth-page.register .step-connector.active {
          background: var(--gradient);
        }

        .auth-page.register .role-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .auth-page.register .role-option {
          padding: 24px;
          border-radius: 16px;
          border: 2px solid var(--border);
          background: var(--bg-card);
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .auth-page.register .role-option:hover {
          border-color: var(--text-secondary);
        }

        .auth-page.register .role-option.selected {
          border-color: var(--gradient-start);
          background: ${isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)'};
        }

        .auth-page.register .role-option .icon {
          font-size: 36px;
          margin-bottom: 12px;
        }

        .auth-page.register .role-option .label {
          font-weight: 700;
          font-size: 16px;
          margin-bottom: 4px;
        }

        .auth-page.register .role-option .desc {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .auth-page.register .goals-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .auth-page.register .goal-option {
          padding: 16px;
          border-radius: 12px;
          border: 2px solid var(--border);
          background: var(--bg-card);
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .auth-page.register .goal-option:hover {
          border-color: var(--text-secondary);
        }

        .auth-page.register .goal-option.selected {
          border-color: var(--gradient-start);
          background: ${isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)'};
        }

        .auth-page.register .goal-option .icon {
          font-size: 24px;
        }

        .auth-page.register .goal-option .label {
          font-weight: 600;
          font-size: 14px;
        }

        .auth-page.register .terms {
          font-size: 13px;
          color: var(--text-tertiary);
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .auth-page.register .terms a {
          color: var(--gradient-start);
          cursor: pointer;
        }

        .auth-page.register .nav-buttons {
          display: flex;
          gap: 12px;
        }

        .auth-page.register .nav-buttons .btn-secondary {
          flex: 1;
        }

        .auth-page.register .nav-buttons .submit-btn {
          flex: 2;
        }

        .auth-page.register .success-animation {
          text-align: center;
          padding: 40px 0;
        }

        .auth-page.register .success-icon {
          width: 80px;
          height: 80px;
          background: var(--success);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          margin: 0 auto 24px;
          animation: pulse 2s infinite;
        }
      `}</style>

      <div className="auth-visual">
        <div className="visual-content">
          <div className="icon">🚀</div>
          <h2>Start Your Journey</h2>
          <p>Join a community of professionals committed to growth through mentorship.</p>
        </div>
      </div>

      <div className="auth-form-container">
        <div className="back-link" onClick={() => navigate('home')}>
          ← Back to home
        </div>
        
        <div className="auth-form">
          <div className="auth-header">
            <div className="logo">
              <div className="logo-icon">🎯</div>
              <span className="logo-text">MentorMatch</span>
            </div>
            <h1>Create Account</h1>
            <p>Step {step} of 3</p>
          </div>

          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <div className={`step-connector ${step > 1 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              {step > 2 ? '✓' : '2'}
            </div>
            <div className={`step-connector ${step > 2 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
          </div>

          {step === 1 && (
            <>
              <div className="social-login">
                <button className="social-btn">
                  <span className="icon">🔗</span>
                  Continue with LinkedIn
                </button>
                <button className="social-btn">
                  <span className="icon">📧</span>
                  Continue with Google
                </button>
              </div>

              <div className="divider">or sign up with email</div>

              <div className="input-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Work Email</label>
                <input 
                  type="email" 
                  placeholder="Enter your work email"
                  value={formData.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => updateForm('password', e.target.value)}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <label style={{ display: 'block', marginBottom: 16, fontWeight: 600, fontSize: 15 }}>
                I want to...
              </label>
              <div className="role-options">
                <div 
                  className={`role-option ${formData.role === 'mentee' ? 'selected' : ''}`}
                  onClick={() => updateForm('role', 'mentee')}
                >
                  <div className="icon">🌱</div>
                  <div className="label">Find a Mentor</div>
                  <div className="desc">Get guidance from experts</div>
                </div>
                <div 
                  className={`role-option ${formData.role === 'mentor' ? 'selected' : ''}`}
                  onClick={() => updateForm('role', 'mentor')}
                >
                  <div className="icon">🎓</div>
                  <div className="label">Be a Mentor</div>
                  <div className="desc">Share your expertise</div>
                </div>
              </div>

              <div className="input-group">
                <label>Industry</label>
                <select 
                  value={formData.industry}
                  onChange={(e) => updateForm('industry', e.target.value)}
                >
                  <option value="">Select your industry</option>
                  {industries.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {step === 3 && formData.role === 'mentee' && (
            <>
              <label style={{ display: 'block', marginBottom: 16, fontWeight: 600, fontSize: 15 }}>
                What are your goals? (Select all that apply)
              </label>
              <div className="goals-grid">
                {goalOptions.map(goal => (
                  <div 
                    key={goal.id}
                    className={`goal-option ${formData.goals.includes(goal.id) ? 'selected' : ''}`}
                    onClick={() => toggleGoal(goal.id)}
                  >
                    <span className="icon">{goal.icon}</span>
                    <span className="label">{goal.label}</span>
                  </div>
                ))}
              </div>

              <p className="terms">
                By creating an account, you agree to our <a>Terms of Service</a> and <a>Privacy Policy</a>.
              </p>
            </>
          )}

          {step === 3 && formData.role === 'mentor' && (
            <>
              <div className="success-animation">
                <div className="success-icon">🎉</div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Almost there!</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                  We'll review your profile and verify your professional background. 
                  Most mentors are approved within 48 hours.
                </p>
              </div>

              <p className="terms">
                By becoming a mentor, you agree to our <a>Mentor Guidelines</a> and commit to 
                supporting mentees in their growth journey.
              </p>
            </>
          )}

          <div className="nav-buttons">
            {step > 1 && (
              <button className="btn-secondary" onClick={() => setStep(step - 1)}>
                Back
              </button>
            )}
            <button 
              className="submit-btn" 
              onClick={() => step < 3 ? setStep(step + 1) : navigate('home')}
            >
              {step === 3 ? (formData.role === 'mentor' ? 'Submit Application' : 'Start Matching') : 'Continue'}
            </button>
          </div>

          {step === 1 && (
            <p className="auth-footer">
              Already have an account? <a onClick={() => navigate('login')}>Sign in</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
