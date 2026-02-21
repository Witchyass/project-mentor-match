import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Search,
    MessageSquare,
    User,
    Bell,
    Settings,
    LogOut,
    Calendar,
    Users,
    Clock,
    Inbox
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const Sidebar = ({ collapsed }) => {
    const { profile, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const mentorItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/dashboard' },
        { name: 'Incoming Requests', icon: <Inbox size={22} />, path: '/notifications?tab=requests' },
        { name: 'My Mentees', icon: <Users size={22} />, path: '/my-mentees' },
        { name: 'Sessions', icon: <Calendar size={22} />, path: '/sessions' },
        { name: 'Availability', icon: <Clock size={22} />, path: '/availability' },
        { name: 'Messages', icon: <MessageSquare size={22} />, path: '/messages' },
    ];

    const menteeItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/dashboard' },
        { name: 'Find Mentors', icon: <Search size={22} />, path: '/discover' },
        { name: 'My Sessions', icon: <Calendar size={22} />, path: '/sessions' },
        { name: 'Messages', icon: <MessageSquare size={22} />, path: '/messages' },
    ];

    const commonItems = [
        { name: 'Profile', icon: <User size={22} />, path: '/profile' },
        { name: 'Notifications', icon: <Bell size={22} />, path: '/notifications' },
        { name: 'Settings', icon: <Settings size={22} />, path: '/settings' },
    ];

    const menuItems = profile?.role === 'mentor' ? [...mentorItems, ...commonItems] : [...menteeItems, ...commonItems];

    return (
        <aside style={{
            width: collapsed ? '80px' : '280px',
            background: 'white',
            borderRight: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            padding: collapsed ? '1.5rem 0.75rem' : '1.5rem',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 100,
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflowY: 'auto',
            overflowX: 'hidden'
        }}>
            {/* Logo */}
            <div style={{
                marginBottom: '2.5rem',
                paddingLeft: collapsed ? '0' : '0.75rem',
                display: 'flex',
                justifyContent: collapsed ? 'center' : 'flex-start',
                transition: '0.3s'
            }}>
                <Logo size={28} showText={!collapsed} />
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path.includes('?') && location.pathname + location.search === item.path);
                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                gap: '1rem',
                                padding: '0.85rem 1rem',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                color: isActive ? '#1e3a8a' : '#64748b',
                                background: isActive ? '#eff6ff' : 'transparent',
                                fontWeight: isActive ? 800 : 600,
                                fontSize: '0.95rem',
                                transition: '0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <span style={{
                                color: isActive ? '#2563eb' : 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '22px'
                            }}>
                                {item.icon}
                            </span>
                            {!collapsed && <span>{item.name}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                style={{
                    marginTop: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: '1rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'transparent',
                    color: '#ef4444',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: '0.2s',
                    width: '100%'
                }}
            >
                <LogOut size={22} />
                {!collapsed && <span>Sign Out</span>}
            </button>
        </aside>
    );
};

export default Sidebar;
