import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

const Layout = ({ children }) => {
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Define paths that use the dashboard layout
    const dashboardPaths = [
        '/dashboard', '/discover', '/profile', '/messages',
        '/notifications', '/my-mentees', '/sessions', '/settings', '/availability'
    ];

    // Check if current path starts with any of the dashboard paths
    const isDashboard = dashboardPaths.some(path => location.pathname.startsWith(path));

    const toggleSidebar = () => {
        if (window.innerWidth <= 768) {
            setIsMobileSidebarOpen(!isMobileSidebarOpen);
        } else {
            setSidebarCollapsed(!sidebarCollapsed);
        }
    };

    // Close mobile sidebar on navigation
    React.useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [location.pathname]);

    if (isDashboard) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc', overflowX: 'hidden', position: 'relative' }}>
                {/* Mobile Overlay */}
                {isMobileSidebarOpen && (
                    <div
                        onClick={() => setIsMobileSidebarOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 95,
                            transition: '0.3s'
                        }}
                    />
                )}

                <Sidebar
                    collapsed={sidebarCollapsed}
                    isMobileOpen={isMobileSidebarOpen}
                    onCloseMobile={() => setIsMobileSidebarOpen(false)}
                />
                <div style={{
                    flex: 1,
                    marginLeft: window.innerWidth <= 768 ? '0' : (sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'),
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'var(--transition)',
                    width: window.innerWidth <= 768 ? '100%' : `calc(100% - ${sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'})`
                }}>
                    <DashboardHeader onToggleSidebar={toggleSidebar} isSidebarCollapsed={sidebarCollapsed} />
                    <main style={{
                        flex: 1,
                        padding: window.innerWidth <= 768 ? '1.5rem 1rem' : '2.5rem 3rem',
                        maxWidth: 'var(--max-content-width)',
                        width: '100%',
                        margin: '0 auto'
                    }}>
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    // Public / Landing Page Layout
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{
                flex: 1,
                padding: location.pathname === '/' ? '0' : '7rem 2rem 2rem 2rem',
                maxWidth: '1300px',
                width: '100%',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
