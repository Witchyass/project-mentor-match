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

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!user) return;
        console.log('🔔 Navbar: Subscribing to notifications for user:', user.uid);
        const unsubscribe = subscribeToNotifications(user.uid, (notifs) => {
            console.log('📬 Navbar: Received', notifs.length, 'notifications');
            const unread = notifs.filter(n => !n.read).length;
            console.log('🔴 Navbar: Unread count:', unread);
            setUnreadCount(unread);
        });
        return () => unsubscribe();
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    const isLanding = location.pathname === '/';

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
            zIndex: 2000,
            transition: 'var(--transition)',
            background: isScrolled || !isLanding ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
            backdropFilter: isScrolled || !isLanding ? 'blur(10px)' : 'none',
            borderBottom: isScrolled || !isLanding ? '1px solid var(--border)' : 'none'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '1300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 2rem'
            }}>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <Logo size={28} />
                </Link>

                {!user && (
                    <div className="nav-links" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                        <Link to="/#how-it-works" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 500, fontSize: '0.9rem' }}>How it works</Link>
                        <Link to="/#qa" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 500, fontSize: '0.9rem' }}>QA</Link>
                        <Link to="/#success-stories" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 500, fontSize: '0.9rem' }}>Success stories</Link>
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                        <>
                            <Link to="/login" className="btn" style={{ background: 'var(--bg-tertiary)', color: 'var(--text)', padding: '0.6rem 1.5rem' }}>Login</Link>
                            <Link to="/login" className="btn btn-primary" style={{ background: 'var(--primary-dark)', color: 'white', padding: '0.6rem 1.75rem' }}>Get Started</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
