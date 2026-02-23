import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, User, MessageCircle, Home, LogOut, BarChart3, Search, Bell } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { subscribeToNotifications } from '../lib/matchService';
import Logo from './Logo';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToNotifications(user.uid, (notifs) => {
            const unread = notifs.filter(n => !n.read).length;
            setUnreadCount(unread);
        });
        return () => unsubscribe();
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    const isLanding = location.pathname === '/';
    const isMobile = window.innerWidth <= 768;

    return (
        <nav className={`navbar ${isScrolled || !isLanding ? 'scrolled' : ''}`} style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zOrder: 2000,
            transition: 'var(--transition)',
            background: (isScrolled || !isLanding || isMobileMenuOpen) ? 'rgba(255, 255, 255, 0.98)' : 'transparent',
            backdropFilter: (isScrolled || !isLanding || isMobileMenuOpen) ? 'blur(10px)' : 'none',
            borderBottom: (isScrolled || !isLanding) ? '1px solid var(--border)' : 'none'
        }}>
            <div style={{
                width: '100%',
                maxWidth: 'var(--max-content-width)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 2rem'
            }}>
                <Link to="/" style={{ textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
                    <Logo size={28} />
                </Link>

                {/* Desktop Links */}
                {!user && (
                    <div className="hide-mobile" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                        <Link to="/#how-it-works" style={{ textDecoration: 'none', color: '#1e293b', fontWeight: 600, fontSize: '0.9rem' }}>How it works</Link>
                        <Link to="/#qa" style={{ textDecoration: 'none', color: '#1e293b', fontWeight: 600, fontSize: '0.9rem' }}>QA</Link>
                        <Link to="/#success-stories" style={{ textDecoration: 'none', color: '#1e293b', fontWeight: 600, fontSize: '0.9rem' }}>Success stories</Link>
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* User Profile / Auth Links */}
                    <div className="hide-mobile">
                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <Link to="/notifications" title="Notifications" style={{ color: 'inherit', position: 'relative' }}>
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '-5px',
                                            right: '-5px',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            fontSize: '0.6rem',
                                            fontWeight: 800,
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </Link>
                                <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>Dashboard</Link>
                                <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.6rem' }}><LogOut size={18} /></button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Link to="/login" className="btn" style={{ background: 'var(--bg-tertiary)', color: 'var(--text)', padding: '0.6rem 1.5rem' }}>Login</Link>
                                <Link to="/login?mode=signup" className="btn btn-primary" style={{ background: 'var(--primary-dark)', color: 'white', padding: '0.6rem 1.75rem' }}>Get Started</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        className="show-mobile-flex"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        style={{
                            background: 'var(--bg-tertiary)',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '12px',
                            color: 'var(--primary-dark)',
                            cursor: 'pointer'
                        }}
                    >
                        {isMobileMenuOpen ? <Sun size={24} /> : <Home size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div style={{
                    position: 'fixed',
                    top: '5rem',
                    left: 0,
                    width: '100%',
                    background: 'white',
                    padding: '2rem',
                    borderBottom: '1px solid var(--border)',
                    boxShadow: '0 20px 25px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    zIndex: 1999
                }}>
                    {!user ? (
                        <>
                            <Link to="/#how-it-works" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: '#1e293b', fontWeight: 700, fontSize: '1.1rem' }}>How it works</Link>
                            <Link to="/#qa" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: '#1e293b', fontWeight: 700, fontSize: '1.1rem' }}>QA</Link>
                            <Link to="/#success-stories" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: '#1e293b', fontWeight: 700, fontSize: '1.1rem' }}>Success stories</Link>
                            <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn" style={{ justifyContent: 'center', background: 'var(--bg-tertiary)' }}>Login</Link>
                            <Link to="/login?mode=signup" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-primary" style={{ justifyContent: 'center' }}>Get Started</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 700, fontSize: '1.1rem' }}>Dashboard</Link>
                            <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 700, fontSize: '1.1rem' }}>Profile</Link>
                            <Link to="/notifications" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 700, fontSize: '1.1rem' }}>Notifications</Link>
                            <button onClick={handleLogout} className="btn" style={{ color: '#ef4444', fontWeight: 700 }}><LogOut size={18} /> Sign Out</button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
